import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { YoutubeTranscript } from "youtube-transcript";
import { WORDS } from "@/lib/words";
import { extractVideoId, wordBoundaryRegex } from "@/lib/youtube";

type Video = {
  title: string;
  date: string;
  type: string;
  words: string[];
};

async function wordsFromTranscript(videoId: string): Promise<string[]> {
  const transcript = await YoutubeTranscript.fetchTranscript(videoId);
  const fullText = transcript.map((entry) => entry.text).join(" ");
  return WORDS.filter((word) => wordBoundaryRegex(word).test(fullText));
}

const filePath = path.join(process.cwd(), "app/data/mrbeast.json");

function ensureFile() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
  }
}

function readVideos(): Video[] {
  ensureFile();
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

function writeVideos(videos: Video[]) {
  fs.writeFileSync(filePath, JSON.stringify(videos, null, 2));
}

export async function GET() {
  try {
    const videos = readVideos();
    return NextResponse.json(videos);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load videos" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, type, date, words, youtubeUrl } = body;

    if (!title || !type || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let resolvedWords: string[] = words ?? [];

    if (youtubeUrl) {
      const videoId = extractVideoId(youtubeUrl);
      if (!videoId) {
        return NextResponse.json(
          { error: "Invalid YouTube URL or video ID" },
          { status: 400 }
        );
      }
      try {
        resolvedWords = await wordsFromTranscript(videoId);
      } catch (transcriptError) {
        return NextResponse.json(
          {
            error: `Failed to fetch transcript: ${
              transcriptError instanceof Error
                ? transcriptError.message
                : "Unknown error"
            }`,
          },
          { status: 502 }
        );
      }
    }

    if (!resolvedWords || resolvedWords.length === 0) {
      return NextResponse.json(
        {
          error: youtubeUrl
            ? "No tracked words found in video transcript"
            : "Missing required fields",
        },
        { status: 400 }
      );
    }

    const videos = readVideos();

    if (videos.some((v) => v.title.toLowerCase() === title.toLowerCase())) {
      return NextResponse.json(
        { error: "Video already exists" },
        { status: 400 }
      );
    }

    const newVideo: Video = { title, type, date, words: resolvedWords };
    videos.push(newVideo);
    writeVideos(videos);

    return NextResponse.json({ success: true, words: resolvedWords });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save video" },
      { status: 500 }
    );
  }
}