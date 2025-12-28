import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
require('./db/mongoose');
const userRouter = require('./routers/userRouter');

const app = express();

app.use(express.json());
app.use('/users', userRouter);
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log('Server is up on port ' + process.env.PORT);
});

export {};
