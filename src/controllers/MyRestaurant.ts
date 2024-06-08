import { Request, Response } from 'express';
import Restaurant from '../models/restaurant';
import cloudinary from 'cloudinary';
import mongoose from 'mongoose';

const getMyRestaurant = async (req: Request, res: Response) => {
  try {
    const myRestaurant = await Restaurant.findOne({ user: req.userId });

    if (!myRestaurant) {
      return res.status(404).json({ message: '找不到您的餐廳' });
    }

    res.json(myRestaurant);
  } catch (error) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
};

const createMyRestaurant = async (req: Request, res: Response) => {
  try {
    const existingRestaurant = await Restaurant.findOne({ user: req.userId });

    if (existingRestaurant) {
      return res.status(409).json({ message: '用戶餐廳已存在' });
    }

    const imageUrl = await uploadImage(req.file as Express.Multer.File);

    const restaurant = new Restaurant(req.body);
    restaurant.imageUrl = imageUrl;
    restaurant.user = new mongoose.Types.ObjectId(req.userId);
    restaurant.lastUpdated = new Date();

    await restaurant.save();

    res.status(201).send(restaurant);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: '伺服器錯誤' });
  }
};

const updateMyRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findOne({ user: req.userId });

    if (!restaurant) {
      return res.status(404).json({ message: '未找到餐廳' });
    }

    restaurant.restaurantName = req.body.restaurantName;
    restaurant.city = req.body.city;
    restaurant.address = req.body.address;
    restaurant.price = req.body.price;
    restaurant.defaultDeliveryTime = req.body.defaultDeliveryTime;
    restaurant.foods = req.body.foods;
    restaurant.menuItems = req.body.menuItems;
    restaurant.lastUpdated = new Date();

    if (req.file) {
      const imageUrl = await uploadImage(req.file as Express.Multer.File);
      restaurant.imageUrl = imageUrl;
    }

    await restaurant.save();
    res.send(restaurant);
  } catch (error) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
};

async function uploadImage(file: Express.Multer.File) {
  const image = file;
  const base64Image = Buffer.from(image.buffer).toString('base64');
  const dataURI = `data:${image.mimetype};base64,${base64Image}`;

  const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
  return uploadResponse.url;
}

export default { getMyRestaurant, createMyRestaurant, updateMyRestaurant };
