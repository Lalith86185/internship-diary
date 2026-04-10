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

// Set this to your exact frontend folder name on GitHub
const FRONTEND_FOLDER = 'frontened'; 
app.use(express.static(path.join(__dirname, FRONTEND_FOLDER)));

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

app.post('/generate', async (req, res) => {
    const { skills, startDate, endDate } = req.body;

    if (!process.env.API_KEY) {
        return res.status(500).json({ error: "API_KEY is missing in Render settings." });
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            Generate a professional internship diary from ${startDate} to ${endDate}.
            
            STRICT RULES:
            1. For every date, check the day of the week.
            2. If it is a SUNDAY, SKIP IT ENTIRELY. Do not generate any text for Sundays.
            3. For all other days, use this EXACT format:
               DATE: [YYYY-MM-DD] ([Day Name])
               WORK: [Describe tasks related to ${skills.join(', ')}]
               LEARN: [Describe the professional outcome or takeaway]
            4. No introductory or closing text.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        res.json({ result: response.text() });

    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ error: "Failed to generate. Check your API Key." });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, FRONTEND_FOLDER, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server flying on port ${PORT}`));
