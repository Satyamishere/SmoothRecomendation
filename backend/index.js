import express from 'express';
import cors from 'cors';
import {extractIntent} from './endpoint/intentExtraction.js';
import {getUnifiedResult} from './endpoint/getUnifiedResult.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.post('/getHolidayOptions', extractIntent, getUnifiedResult);

// ONLY listen on port when running locally (not on Vercel)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 6000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// THIS LINE IS CRITICAL FOR VERCEL
export default app;