import os
import re
import fitz  # PyMuPDF
import google.generativeai as genai
from typing import List, Dict, Any
from dotenv import load_dotenv
from langchain_text_splitters import RecursiveCharacterTextSplitter
import warnings

# Suppress warnings from google.generativeai deprecation
warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", category=UserWarning)

# Load environment variables (expecting GEMINI_API_KEY in .env)
# Adjust path to point to Backend/.env if running from this folder
load_dotenv(dotenv_path="../.env")

# Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in environment variables.")

genai.configure(api_key=GEMINI_API_KEY)

def extract_text(pdf_path: str) -> str:
    """
    Extracts text from a PDF using PyMuPDF (fitz).
    Preserves natural reading order.
    """
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF file not found: {pdf_path}")

    doc = fitz.open(pdf_path)
    full_text = []

    for page in doc:
        # get_text("text") extracts text in reading order
        text = page.get_text("text") 
        full_text.append(text)

    return "\n".join(full_text)

def clean_text(text: str) -> str:
    """
    Removes unwanted noise, headers, footers, page numbers, etc.
    Strict rule-based filtering to reduce token usage.
    """
    # 1. Remove Page Numbers (matches "Page 1", "Page 1 of 10", just numbers on own line)
    # Match standalone numbers or "Page X" on a line
    text = re.sub(r'^\s*(Page\s*)?\d+(\s*of\s*\d+)?\s*$', '', text, flags=re.MULTILINE | re.IGNORECASE)
    
    # 2. Remove Separators (---, ***, •••)
    text = re.sub(r'^\s*[-*_•=]{3,}\s*$', '', text, flags=re.MULTILINE)
    
    # 3. Remove Copyright notices (basic patterns)
    text = re.sub(r'^Copyright\s*©?.*$', '', text, flags=re.MULTILINE | re.IGNORECASE)
    text = re.sub(r'^All\s*rights\s*reserved.*$', '', text, flags=re.MULTILINE | re.IGNORECASE)

    # 4. Collapse multiple newlines and spaces to save tokens
    # Replace multiple spaces with single space
    text = re.sub(r'[ \t]+', ' ', text)
    # Replace multiple newlines with double newline (to preserve paragraph structure)
    text = re.sub(r'\n\s*\n+', '\n\n', text)
    
    return text.strip()

def chunk_text(text: str, chunk_size_tokens: int = 600, chunk_overlap_tokens: int = 50) -> List[str]:
    """
    Chunks text by TOKENS using langchain's RecursiveCharacterTextSplitter.
    """
    # Initialize splitter with token-based approximation
    # Note: TextSplitter usually works on characters, but we can use from_tiktoken_encoder
    # or just trust the recursive splitter with a rough char-to-token ratio or use a token-aware split.
    # For "Clean Python Implementation" without heavy tiktoken dependency if possible, 
    # but user requested "Chunk by TOKENS". Best way is to use RecursiveCharacterTextSplitter.from_tiktoken_encoder
    
    splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
        model_name="gpt-4", # Good proxy for token counting
        chunk_size=chunk_size_tokens,
        chunk_overlap=chunk_overlap_tokens,
        separators=["\n\n", "\n", ". ", " ", ""]
    )
    
    chunks = splitter.split_text(text)
    return chunks

def create_embeddings(chunks: List[str]) -> List[Dict[str, Any]]:
    """
    Generates embeddings for each chunk using Gemini.
    """
    embedded_data = []
    
    # Batching could be added here if needed, but simple loop for clarity
    for i, chunk in enumerate(chunks):
        try:
            # Using the embedding model
            result = genai.embed_content(
                model="models/text-embedding-004",
                content=chunk,
                task_type="retrieval_document",
                title=f"Chunk {i}" 
            )
            
            embedding = result['embedding']
            
            embedded_data.append({
                "id": str(i),
                "text": chunk,
                "embedding": embedding
            })
            print(f"Generated embedding for chunk {i} ({len(chunk)} chars)")
            
        except Exception as e:
            print(f"Error embedding chunk {i}: {e}")
            
    return embedded_data

def process_pdf_pipeline(pdf_path: str, output_file: str = "embeddings_output.json"):
    print(f"--- Starting Pipeline for: {pdf_path} ---")
    
    # 1. Extract
    print("1. Extracting text...")
    raw_text = extract_text(pdf_path)
    print(f"   Raw Text: {len(raw_text)} chars")
    
    # 2. Clean
    print("2. Cleaning text...")
    cleaned_text = clean_text(raw_text)
    print(f"   Cleaned Text: {len(cleaned_text)} chars")
    
    # 3. Chunk
    print("3. Chunking text...")
    chunks = chunk_text(cleaned_text)
    print(f"   Total Chunks: {len(chunks)}")
    
    # 4. Embed
    print("4. Creating embeddings...")
    embeddings = create_embeddings(chunks)
    
    # Save/Output
    import json
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(embeddings, f, indent=2)
        
    print(f"--- Pipeline Configured. Output saved to {output_file} ---")
    return embeddings

if __name__ == "__main__":
    # Example usage
    # Replace with an actual PDF path to test
    sample_pdf = "sample_event.pdf"
    output_dest = "embeddings_output.json"
    
    # Check if a file argument is provided
    import sys
    if len(sys.argv) > 1:
        sample_pdf = sys.argv[1]
    
    if len(sys.argv) > 2:
        output_dest = sys.argv[2]
    
    if os.path.exists(sample_pdf):
        process_pdf_pipeline(sample_pdf, output_dest)
    else:
        print(f"File {sample_pdf} not found. Please provide a valid PDF path.") 
