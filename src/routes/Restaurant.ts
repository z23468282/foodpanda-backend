import express from 'express';
import { param } from 'express-validator';
import RestaurantController from '../controllers/Restaurant';

const router = express.Router();

router.get(
  '/search/:city',
  param('city').isString().trim().notEmpty().withMessage('城市參數須為字串'),
  RestaurantController.searchRestaurants
);

router.get(
  '/:restaurantId',
  param('restaurantId')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('餐廳Id須為字串'),
  RestaurantController.getRestaurant
);

export default router;
