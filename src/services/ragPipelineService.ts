import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export class RagPipelineService {
    private static tempDir = path.join(__dirname, '../../temp');
    private static pipelineScript = path.join(__dirname, '../../ai_pipeline/rag_pipeline.py');

    /**
     * Processes a Base64 PDF using the Python RAG pipeline.
     * Returns an array of chunks with embeddings.
     */
    static async processEventPdf(pdfBase64: string): Promise<any[]> {
        console.log('🚀 Starting RAG Pipeline processing...');

        // Ensure temp directory exists
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }

        const timestamp = Date.now();
        const inputPath = path.join(this.tempDir, `event_${timestamp}.pdf`);
        const outputPath = path.join(this.tempDir, `embeddings_${timestamp}.json`);

        try {
            // 1. Write Base64 to file
            console.log(`📄 Writing temporary PDF to: ${inputPath}`);

            // Clean base64 string
            const base64Data = pdfBase64.includes(',') ? pdfBase64.split(',')[1] : pdfBase64;
            const buffer = Buffer.from(base64Data, 'base64');

            fs.writeFileSync(inputPath, buffer);

            // 2. Run Python Script
            // Ensure we use the python environment where dependencies are installed
            // Assuming 'python' is in PATH and has the deps (verified in previous steps)
            const command = `python "${this.pipelineScript}" "${inputPath}" "${outputPath}"`;
            console.log(`🐍 Executing Python pipeline: ${command}`);

            const { stdout, stderr } = await execPromise(command);

            if (stdout) console.log(`[Python Output]: ${stdout.substring(0, 200)}...`);

            if (stderr) console.error(`[Python Stderr]: ${stderr}`);

            // 3. Read Output
            if (!fs.existsSync(outputPath)) {
                throw new Error("Pipeline finished but output file was not created.");
            }

            console.log(`📖 Reading embeddings from: ${outputPath}`);
            const rawData = fs.readFileSync(outputPath, 'utf-8');
            const data = JSON.parse(rawData);

            // 4. Map to Schema format
            const chunks = data.map((item: any) => ({
                chunkId: item.id,
                text: item.text,
                embedding: item.embedding
            }));

            console.log(`✅ RAG Pipeline completed. Generated ${chunks.length} chunks.`);
            return chunks;

        } catch (error) {
            console.error("❌ RAG Pipeline failed:", error);
            throw error;
        } finally {
            // 5. Cleanup
            console.log("🧹 Cleaning up temporary files...");
            try {
                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            } catch (cleanupError) {
                console.error("Warning: Failed to cleanup temp files:", cleanupError);
            }
        }
    }
}
