import { NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";
import { WORDS } from "@/lib/words";
import { extractVideoId, wordBoundaryRegex } from "@/lib/youtube";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const videoParam = searchParams.get("videoId") ?? searchParams.get("url");

  if (!videoParam) {
    return NextResponse.json(
      { error: "Missing required query parameter: videoId or url" },
      { status: 400 }
    );
  }

  const videoId = extractVideoId(videoParam);
  if (!videoId) {
    return NextResponse.json(
      { error: "Invalid YouTube video ID or URL" },
      { status: 400 }
    );
  }

  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    const fullText = transcript.map((entry) => entry.text).join(" ");

    const matchedWords = WORDS.filter((word) =>
      wordBoundaryRegex(word).test(fullText)
    );

    return NextResponse.json({
      videoId,
      matchedWords,
      totalWords: WORDS.length,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch transcript";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
