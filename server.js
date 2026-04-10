import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Verify this matches your frontend folder name on GitHub exactly
const FRONTEND_FOLDER = 'frontened'; 
app.use(express.static(path.join(__dirname, FRONTEND_FOLDER)));

// Initialize AI with an empty string fallback to prevent crash
const genAI = new GoogleGenerativeAI(process.env.API_KEY || "");

app.post('/generate', async (req, res) => {
    const { skills, startDate, endDate } = req.body;

    if (!process.env.API_KEY || process.env.API_KEY.length < 10) {
        return res.status(500).json({ 
            error: "API_KEY missing", 
            details: "The API Key is not set in Render Environment Variables." 
        });
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            Generate a professional internship diary from ${startDate} to ${endDate}.
            STRICT RULES:
            1. Check every date. If it is a SUNDAY, SKIP IT ENTIRELY.
            2. For all other days, use this format:
               DATE: [YYYY-MM-DD]
               WORK: [Task summary for ${skills.join(', ')}]
               LEARN: [Professional outcome]
            3. No intro or outro text.
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        res.json({ result: text });

    } catch (error) {
        console.error("DETAILED ERROR:", error);
        res.status(500).json({ 
            error: "Google AI Error", 
            details: error.message 
        });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, FRONTEND_FOLDER, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server flying on port ${PORT}`));
