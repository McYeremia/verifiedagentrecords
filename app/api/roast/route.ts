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
        { error: "userId wajib diisi" },
        { status: 400 }
      );
    }

    const mem = getMemWal();

    // Ambil semua memori prediksi user dari Walrus
    const memories = await mem.recall({
      query: `User ${userId} predictions results wins losses`,
    });

    if (!memories.results || memories.results.length === 0) {
      return NextResponse.json({
        roast: "Belum ada prediksi sama sekali. Takut salah, ya?",
        memoriesUsed: 0,
      });
    }

    // Susun konteks dari memori
    const memoryContext = memories.results
      .map((m: { text: string }) => m.text)
      .join("\n");

    // Generate roast dengan Gemini
    const { text: roast } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: `Kamu adalah VAR — Verified Agent Records. Kamu adalah agen sarkastik yang mengingat SEMUA prediksi bola yang pernah dibuat user dan tugasmu adalah me-roast mereka berdasarkan rekam jejak prediksi mereka.

Rekam jejak prediksi user "${userId}" dari Walrus Memory:
${memoryContext}

Buat roast yang personal, spesifik, dan lucu berdasarkan pola prediksi mereka. Sebutkan tim-tim spesifik yang mereka prediksi. Gunakan bahasa Indonesia yang santai. Maksimal 3 kalimat. Jangan generik — roast harus mustahil dibuat tanpa melihat riwayat prediksi ini.`,
    });

    return NextResponse.json({
      roast,
      memoriesUsed: memories.results.length,
      memories: memories.results.map((m: { text: string }) => m.text),
    });

  } catch (error) {
    console.error("Error generating roast:", error);
    return NextResponse.json(
      { error: "Gagal generate roast" },
      { status: 500 }
    );
  }
}