import { Request, Response } from 'express';
import User from '../models/user';

const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const currentUser = await User.findOne({ _id: req.userId });

    if (!currentUser) {
      return res.status(404).json({ message: '未找到用戶' });
    }

    res.json(currentUser);
  } catch (error) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
};

const createCurrentUser = async (req: Request, res: Response) => {
  try {
    const { auth0Id } = req.body;

    const existingUser = await User.findOne({ auth0Id });

    if (existingUser) {
      return res.send(existingUser);
    }

    const newUser = new User(req.body);
    await newUser.save();

    res.status(201).json(newUser.toObject());
  } catch (error) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
};

const updateCurrentUser = async (req: Request, res: Response) => {
  try {
    const { name, address, city } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: '找不到用戶' });
    }

    user.name = name;
    user.address = address;
    user.city = city;

    await user.save();

    res.send(user);
  } catch (error) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
};

export default {
  getCurrentUser,
  createCurrentUser,
  updateCurrentUser,
};
