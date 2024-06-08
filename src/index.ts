import express, { Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';

import myUserRoute from './routes/MyUser';
import MyRestaurantRoute from './routes/MyRestaurant';
import RestaurantRoute from './routes/Restaurant';
import orderRoute from './routes/Order';

mongoose
  .connect(process.env.MONGOOSE_CONNECTION as string)
  .then(() => console.log('資料庫已連接'))
  .catch(() => console.log('資料庫連接失敗'));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
app.use(cors());

app.use('/api/order/checkout/webhook', express.raw({ type: '*/*' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', async (req: Request, res: Response) => {
  res.send({ message: 'ok' });
});

app.use('/api/my/user', myUserRoute);
app.use('/api/my/restaurant', MyRestaurantRoute);
app.use('/api/restaurant', RestaurantRoute);
app.use('/api/order', orderRoute);

app.listen(3001, () => console.log('伺服器正在port3001運行中...'));
