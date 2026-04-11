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

// Match your folder name exactly
const FRONTEND_FOLDER = 'frontened'; 
app.use(express.static(path.join(__dirname, FRONTEND_FOLDER)));

// 1. Force the use of the stable v1 API version
const genAI = new GoogleGenerativeAI(process.env.API_KEY || "");

app.post('/generate', async (req, res) => {
    const { skills, startDate, endDate } = req.body;

    if (!process.env.API_KEY) {
        return res.status(500).json({ error: "API_KEY is missing from Render environment." });
    }

    try {
        /**
         * 2026 MODEL SELECTION:
         * 'gemini-2.5-flash' is the stable standard for high-volume free tier.
         * 'gemini-3-flash-preview' is also available but requires v1beta.
         */
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
        You are a professional internship coordinator. 
        Generate a daily internship diary from ${startDate} to ${endDate} focused on these skills: ${skills.join(', ')}.
        
        STRICT CALENDAR RULES:
        1. Determine the day of the week for every date.
        2. If a date is a SUNDAY, SKIP IT. Do not mention it at all.
        3. Only provide entries for Monday through Saturday.
        
        STRICT FORMATTING RULES (CRITICAL FOR PARSING):
        For every valid day, use this EXACT structure:
        
        DATE: [YYYY-MM-DD] ([Day Name])
        WORK: [A concise, professional 2-sentence summary of technical tasks performed using ${skills.join(' and ')}]
        LEARN: [A specific professional outcome or technical insight gained]
        
        DO NOT:
        - Do not use markdown bolding (no ** symbols).
        - Do not combine WORK and LEARN on the same line.
        - Do not add any introductory text like "Sure, here is your diary."
        - Do not add a concluding "Hope this helps."
        
        Only output the raw entries following the pattern above.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        res.json({ result: response.text() });

    } catch (error) {
        console.error("API ERROR:", error.message);
        
        // Final fallback: if 2.5 fails, try the older 'gemini-pro' string 
        // which Google keeps as a permanent alias.
        res.status(500).json({ 
            error: "Model Connection Failed", 
            details: error.message 
        });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, FRONTEND_FOLDER, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server Live on Port ${PORT}`);
    console.log(`✅ Using Stable Gemini 2.5 Flash Endpoint`);
});
