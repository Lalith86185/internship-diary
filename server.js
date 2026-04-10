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

const FRONTEND_FOLDER = 'frontened'; 
app.use(express.static(path.join(__dirname, FRONTEND_FOLDER)));

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

app.post('/generate', async (req, res) => {
    const { skills, startDate, endDate } = req.body;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            Generate a professional internship diary from ${startDate} to ${endDate}.
            
            STRICT RULES:
            1. Determine the day of the week for every date. 
            2. If a date is a SUNDAY, SKIP IT ENTIRELY. Do not mention it.
            3. For every other day, use this EXACT format:
               DATE: [YYYY-MM-DD] ([Day Name])
               WORK: [Detailed technical tasks regarding ${skills.join(', ')}]
               LEARN: [Professional takeaway]
            4. No introductory text, no "here is your diary", and no footer text.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        res.json({ result: response.text() });

    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ error: "Failed to generate diary." });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, FRONTEND_FOLDER, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server flying on port ${PORT}`));
