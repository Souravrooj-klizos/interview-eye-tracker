import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Interview from "@/models/Interview";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { interviewId, time, reason } = await request.json();
    
    if (!interviewId || time === undefined || !reason) {
      return NextResponse.json(
        { error: "Interview ID, time, and reason are required" },
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

    // Add warning to the interview
    interview.warnings.push({
      time,
      reason
    });

    await interview.save();

    return NextResponse.json({
      success: true,
      warningCount: interview.warnings.length,
      warning: { time, reason }
    });

  } catch (error) {
    console.error("Error logging warning:", error);
    return NextResponse.json(
      { error: "Failed to log warning" },
      { status: 500 }
    );
  }
}
