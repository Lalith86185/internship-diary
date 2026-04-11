import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend from 'frontened' folder
app.use(express.static(path.join(__dirname, 'frontened')));

const client = new GoogleGenAI({ apiKey: process.env.API_KEY });

app.post('/generate', async (req, res) => {
    const { skills, startDate, endDate } = req.body;
    try {
        const model = "gemini-3.1-flash-lite";
        const prompt = `Generate internship diary from ${startDate} to ${endDate}. Skip Sundays. 
        Format EXACTLY as:
        DATE: YYYY-MM-DD
        WORK: [Summary of ${skills}]
        LEARN: [Outcome of ${skills}]`;

        const result = await client.models.generateContent({
            model: model,
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });
        res.json({ result: result.response.text() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontened', 'index.html'));
});

app.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));
