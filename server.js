import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

// 1. Setup paths for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

// 2. Middleware
app.use(cors());
app.use(express.json());

// 3. Serve Frontend Files
// This points to your 'frontened' folder for CSS/JS
app.use(express.static(path.join(__dirname, 'frontened')));

// 4. Initialize AI Client
const client = new GoogleGenAI({ apiKey: process.env.API_KEY });

// 5. API Route for Generation
app.post('/generate', async (req, res) => {
    const { skills, startDate, endDate } = req.body;
    try {
        const model = "gemini-3.1-flash-lite"; // 2026 Stable Model

        const prompt = `Generate an internship diary from ${startDate} to ${endDate}. 
        STRICT: Skip Sundays. 
        Format EXACTLY as:
        DATE: YYYY-MM-DD
        WORK: [Technical summary of ${skills.join(', ')}]
        LEARN: [Outcome regarding ${skills.join(', ')}]`;

        const result = await client.models.generateContent({
            model: model,
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });

        res.json({ result: result.response.text() });
    } catch (error) {
        console.error("AI Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// 6. Main Route (Fixes "Cannot GET /")
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontened', 'index.html'));
});

// 7. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📁 Serving frontend from: ${path.join(__dirname, 'frontened')}`);
});
