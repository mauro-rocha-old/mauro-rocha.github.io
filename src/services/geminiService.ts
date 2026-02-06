import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAIResponse = async (history: { role: string; text: string }[], userMessage: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return "I'm sorry, my brain (API Key) is missing. Please contact Mauro to fix me!";
  }

  try {
    const model = 'gemini-3-flash-preview';
    
    // Construct the prompt with context
    const systemInstruction = `
      You are the AI Assistant for Mauro Rocha's personal portfolio website.
      Your name is "M-Bot".
      Mauro is a Senior Frontend Engineer and Digital Architect based in Brazil.
      
      Key Info about Mauro:
      - Expertise: React, TypeScript, Next.js, WebGL, AI Integration, UI/UX Design.
      - Experience: 10+ years in web development, working with top tier clients.
      - Vibe: Disruptive, modern, minimalist, perfectionist.
      - Contact: contato@mauro-rocha.com.br
      
      Language Instructions:
      - The default language of the website is Portuguese (PT-BR).
      - If the user writes in Portuguese, REPLY IN PORTUGUESE.
      - If the user writes in English, REPLY IN ENGLISH.
      
      Your tone:
      - Professional but witty.
      - Short, punchy sentences.
      - Confident and helpful.
      
      Goal:
      - Answer questions about Mauro's skills, availability, and projects.
      - Encourage the user to contact him for work.
      - Do not hallucinate projects that aren't real, stick to general impressive descriptions if specific data is missing.
    `;

    const conversation = history.map(h => `${h.role === 'user' ? 'User' : 'M-Bot'}: ${h.text}`).join('\n');
    const prompt = `Conversation History:\n${conversation}\nUser: ${userMessage}\nM-Bot:`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    return response.text || "I'm processing that thought...";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "My circuits are busy right now. Please try again later.";
  }
};