import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Interview from "@/models/Interview";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if there's already an active interview for this user
    const existingInterview = await Interview.findOne({
      userId,
      status: 'active'
    });

    if (existingInterview) {
      return NextResponse.json(
        { error: "User already has an active interview" },
        { status: 409 }
      );
    }

    const interview = new Interview({
      userId,
      startedAt: new Date(),
      status: 'active',
      warnings: []
    });

    await interview.save();

    return NextResponse.json({
      success: true,
      interviewId: interview._id,
      startedAt: interview.startedAt
    });

  } catch (error) {
    console.error("Error starting interview:", error);
    return NextResponse.json(
      { error: "Failed to start interview" },
      { status: 500 }
    );
  }
}
