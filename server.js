import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Setup environment variables
dotenv.config();

// Setup directory paths (required for ES Modules on Render)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// --- CONFIGURATION ---
// IMPORTANT: This must match your folder name on GitHub exactly
const FRONTEND_FOLDER = 'frontened'; 

// Serve all static files (CSS, JS, Images) from your folder
app.use(express.static(path.join(__dirname, FRONTEND_FOLDER)));

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// API Route for generation
app.post('/generate', async (req, res) => {
    const { skills, startDate, endDate } = req.body;

    try {
        // Using Flash-Lite for higher free-tier limits (1000 requests/day)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

        const prompt = `Generate a professional internship diary from ${startDate} to ${endDate}. 
        Skills used: ${skills.join(', ')}. 
        Provide a list with Date, Work Summary, and Learning Outcome for each day.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        res.json({ result: response.text() });

    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ error: "Failed to generate content. Check API Key quota." });
    }
});

// --- THE FIX FOR "Cannot GET /" ---
// This catch-all route sends your index.html whenever someone visits the site
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, FRONTEND_FOLDER, 'index.html'));
});

// Use Render's dynamic port or default to 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
