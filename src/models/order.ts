import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deliveryDetails: {
    email: { type: String, required: true },
    name: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
  },
  cartItems: [
    {
      menuItemId: { type: String, required: true },
      quantity: { type: Number, required: true },
      name: { type: String, required: true },
    },
  ],
  totalAmount: Number,
  status: {
    type: String,
    enum: ['待付款', '已付款', '處理中', '已發貨', '運輸中'],
  },
  createdAt: { type: Date, default: Date.now() },
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
