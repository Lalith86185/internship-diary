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

// Verify this matches your GitHub folder name
const FRONTEND_FOLDER = 'frontened'; 
app.use(express.static(path.join(__dirname, FRONTEND_FOLDER)));

const genAI = new GoogleGenerativeAI(process.env.API_KEY || "");

app.post('/generate', async (req, res) => {
    const { skills, startDate, endDate } = req.body;

    if (!process.env.API_KEY) {
        return res.status(500).json({ error: "API_KEY missing", details: "Check Render Env Variables." });
    }

    try {
        // Use 'gemini-1.5-flash' - this is the current stable ID
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            Generate an internship diary from ${startDate} to ${endDate}.
            STRICT RULES:
            1. SKIP ALL SUNDAYS. 
            2. For every other day, use this format:
               DATE: [YYYY-MM-DD]
               WORK: [Task for ${skills.join(', ')}]
               LEARN: [Outcome]
            3. No intro/outro text.
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        res.json({ result: text });

    } catch (error) {
        console.error("API ERROR:", error);
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
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
