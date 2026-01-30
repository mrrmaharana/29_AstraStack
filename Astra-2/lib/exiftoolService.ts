import { execFile } from "child_process";
import path from "path";
import fs from "fs";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const EXIFTOOL_PATH = path.join(
  process.cwd(),
  "exiftool-13.47_64",
  "exiftool-13.47_64",
  "exiftool(-k).exe"
).replace(/\(/g, '^(').replace(/\)/g, '^)'); // Escape parentheses for Windows

export interface ExiftoolMetadata {
  [key: string]: any;
}

export async function extractMetadataWithExiftool(
  filePath: string
): Promise<ExiftoolMetadata> {
  try {
    // Check if exiftool executable exists
    if (!fs.existsSync(EXIFTOOL_PATH)) {
      throw new Error(`ExifTool not found at ${EXIFTOOL_PATH}`);
    }

    // Run exiftool with JSON output
    const { stdout, stderr } = await execFileAsync(EXIFTOOL_PATH, [
      "-json",
      filePath,
    ]);

    if (stderr) {
      console.warn("ExifTool stderr:", stderr);
    }

    // Parse JSON output
    const metadata = JSON.parse(stdout);

    // Return first object if array
    return Array.isArray(metadata) ? metadata[0] : metadata;
  } catch (error) {
    console.error("ExifTool extraction error:", error);
    throw error;
  }
}

export function parseExiftoolData(rawMetadata: ExiftoolMetadata): {
  camera?: {
    make: string;
    model: string;
    lens?: string;
    serial?: string;
  };
  capture?: {
    shutter: string;
    aperture: string;
    iso: number;
    focalLength: string;
    flash: boolean;
    whiteBalance: string;
    dateTime: string;
  };
  gps?: {
    latitude: number;
    longitude: number;
    altitude?: number;
    accuracy?: number;
  };
  forensic?: {
    compression: number;
    colorSpace: string;
    orientation: string;
    hasExif: boolean;
    thumbnail: boolean;
    edits: string[];
  };
} {
  const result: any = {};

  // Camera information
  if (rawMetadata.Make || rawMetadata.Model) {
    result.camera = {
      make: rawMetadata.Make || "Unknown",
      model: rawMetadata.Model || "Unknown",
      lens: rawMetadata.LensModel || rawMetadata["Lens"] || undefined,
      serial: rawMetadata.SerialNumber
        ? "[REDACTED FOR PRIVACY]"
        : undefined,
    };
  }

  // Capture settings
  if (
    rawMetadata.ExposureTime ||
    rawMetadata.FNumber ||
    rawMetadata.ISO ||
    rawMetadata.FocalLength ||
    rawMetadata.Flash ||
    rawMetadata.WhiteBalance ||
    rawMetadata.DateTimeOriginal
  ) {
    result.capture = {
      shutter: rawMetadata.ExposureTime
        ? `1/${Math.round(1 / parseFloat(rawMetadata.ExposureTime))}s`
        : "Unknown",
      aperture: rawMetadata.FNumber
        ? parseFloat(rawMetadata.FNumber).toFixed(1)
        : "Unknown",
      iso: parseInt(rawMetadata.ISO) || 0,
      focalLength:
        rawMetadata.FocalLength ||
        rawMetadata["Focal Length"] ||
        "Unknown",
      flash: rawMetadata.Flash?.includes("Fired") || false,
      whiteBalance: rawMetadata.WhiteBalance || "Auto",
      dateTime: rawMetadata.DateTimeOriginal || rawMetadata.CreateDate || "Unknown",
    };
  }

  // GPS data
  if (rawMetadata.GPSLatitude || rawMetadata.GPSLongitude) {
    result.gps = {
      latitude: parseFloat(rawMetadata.GPSLatitude) || 0,
      longitude: parseFloat(rawMetadata.GPSLongitude) || 0,
      altitude: rawMetadata.GPSAltitude
        ? parseFloat(rawMetadata.GPSAltitude)
        : undefined,
      accuracy: rawMetadata.GPSAccuracy
        ? parseFloat(rawMetadata.GPSAccuracy)
        : undefined,
    };
  }

  // Forensic indicators
  result.forensic = {
    compression: rawMetadata.Compression
      ? parseInt(rawMetadata.Compression)
      : 85,
    colorSpace: rawMetadata.ColorSpaceData || rawMetadata["Color Space"] || "sRGB",
    orientation: rawMetadata.Orientation || "Normal",
    hasExif: !!rawMetadata.ExifByteOrder,
    thumbnail: !!rawMetadata.ThumbnailImage,
    edits: [],
  };

  return result;
}

export function calculateRiskScore(metadata: any): {
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  recommendations: string[];
} {
  let riskScore = 0;
  const recommendations: string[] = [];

  if (metadata.gps) {
    riskScore += 40;
    recommendations.push(
      "GPS coordinates embedded - removes your location privacy"
    );
  }

  if (metadata.camera) {
    riskScore += 10;
    recommendations.push(
      "Camera model identified - can link to specific device"
    );
  }

  if (metadata.capture) {
    riskScore += 5;
    recommendations.push(
      "Timestamp embedded - reveals when photo was taken"
    );
  }

  // Check for edited indicators
  if (metadata.forensic?.edits?.length > 0) {
    riskScore += 15;
    recommendations.push(
      "Image has been edited - metadata may not be consistent"
    );
  }

  if (riskScore === 0) {
    recommendations.push("No sensitive metadata detected");
    recommendations.push("Safe to share on public platforms");
  } else {
    recommendations.push("Use ExifTool or online tools to remove EXIF data");
    recommendations.push(
      "Consider uploading to platforms that auto-strip metadata"
    );
  }

  const riskLevel: "LOW" | "MEDIUM" | "HIGH" =
    riskScore > 40 ? "HIGH" : riskScore > 10 ? "MEDIUM" : "LOW";

  return { riskScore, riskLevel, recommendations };
}
