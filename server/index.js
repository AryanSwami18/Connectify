import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import authRoute from './routes/AuthRoute.js';
import errorMiddleware from './middlewares/errorMiddleware.js';
import contactRoute from './routes/ContactRoute.js';
import setupSocket from './socket.js';
import messageRoute from './routes/MessageRoute.js';
import groupRoute from './routes/GroupRoute.js';
dotenv.config();

const getRequiredEnv = (key) => {
    const value = process.env[key]?.trim();
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
};

const app = express();
const allowedOrigins = getRequiredEnv('ORIGIN')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
const databaseURL = getRequiredEnv('DATABASE_URL');
getRequiredEnv('JWT_KEY');

app.use(cors({
    origin: allowedOrigins,
    methods:['GET','POST','PUT','PATCH','DELETE'],
    credentials:true
}));

app.use(cookieParser());
app.use(express.json());



app.use('/api/auth',authRoute)
app.use('/api/contact',contactRoute)
app.use('/api/message',messageRoute)
app.use('/api/group',groupRoute)

app.use(errorMiddleware);

const port = process.env.PORT || 3001;

mongoose.connect(databaseURL)
    .then(() => {
        console.log('DB connection successful');
        const server = app.listen(port, () => {
            console.log(`Server started at http://localhost:${port}`);
        });

        setupSocket(server, allowedOrigins)
    })
    .catch((err) => {
        console.error('DB connection error:', err.message);
    });

