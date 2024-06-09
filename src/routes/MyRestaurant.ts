import express from 'express';
import multer from 'multer';
import MyRestaurantController from '../controllers/MyRestaurant';
import { jwtCheck, jwtParse } from '../middleware/auth';
import { validateMyRestaurantRequest } from '../middleware/validation';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fieldSize: 5 * 1024 * 1024, //圖片限制5mb
  },
});

router.get('/', jwtCheck, jwtParse, MyRestaurantController.getMyRestaurant);

router.get(
  '/orders',
  jwtCheck,
  jwtParse,
  MyRestaurantController.getMyRestaurantOrders
);

router.post(
  '/',
  upload.single('imageFile'),
  validateMyRestaurantRequest,
  jwtCheck,
  jwtParse,
  MyRestaurantController.createMyRestaurant
);

router.put(
  '/',
  upload.single('imageFile'),
  validateMyRestaurantRequest,
  jwtCheck,
  jwtParse,
  MyRestaurantController.updateMyRestaurant
);

router.patch(
  '/order/:orderId/status',
  jwtCheck,
  jwtParse,
  MyRestaurantController.updateOrderStatus
);

export default router;
