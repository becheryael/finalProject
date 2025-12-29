import jwt from "jsonwebtoken";
import User, { UserType } from "../models/user";
import { StatusCodes } from "http-status-codes";
import type { NextFunction, Request, Response } from "express";

interface JwtPayload {
  _id: string;
}

export interface authRequest extends Request {
  user: UserType;
  token: string;
}

const auth = async (req: authRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header("Authorization")!.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.SECRET!) as JwtPayload;

    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;

    next();
  } catch (error) {
    res.status(StatusCodes.UNAUTHORIZED).send({ error: "please authenticate" });
  }
};

export default auth;
