import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

dotenv.config();

const app = express();

app.use(cors({
    origin:[process.env.ORIGIN],
    methods:['GET','POST','PUT','PATCH','DELETE'],
    credentials:true
}));

app.use(cookieParser());
app.use(express.json());

const port = process.env.PORT || 3001;
const databaseURL = process.env.DATABASE_URL;

mongoose.connect(databaseURL)
    .then(() => {
        console.log('DB connection successful');
        app.listen(port, () => {
            console.log(`Server started at http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.error('DB connection error:', err.message);
    });

