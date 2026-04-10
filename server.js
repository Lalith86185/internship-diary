import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 1. Environment and Path Configuration
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// IMPORTANT: This must match the folder name you uploaded to GitHub exactly.
const FRONTEND_FOLDER = 'frontened'; 

// 2. Serve Frontend Files
app.use(express.static(path.join(__dirname, FRONTEND_FOLDER)));

// 3. Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// 4. AI Generation Route (Strict Sunday Exclusion)
app.post('/generate', async (req, res) => {
    const { skills, startDate, endDate } = req.body;

    try {
        // Use flash-lite for higher daily request limits
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

        const prompt = `
            You are a professional internship diary assistant. 
            Generate daily work entries from ${startDate} to ${endDate} for an intern focused on: ${skills.join(', ')}.

            STRICT CALENDAR RULES:
            - Determine the day of the week for every date in this range.
            - If a date is a SUNDAY, SKIP IT entirely. Do not generate any text for Sundays.
            - Only provide entries for Monday through Saturday.

            FOR EACH VALID DAY, PROVIDE:
            - Date: [YYYY-MM-DD] ([Day Name])
            - Work Summary: [A clear description of professional tasks]
            - Learning/Outcome: [A professional takeaway or skill improved]

            Verify your output: Ensure NO Sundays are included.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ result: text });

    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: "Failed to generate diary. Ensure API Key is set in Render." });
    }
});

// 5. Catch-all Route (Fixes "Cannot GET /" error)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, FRONTEND_FOLDER, 'index.html'));
});

// 6. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});