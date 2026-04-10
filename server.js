import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

app.post('/generate', async (req, res) => {
    const { skills, startDate, endDate } = req.body;

    // --- DEVELOPMENT MODE TOGGLE ---
    // Set to 'true' to skip the API and save your daily quota while testing UI.
    // Set to 'false' when you want real AI generation.
    const DEV_MODE = false; 

    if (DEV_MODE) {
        console.log("Dev Mode: Returning mock data...");
        return res.json({ 
            result: `${startDate}\nWork Summary: Used mock data to test the interface for ${skills.join(', ')}.\nLearning/Outcome: Verified that the copy buttons and layout align correctly.` 
        });
    }

    try {
        // Using 'gemini-2.5-flash-lite' for the highest free-tier limit (1,000 RPD)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

        const prompt = `
            Generate a professional internship diary from ${startDate} to ${endDate}.
            The intern worked on these skills: ${skills.join(', ')}.
            For each day, provide:
            1. Date (YYYY-MM-DD)
            2. Work Summary: A brief description of tasks.
            3. Learning/Outcome: Professional takeaway.
            Format clearly with colons so the frontend can parse it.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ result: text });

    } catch (error) {
        console.error("API Error Details:", error);

        if (error.status === 429) {
            return res.status(429).json({ 
                error: "Daily limit reached for this model. Try switching 'DEV_MODE' to true in server.js to continue testing your UI." 
            });
        }

        res.status(500).json({ error: "Internal Server Error during generation." });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});