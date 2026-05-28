import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

type ExportRequestBody = {
  format?: "csv" | "json";
  fileName?: string;
  content?: string;
};

function sanitizeFileName(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(request: Request) {
  const body = (await request.json()) as ExportRequestBody;
  const format = body.format;
  const fileName = body.fileName;
  const content = body.content;

  if (!format || !fileName || typeof content !== "string") {
    return NextResponse.json(
      { error: "Missing format, fileName, or content." },
      { status: 400 }
    );
  }

  if (format !== "csv" && format !== "json") {
    return NextResponse.json({ error: "Invalid format." }, { status: 400 });
  }

  const safeName = sanitizeFileName(fileName);
  const extension = format === "csv" ? ".csv" : ".json";
  const finalName = safeName.endsWith(extension) ? safeName : `${safeName}${extension}`;
  const outputDir = path.join(process.cwd(), "exports");
  const outputPath = path.join(outputDir, finalName);

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, content, "utf8");

  return NextResponse.json({
    success: true,
    savedFile: finalName,
    savedFolder: "exports",
    savedPath: outputPath
  });
}
