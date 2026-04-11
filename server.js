import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai'; // Matches your package.json

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Set this to your frontend folder name
const FRONTEND_FOLDER = 'frontened'; 
app.use(express.static(path.join(__dirname, FRONTEND_FOLDER)));

// Initialize with the new 2026 SDK syntax
const client = new GoogleGenAI({ apiKey: process.env.API_KEY });

app.post('/generate', async (req, res) => {
    const { skills, startDate, endDate } = req.body;
    try {
        const model = "gemini-3.1-flash-lite"; // 2026 Stable Model

        const prompt = `Generate an internship diary from ${startDate} to ${endDate}. Skip Sundays. 
        Format:
        DATE: YYYY-MM-DD
        WORK: [Summary of ${skills}]
        LEARN: [Outcome of ${skills}]`;

        const result = await client.models.generateContent({
            model: model,
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });

        res.json({ result: result.response.text() });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, FRONTEND_FOLDER, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server active on port ${PORT}`));
