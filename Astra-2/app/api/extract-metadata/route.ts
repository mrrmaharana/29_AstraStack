import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { extractMetadataWithExiftool, parseExiftoolData, calculateRiskScore } from "@/lib/exiftoolService";
import sharp from "sharp";

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

    try {
      await writeFile(tempPath, buffer);

      // Get image dimensions using sharp
      let metadata: any = {};
      try {
        const image = sharp(buffer);
        metadata = await image.metadata();
      } catch (err) {
        console.warn("Sharp metadata extraction failed:", err);
        // Continue with empty metadata
      }

      // Extract metadata with exiftool
      let exiftoolData: any = {};
      try {
        exiftoolData = await extractMetadataWithExiftool(tempPath);
      } catch (err) {
        console.warn("ExifTool extraction failed, using fallback:", err);
        exiftoolData = {};
      }

      // Parse exiftool data
      const parsedMetadata = parseExiftoolData(exiftoolData);

      // Calculate risk score
      const { riskScore, riskLevel, recommendations } = calculateRiskScore(parsedMetadata);

      // Generate hex preview from buffer
      const hexLines: string[] = [];
      const view = new Uint8Array(buffer);
      for (let i = 0; i < Math.min(160, view.length); i += 16) {
        const chunk = view.slice(i, i + 16);
        const hex = Array.from(chunk)
          .map((b) => b.toString(16).padStart(2, "0").toUpperCase())
          .join(" ");
        hexLines.push(hex);
      }

      const response = {
        filename: file.name,
        fileSize: file.size,
        fileSizeFormatted: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        mimeType: file.type || "image/unknown",
        uploadDate: new Date().toLocaleString(),
        width: metadata.width || 0,
        height: metadata.height || 0,
        ...parsedMetadata,
        hexPreview: hexLines,
        riskLevel,
        riskScore,
        recommendations,
        rawExiftoolData: exiftoolData,
      };

      return NextResponse.json(response);
    } finally {
      // Clean up temp file
      try {
        await unlink(tempPath);
      } catch (err) {
        console.warn("Failed to clean up temp file:", err);
      }
    }
  } catch (error) {
    console.error("Metadata extraction error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to extract metadata" },
      { status: 500 }
    );
  }
}
