import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Interview from "@/models/Interview";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { interviewId } = await request.json();
    
    if (!interviewId) {
      return NextResponse.json(
        { error: "Interview ID is required" },
        { status: 400 }
      );
    }

    const interview = await Interview.findById(interviewId);
    
    if (!interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    if (interview.status !== 'active') {
      return NextResponse.json(
        { error: "Interview is not active" },
        { status: 400 }
      );
    }

    interview.endedAt = new Date();
    interview.status = 'completed';
    
    await interview.save();

    return NextResponse.json({
      success: true,
      interviewId: interview._id,
      endedAt: interview.endedAt,
      duration: interview.endedAt.getTime() - interview.startedAt.getTime(),
      warningsCount: interview.warnings.length
    });

  } catch (error) {
    console.error("Error ending interview:", error);
    return NextResponse.json(
      { error: "Failed to end interview" },
      { status: 500 }
    );
  }
}
