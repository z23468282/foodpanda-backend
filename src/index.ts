import express, { Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import 'dotenv/config';

import myUserRoute from './routes/MyUser';

mongoose
  .connect(process.env.MONGOOSE_CONNECTION as string)
  .then(() => console.log('資料庫已連接'))
  .catch(() => console.log('資料庫連接失敗'));

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get('/health', async (req: Request, res: Response) => {
  res.send({ message: 'ok' });
});

app.use('/api/my/user', myUserRoute);

app.listen(3001, () => console.log('伺服器正在port3001運行中...'));
