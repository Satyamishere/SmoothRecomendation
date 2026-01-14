import express from 'express';
import cors from 'cors';
import {extractIntent} from './endpoint/intentExtraction.js';
import {getUnifiedResult} from './endpoint/getUnifiedResult.js';

const app = express();

app.use(express.json());
app.use(cors());


app.post('/getHolidayOptions',extractIntent, getUnifiedResult);
app.listen(process.env.PORT || 6000, () => {
    console.log(`Server is running on port ${process.env.PORT || 6000}`);
})