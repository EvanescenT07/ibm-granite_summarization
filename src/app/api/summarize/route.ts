import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authentication } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

import Replicate from "replicate";

// Initialize Replicate
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

if (!process.env.REPLICATE_API_TOKEN) {
  throw new Error("REPLICATE_API_TOKEN is not set");
}

// GET method for testing
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authentication);

    return NextResponse.json({
      message: "Summarize API is working",
      authenticated: !!session,
      user: session?.user || null,
      method: "GET",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error checking authentication",
        error: String(error),
      },
      { status: 500 }
    );
  }
}

// Text extraction function - supports only DOCX and TXT
async function extractText(file: File): Promise<string> {
  console.log(
    `Extracting text from file: ${file.name}, type: ${file.type}, size: ${file.size}`
  );

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileExtension = file.name
    .toLowerCase()
    .substring(file.name.lastIndexOf("."));

  try {
    // TXT - Simplest case
    if (file.type.includes("text/plain") || fileExtension === ".txt") {
      console.log("Processing TXT file...");
      const text = buffer.toString("utf-8");
      console.log("TXT parsed successfully, text length:", text.length);
      return text;
    }

    // DOCX - Usually works well
    if (
      file.type.includes(
        "vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) ||
      fileExtension === ".docx"
    ) {
      try {
        console.log("Processing DOCX file...");
        const mammoth = (await import("mammoth")).default;
        const { value } = await mammoth.extractRawText({ buffer });
        console.log(
          "DOCX parsed successfully, text length:",
          value?.length || 0
        );
        return value || "No text found in DOCX";
      } catch (docxError) {
        console.error("DOCX parsing error:", docxError);
        throw new Error(
          `Failed to parse DOCX: ${
            docxError instanceof Error
              ? docxError.message
              : "Unknown DOCX error"
          }`
        );
      }
    }

    throw new Error(
      `Unsupported file type: ${file.type}. Supported: DOCX, TXT`
    );
  } catch (error) {
    console.error(`Error extracting text from ${file.type}:`, error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  let documentRecord;

  try {
    console.log("POST /api/summarize called");

    // Check authentication
    const session = await getServerSession(authentication);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get form data with enhanced error handling
    let formData;
    let file;

    try {
      formData = await req.formData();
      file = formData.get("file") as File;
    } catch (formError) {
      console.error("FormData parsing error:", formError);
      return NextResponse.json(
        {
          message:
            "Failed to parse form data. File might be too large or corrupted.",
          error:
            formError instanceof Error
              ? formError.message
              : "Unknown form parsing error",
        },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      );
    }

    console.log("File received:", {
      name: file.name,
      size: file.size,
      type: file.type || "unknown",
    });

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { message: "File size too large. Maximum 10MB allowed." },
        { status: 413 }
      );
    }

    // Validate file type - only DOCX, TXT
    const supportedExtensions = [".docx", ".txt"];
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));

    if (!supportedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        {
          message: `Unsupported file type. Supported formats: ${supportedExtensions.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    // Create document record
    documentRecord = await prisma.document.create({
      data: {
        fileName: file.name,
        userId: session.user.id,
        status: "PROCESSING",
        summary: "",
      },
    });

    console.log("Document record created:", documentRecord.id);

    // Extract text
    console.log("Starting text extraction...");
    const fullText = await extractText(file);
    console.log("Text extraction completed, length:", fullText.length);

    if (!fullText || fullText.trim().length < 50) {
      await prisma.document.update({
        where: { id: documentRecord.id },
        data: {
          status: "FAILED",
          summary: "Insufficient text content found in the file",
        },
      });

      return NextResponse.json(
        {
          success: false,
          message:
            "No sufficient text content found in the file. Minimum 50 characters required.",
          error: "Text too short or empty",
          extractedLength: fullText?.length || 0,
        },
        { status: 400 }
      );
    }

    // Prepare text for summarization
    const maxLength = 45000;
    const textToSummarize =
      fullText.length > maxLength
        ? fullText.substring(0, maxLength) + "..."
        : fullText;

    const prompt = `
Tugas: Buat ringkasan yang komprehensif dan terstruktur dari dokumen berikut.

Instruksi:
1. Identifikasi dan rangkum ide-ide utama dan poin-poin penting
2. Susun dalam format paragraf yang jelas dan mudah dibaca
3. Gunakan bahasa yang sesuai dengan dokumen asli
4. Buat ringkasan sekitar 15-25% dari panjang teks asli
5. Fokus pada informasi yang paling relevan dan penting

DOKUMEN UNTUK DIRINGKAS:
---
${textToSummarize}
---

Berikan ringkasan yang terstruktur, informatif, dan mudah dipahami:`;

    console.log("Calling Replicate API...");
    const model = "ibm-granite/granite-3.3-8b-instruct";
    const output = await replicate.run(model, {
      input: {
        prompt: prompt,
        max_new_tokens: 1024,
        temperature: 0.3,
        top_p: 0.9,
      },
    });

    const summary = Array.isArray(output) ? output.join("") : String(output);
    console.log("Summary generated, length:", summary.length);

    // Update document record with success
    await prisma.document.update({
      where: { id: documentRecord.id },
      data: {
        status: "SUCCESS",
        summary: summary.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      summary: summary.trim(),
      documentId: documentRecord.id,
      fileInfo: {
        name: file.name,
        size: file.size,
        textLength: fullText.length,
        fileType: fileExtension,
      },
    });
  } catch (error) {
    console.error("Error during processing:", error);

    if (documentRecord) {
      try {
        await prisma.document.update({
          where: { id: documentRecord.id },
          data: {
            status: "FAILED",
            summary: `Processing failed: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
          },
        });
      } catch (dbError) {
        console.error("Error updating document status:", dbError);
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Error processing file",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
