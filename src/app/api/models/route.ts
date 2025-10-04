import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";

export async function GET() {
    try {
        const res = await openai.models.list();

        const models = res.data
            .map((m) => m.id)
            .filter((id) => id.startsWith("gpt-"));

        return NextResponse.json(models);
    } catch (err) {
        console.error("Error fetching models:", err);
        return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 });
    }
}
