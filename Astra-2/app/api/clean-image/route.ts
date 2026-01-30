import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink, readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const EXIFTOOL_PATH = path.join(
  process.cwd(),
  "exiftool-13.47_64",
  "exiftool-13.47_64",
  "exiftool(-k).exe"
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file is an image
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Create temp directory if it doesn't exist
    const tempDir = path.join(process.cwd(), "temp");
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }

    // Save file temporarily
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const tempPath = path.join(tempDir, `${Date.now()}-${file.name}`);
    const cleanedPath = path.join(tempDir, `${Date.now()}-cleaned-${file.name}`);

    try {
      await writeFile(tempPath, buffer);

      // Check if exiftool exists
      if (!existsSync(EXIFTOOL_PATH)) {
        throw new Error(`ExifTool not found at ${EXIFTOOL_PATH}`);
      }

      // Use exiftool to remove all metadata
      await execFileAsync(EXIFTOOL_PATH, [
        "-all=",
        "-o", cleanedPath,
        tempPath
      ]);

      // Read the cleaned file
      const cleanedBuffer = await readFile(cleanedPath);

      // Return the cleaned file
      return new NextResponse(cleanedBuffer, {
        headers: {
          "Content-Type": file.type,
          "Content-Disposition": `attachment; filename="cleaned-${file.name}"`,
        },
      });
    } finally {
      // Clean up temp files
      try {
        await unlink(tempPath);
        if (existsSync(cleanedPath)) {
          await unlink(cleanedPath);
        }
      } catch (err) {
        console.warn("Failed to clean up temp files:", err);
      }
    }
  } catch (error) {
    console.error("Image cleaning error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to clean image" },
      { status: 500 }
    );
  }
}
