import express from "express";
import { Router, Request, Response } from "express";
const router: Router = express.Router();
import User from "../models/user";
import { StatusCodes } from "http-status-codes";
import auth, { authRequest } from "../middleware/auth";

// Create a new user
router.post("", async (req: Request, res: Response) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(StatusCodes.CREATED).send(user);
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
  }
});

// Login user
router.post("/login", async (req: Request, res: Response) => {
  try {
    const user = await User.findByCredentials(
      req.body.personalNumber,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user: user, token });
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
  }
});

// Logout user
router.post("/logout", auth, async (req: authRequest, res: Response) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();

    res.send();
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
  }
});

export default router;
