import { NextRequest, NextResponse } from "next/server";
import { getMemWal } from "../../lib/memwal";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const groq = createOpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

    
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const mem = getMemWal();

    // Retrieve all user prediction memories from Walrus
    const memories = await mem.recall({
      query: `User ${userId} predictions results wins losses`,
    });

    if (!memories.results || memories.results.length === 0) {
      return NextResponse.json({
        roast: "No predictions yet. Too scared to be wrong?",
        memoriesUsed: 0,
      });
    }

    // Build context from memories
    const memoryContext = memories.results
      .map((m: { text: string }) => m.text)
      .join("\n");

    // Generate roast with Groq
    const { text: roast } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: `You are VAR — Verified Agent Records. You are a sarcastic agent who remembers ALL football predictions ever made by users and your job is to roast them based on their prediction track record.

Prediction track record for user "${userId}" from Walrus Memory:
${memoryContext}

Write a personal, specific, and funny roast based on their prediction patterns. Mention specific teams they predicted. Use casual English. Maximum 3 sentences. The roast must be impossible to generate without seeing this prediction history.`,
    });

    return NextResponse.json({
      roast,
      memoriesUsed: memories.results.length,
      memories: memories.results.map((m: { text: string }) => m.text),
    });

  } catch (error) {
    console.error("Error generating roast:", error);
    return NextResponse.json(
      { error: "Failed to generate roast" },
      { status: 500 }
    );
  }
}