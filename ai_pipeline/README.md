# Event PDF RAG Pipeline

This directory contains a specialized pipeline for processing Event PDFs into clean, token-efficient embeddings.

## Components

- **Extractor (`extract_text`)**: Uses `PyMuPDF` (fitz) to extract text while preserving natural reading order. It ignores images to keep the focus on textual content.
- **Cleaner (`clean_text`)**: A strict regex-based cleaner that removes:
    - Page numbers and headers/footers (repetitive noise).
    - Decorative separators and excessive whitespace.
    - Copyright notices.
- **Chunker (`chunk_text`)**: Uses `langchain`'s token-aware splitter to create semantic chunks (500-700 tokens) with overlap, ensuring context isn't lost at boundaries.
- **Embedder (`create_embeddings`)**: Generates vector embeddings for each chunk using Google's Gemini models (`text-embedding-004`).

## Why this approach?

### 1. Reduces Token Cost
By aggressively cleaning noise *before* chunking and embedding, we ensure we aren't paying to embed repetitive headers, page numbers, or empty space.
- **Benefit**: Lower API costs and smaller vector storage requirements.

### 2. Improves Retrieval Accuracy (RAG)
Vector search relies on semantic similarity. Noise dilutes the meaning of a chunk.
- **Problem**: If every chunk says "Page 1 of 5 ... Event Details", the embedding engine might overly weigh "Page 1" similarity rather than the actual event details.
- **Solution**: Cleaning ensures the embedding represents only the *content* of the event, leading to more accurate search results.
- **Chunking**: Sentence-aware, token-based chunking ensures complete thoughts are captured, avoiding split contexts that confuse the LLM during generation.
