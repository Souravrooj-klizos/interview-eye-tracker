export interface EyeTrackingResult {
  isLookingAway: boolean;
  confidence: number;
  gazeDirection: {
    x: number;
    y: number;
  };
}

export interface InterviewSession {
  id: string;
  userId: string;
  startedAt: Date;
  status: 'active' | 'completed' | 'cancelled';
}

export interface Warning {
  time: number;
  reason: string;
}

export interface MediaPipeResults {
  multiFaceLandmarks?: any[];
}

export interface FaceMeshConfig {
  maxNumFaces: number;
  refineLandmarks: boolean;
  minDetectionConfidence: number;
  minTrackingConfidence: number;
}
