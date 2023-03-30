import mongoose from "mongoose";
const { Schema, model } = mongoose;
import User from "../models/user.js";
import Question from "../models/question.js";

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

ThreadSchema.post("remove", document => {
    const threadId = document._id;

    User.find({ threads: { $in: [threadId] } }).then(users => {
        Promise.all(
            users.map(user =>
                User.findOneAndUpdate(
                    user._id,
                    { $pull: { threads: threadId } },
                    //{ new: true }
                )
            )
        );
    });
    Question.find({ thread: threadId }).then(questions=>{
        questions.forEach(async question => {
            await Question.findByIdAndRemove(
                question._id
            )
        });
    })

});

export default model("Thread", ThreadSchema);