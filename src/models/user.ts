import mongoose, { Document } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { NextFunction } from "express";

export interface UserType extends Document{
  email: string;
  manager: boolean;
  password: string;
  tokens: {token: string}[];
  generateAuthToken: () => Promise<string>;
  isModified: (password: string) => boolean;
}

interface UserModel extends mongoose.Model<UserType> {
  findByCredentials(email: string, password: string): Promise<UserType>;
}

const UserSchema = new mongoose.Schema<UserType>({
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  manager: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: true,
    minLength: 7,
    trim: true,
    validate(value: string) {
      if (value.toLowerCase().includes("password")) {
        throw new Error('Password cannot contain "Password".');
      }
    },
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

// UserSchema.pre(
//   "save",
//   async function (next: (error?: Error) => void) {
//     const user = this;
//     if (user.isModified("password")) {
//       user.password = await bcrypt.hash(user.password, 8);
//     }

//     next();
//   }
// );

UserSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.SECRET!);
  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

UserSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Unable to login");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Unable to login");
  }

  return user;
};

const User = mongoose.model<UserType, UserModel>("User", UserSchema);

export default User;
