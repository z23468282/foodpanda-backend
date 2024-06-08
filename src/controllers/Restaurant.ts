import { Request, Response } from 'express';
import Restaurant from '../models/restaurant';

const getRestaurant = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.params.restaurantId;

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({ message: '找不到餐廳' });
    }

    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
};

const searchRestaurants = async (req: Request, res: Response) => {
  try {
    const city = req.params.city;

    const searchQuery = (req.query.searchQuery as string) || '';
    const selectedFoods = (req.query.selectedFoods as string) || '';
    const sortOption = (req.query.sortOption as string) || 'lastUpdated';
    const page = parseInt(req.query.page as string) || 1;

    let query: any = {};

    query['city'] = new RegExp(city, 'i');
    const cityCheck = await Restaurant.countDocuments(query);
    if (cityCheck === 0) {
      return res.json({
        data: [],
        pagination: {
          total: 0,
          page: 1,
          pages: 1,
        },
      });
    }

    if (selectedFoods) {
      const foodsArray = selectedFoods
        .split(',')
        .map((food) => new RegExp(food, 'i'));

      query['foods'] = { $all: foodsArray };
    }

    if (searchQuery) {
      const searchRegex = new RegExp(searchQuery, 'i');
      query['$or'] = [
        { restaurantName: searchRegex },
        { foods: { $in: [searchRegex] } },
      ];
    }

    const pageSize = 5;
    const skip = (page - 1) * pageSize;

    const restaurants = await Restaurant.find(query)
      .sort({ [sortOption]: 1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    const total = await Restaurant.countDocuments(query);

    const response = {
      data: restaurants,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / pageSize),
      },
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
};

export default {
  searchRestaurants,
  getRestaurant,
};
