/// <reference path="../types/express.d.ts" />
import express, { RequestHandler } from "express";
import { Router, Request, Response } from "express";
import User from "../models/user";
import { StatusCodes } from "http-status-codes";
import auth  from "../middleware/auth";

const router: Router = express.Router();

// Create a new user
router.post("/create", async (req: Request, res: Response) => {
  try {
    const user = new User(req.body);
    await user.save();
    const token = await user.generateAuthToken();
    res.status(StatusCodes.CREATED).send({user, token});
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
  }
});

// Login user
router.post("/login", async (req: Request, res: Response) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user: user, token });
  } catch (error: any) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ error: error.message });
  }
});

// Logout user
router.post("/logout", auth, async (req: Request, res: Response) => {
  try {
    req.user!.tokens = req.user!.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user!.save();

    res.send();
  } catch (error: any) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
  }
});

export default router;
