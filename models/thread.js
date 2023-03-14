import mongoose from "mongoose";
const { Schema, model } = mongoose;

const ThreadSchema = new Schema(
    {
        title: {
            type: String,
        },
        questions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Question"
            }
        ],
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    }
);

export default model("Thread", ThreadSchema);