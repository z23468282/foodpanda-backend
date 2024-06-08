import { body, validationResult } from 'express-validator';
import { NextFunction, Request, Response } from 'express';

const handleValidationErrors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  next();
};

export const validateMyUserRequest = [
  body('name').isString().notEmpty().withMessage('名稱必須是字串'),
  body('address').isString().notEmpty().withMessage('地址必須是字串'),
  body('city').isString().notEmpty().withMessage('城市必須是字串'),
  handleValidationErrors,
];

export const validateMyRestaurantRequest = [
  body('restaurantName').notEmpty().withMessage('餐廳是必填的'),
  body('city').notEmpty().withMessage('城市是必填的'),
  body('address').notEmpty().withMessage('地址是必填的'),
  body('price').isInt({ min: -1 }).withMessage('運費需大於等於0'),
  body('defaultDeliveryTime').isInt({ min: 0 }).withMessage('時間需大於0'),
  body('foods')
    .isArray()
    .withMessage('食物須為數組')
    .not()
    .isEmpty()
    .withMessage('數組不能為空'),
  body('menuItems').isArray().withMessage('菜單須為數組'),
  body('menuItems.*.name').notEmpty().withMessage('菜單是必填的'),
  body('menuItems.*.price').isInt({ min: 0 }).withMessage('價格是必填的'),
  handleValidationErrors,
];
