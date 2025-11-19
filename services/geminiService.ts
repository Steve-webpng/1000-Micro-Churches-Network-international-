
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Sermon, Event } from "../types";
import { supabase } from "./supabaseClient";

const API_KEY = process.env.API_KEY || ''; 

// Initialize client only if key exists
const ai = new GoogleGenAI({ apiKey: API_KEY });
const MODEL_NAME = 'gemini-2.5-flash';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const isQuotaError = (error: any) => {
  return error?.status === 429 || error?.code === 429 || error?.message?.includes('429') || error?.message?.includes('quota') || error?.status === 'RESOURCE_EXHAUSTED';
};

async function retryOperation<T>(operation: () => Promise<T>, retries = 1, delayMs = 1000): Promise<T> {
  try { return await operation(); } 
  catch (error: any) {
    if (isQuotaError(error)) throw error;
    if (retries > 0) { await delay(delayMs); return retryOperation(operation, retries - 1, delayMs * 2); }
    throw error;
  }
}

export const getVerseOfDay = async (): Promise<{ verse: string; reference: string }> => {
  const fallback = { verse: "The Lord is my shepherd; I shall not want.", reference: "Psalm 23:1" };
  if (!API_KEY) return fallback;

  try {
    return await retryOperation(async () => {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: "Give me an inspiring Bible verse for a church community app. Return JSON.",
        config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { verse: { type: Type.STRING }, reference: { type: Type.STRING } } } }
      });
      return JSON.parse(response.text || "{}");
    });
  } catch (error) { return fallback; }
};

export const seedSermons = async (): Promise<Sermon[]> => {
  if (!API_KEY) return [];
  try {
    const result = await retryOperation(async () => {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: "Generate 5 fictional Christian sermon titles, speakers, dates, and descriptions.",
        config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, speaker: { type: Type.STRING }, date: { type: Type.STRING }, description: { type: Type.STRING } } } } }
      });
      const raw = JSON.parse(response.text || "[]");
      const sermons = raw.map((item: any, index: number) => ({
        title: item.title,
        speaker: item.speaker,
        date: item.date,
        description: item.description,
        imageUrl: `https://picsum.photos/400/250?random=${index + 10}`
      }));
      // Insert into Supabase
      const { data } = await supabase.from('sermons').insert(sermons).select();
      return data as unknown as Sermon[] || [];
    });
    return result;
  } catch (error) { console.error("Seeding Error", error); return []; }
};

export const seedEvents = async (): Promise<Event[]> => {
  if (!API_KEY) return [];
  try {
    const result = await retryOperation(async () => {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: "Generate 5 fictional upcoming church events.",
        config: { responseMimeType: "application/json", responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, date: { type: Type.STRING }, location: { type: Type.STRING }, description: { type: Type.STRING } } } } }
      });
      const raw = JSON.parse(response.text || "[]");
      const events = raw.map((item: any) => ({ ...item }));
       // Insert into Supabase
      const { data } = await supabase.from('events').insert(events).select();
      return data as unknown as Event[] || [];
    });
    return result;
  } catch (error) { console.error("Seeding Error", error); return []; }
};

export const generatePrayerResponse = async (request: string): Promise<string> => {
  if (!API_KEY) return "Praying for you.";
  try {
    const response = await retryOperation<GenerateContentResponse>(() => ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Write a short, encouraging, faith-based response (max 30 words) to: "${request}"`,
    }));
    return response.text || "Praying for you.";
  } catch (error) { return "We are standing with you in prayer."; }
};
