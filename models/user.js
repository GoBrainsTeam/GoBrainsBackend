import mongoose from "mongoose";
const { Schema, model } = mongoose;
import bcrypt from "bcrypt";

const UserSchema = new Schema(
  {
    fullname: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    pwd: {
      type: String,
    },
    pic: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      required: true,
      default: false
    },
    isBlocked: {
      type: Boolean,
      required: true,
      default: false
    },
    otp: {
      type: Number,
      required: true,
      default: '9475'
    },
    role: {
      type: String,
      default: 'ADMIN'
    },
    level: {
      type: Number,
    },
    speciality: {
      type: String,
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question"
      }
    ],
  }
);

UserSchema.methods.verifyPwd = async function (password) {
  const user = this;
  const compare = await bcrypt.compare(password, user.pwd);
  return compare;
};

UserSchema.methods.isCorrectPassword = async function (password) {
  const user = this;
  const compare = await bcrypt.compare(password, user.pwd);
  return compare;
};

export default model("User", UserSchema);