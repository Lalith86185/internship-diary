import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai'; // MUST match package.json

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const client = new GoogleGenAI({ apiKey: process.env.API_KEY });

app.post('/generate', async (req, res) => {
    const { skills, startDate, endDate } = req.body;
    try {
        const model = "gemini-3.1-flash-lite"; 
        const prompt = `Generate internship diary from ${startDate} to ${endDate}. Skip Sundays. 
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

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));
