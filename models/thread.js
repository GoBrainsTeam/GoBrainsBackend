import mongoose from "mongoose";
const { Schema, model } = mongoose;

const ThreadSchema = new Schema(
  {
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      required: true
    },
    tag: {
      type: String,
    },
    subtag: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  }
);

export default model("Thread", ThreadSchema);