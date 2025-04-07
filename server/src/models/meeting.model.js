import mongoose, { Schema } from "mongoose";

const meetingSchema = new Schema(
  {
    user_id: { type: String },
    meeting_code: { type: String, required: true },
    date: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true }
);

const Meeting = mongoose.model("Meeting", meetingSchema);
export { Meeting };
