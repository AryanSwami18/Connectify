import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import authRoute from './routes/AuthRoute.js';
import errorMiddleware from './middlewares/errorMiddleware.js';
import contactRoute from './routes/ContactRoute.js';
import setupSocket from './socket.js';
dotenv.config();

const app = express();

app.use(cors({
    origin:[process.env.ORIGIN],
    methods:['GET','POST','PUT','PATCH','DELETE'],
    credentials:true
}));

app.use(cookieParser());
app.use(express.json());



app.use('/api/auth',authRoute)
app.use('/api/contact',contactRoute)

app.use(errorMiddleware);

const port = process.env.PORT || 3001;
const databaseURL = process.env.DATABASE_URL;

mongoose.connect(databaseURL)
    .then(() => {
        console.log('DB connection successful');
        const server = app.listen(port, () => {
            console.log(`Server started at http://localhost:${port}`);
        });

        setupSocket(server)
    })
    .catch((err) => {
        console.error('DB connection error:', err.message);
    });

