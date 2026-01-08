import mongoose, { Document } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import { NextFunction } from "express";

export interface UserType extends Document {
  name: string;
  personalNum: string;
  email: string;
  avatar: string;
  manager: boolean;
  password: string;
  tokens: { token: string }[];
  generateAuthToken: () => Promise<string>;
  isModified: (password: string) => boolean;
}

interface UserModel extends mongoose.Model<UserType> {
  findByCredentials(email: string, password: string): Promise<UserType>;
}

const personalNumLength = 7;
const passwordLength = 7;

const UserSchema = new mongoose.Schema<UserType>({
  name: {
    type: String,
    require: true,
    trim: true,
    validate(value: string) {
      if (value === "") {
        throw new Error(`Your name must contain at least one character.`);
      }
    },
  },
  personalNum: {
    type: String,
    require: true,
    trim: true,
    unique: true,
    validate(value: string) {
      // console.log(Number.isNaN(value));
      if (Number.isNaN(value) || value.length !== personalNumLength) {
        console.log("error");
        throw new Error(
          `Your personal number must contain exactly ${personalNumLength} digits.`
        );
      }
    },
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    validate(value: string) {
      if (!validator.isEmail(value)) {
        throw new Error("Your email must contain a valid email.");
      }
    },
  },
  avatar: {
    type: String,
    default: "koala",
    validate(value: string) {
      if (
        value !== "beaver" &&
        value !== "deer" &&
        value !== "koala" &&
        value !== "raccoon"
      ) {
        throw new Error("Not a valid avatar.");
      }
    },
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
      if (value.length < passwordLength) {
        throw new Error(
          `Your password must contain at least ${passwordLength} characters.`
        );
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
  const token = jwt.sign({ _id: user._id.toString() }, process.env.SECRET!, {expiresIn: '600000'});
  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

UserSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Unable to login");
  }

  // const isMatch = await bcrypt.compare(password, user.password);
  let isMatch: boolean;
  if (password == user.password) {
    isMatch = true;
  } else {
    isMatch = false
  }

  if (!isMatch) {
    throw new Error("Unable to login");
  }

  return user;
};

const User = mongoose.model<UserType, UserModel>("User", UserSchema);

export default User;
