import mongoose from "mongoose";
const { Schema, model } = mongoose;

const ScheduleSchema = new Schema(
  {
    schedule: {
      type: String,
      required: true
    },
    grade: {
      type: String,
      required: true
    }
  },
  {
      timestamps: true
  }
);

export default model("Schedule", ScheduleSchema);