import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Interview from "@/models/Interview";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const formData = await request.formData();
    const videoFile = formData.get('video') as File;
    const interviewId = formData.get('interviewId') as string;
    
    if (!videoFile || !interviewId) {
      return NextResponse.json(
        { error: "Video file and interview ID are required" },
        { status: 400 }
      );
    }

    // Find the interview
    const interview = await Interview.findById(interviewId);
    
    if (!interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `interview_${interviewId}_${timestamp}.webm`;
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadsDir, fileName);
    
    // Ensure uploads directory exists
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }
    
    // Convert file to buffer and save
    const bytes = await videoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    await writeFile(filePath, buffer);
    
    // Update interview with video URL
    const videoUrl = `/uploads/${fileName}`;
    interview.videoUrl = videoUrl;
    
    if (interview.status === 'active') {
      interview.endedAt = new Date();
      interview.status = 'completed';
    }
    
    await interview.save();

    return NextResponse.json({
      success: true,
      videoUrl,
      fileName,
      fileSize: buffer.length,
      interviewId: interview._id
    });

  } catch (error) {
    console.error("Error uploading video:", error);
    return NextResponse.json(
      { error: "Failed to upload video" },
      { status: 500 }
    );
  }
}

// Configure the API route to handle large files
export const maxDuration = 30;
