import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWarning {
  time: number;
  reason: string;
}

export interface IInterview extends Document {
  userId: string;
  startedAt: Date;
  endedAt?: Date;
  warnings: IWarning[];
  videoUrl?: string;
  status: 'active' | 'completed' | 'cancelled';
}

const WarningSchema = new Schema<IWarning>({
  time: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
}, { _id: false });

const InterviewSchema = new Schema<IInterview>({
  userId: {
    type: String,
    required: true,
  },
  startedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  endedAt: {
    type: Date,
  },
  warnings: {
    type: [WarningSchema],
    default: [],
  },
  videoUrl: {
    type: String,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active',
  },
}, {
  timestamps: true,
});

// Create indexes for better query performance
InterviewSchema.index({ userId: 1, startedAt: -1 });
InterviewSchema.index({ status: 1 });

const Interview: Model<IInterview> = mongoose.models.Interview || mongoose.model<IInterview>("Interview", InterviewSchema);

export default Interview;
