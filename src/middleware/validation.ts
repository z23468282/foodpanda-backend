import { body, validationResult } from 'express-validator';
import { NextFunction, Request, Response } from 'express';

const handleValidationErrors = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  next();
};

export const validateMyUserRequest = [
  body('name').isString().notEmpty().withMessage('名稱必須是字串'),
  body('address').isString().notEmpty().withMessage('地址必須是字串'),
  body('city').isString().notEmpty().withMessage('城市必須是字串'),
  handleValidationErrors,
];
