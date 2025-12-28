const express = require('express');
import { Router, Request, Response, ErrorRequestHandler } from 'express';
const router: Router = new express.Router();
const User = require('../models/user');
const { StatusCodes } = require('http-status-codes');

// Create a new user
router.post('', async (req: Request, res: Response) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(StatusCodes.CREATED).send(user);
    } catch (error: any) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error.message);
    }
});

export {};
module.exports = router;