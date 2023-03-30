import mongoose from "mongoose";
const { Schema, model } = mongoose;

const QuestionSchema = new Schema(
  {
    prompt: {
      type: String,
      required: true
    },
    completion: {
      type: String,
      required: true
    },
    tag: {
      type: String,
    },
    subtag: {
      type: String,
    },
    thread: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Thread"
    }
  }
);

export default model("Question", QuestionSchema);