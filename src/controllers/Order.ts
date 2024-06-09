import { Request, Response } from 'express';
import Stripe from 'stripe';
import Restaurant, { MenuItemType } from '../models/restaurant';
import Order from '../models/order';

const stripe = new Stripe(process.env.STRIPE_API_KEY as string);
const FRONTEND_URL = process.env.FRONTEND_URL as string;
const STRIPE_ENDPOINT_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string;

type CheckoutSessionRequest = {
  cartItems: {
    menuItemId: string;
    name: string;
    quantity: string;
  }[];
  deliveryDetails: {
    email: string;
    name: string;
    address: string;
    city: string;
  };
  restaurantId: string;
};

const getMyOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .populate('restaurant')
      .populate('user');

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: '伺服器錯誤' });
  }
};

const stripeWebhookHandler = async (req: Request, res: Response) => {
  let event;
  try {
    const sig = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      STRIPE_ENDPOINT_SECRET
    );
  } catch (error: any) {
    return res.status(400).send(`Webhook 錯誤: ${error.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const order = await Order.findById(event.data.object.metadata?.orderId);

    if (!order) {
      return res.status(404).json({ message: '訂單未找到' });
    }

    order.paidAt = new Date();
    order.status = '已付款';

    await order.save();
  }

  res.status(200).send();
};

const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const checkoutSessionRequest: CheckoutSessionRequest = req.body;

    const restaurant = await Restaurant.findById(
      checkoutSessionRequest.restaurantId
    );

    if (!restaurant) {
      throw new Error('找不到餐廳');
    }

    const getTotalAmount = () => {
      let sum = 0;

      checkoutSessionRequest.cartItems.map((cartItem) => {
        const menuItem = restaurant.menuItems.find(
          (item) => item._id.toString() === cartItem.menuItemId.toString()
        );

        if (menuItem) sum += menuItem.price * parseInt(cartItem.quantity);
      });

      const totalAmount = sum + restaurant.price;

      return totalAmount;
    };

    const newOrder = new Order({
      restaurant: restaurant,
      user: req.userId,
      status: '待付款',
      deliveryDetails: checkoutSessionRequest.deliveryDetails,
      cartItems: checkoutSessionRequest.cartItems,
      totalAmount: getTotalAmount(),
      createdAt: new Date(),
    });

    const lineItems = createLineItems(
      checkoutSessionRequest,
      restaurant.menuItems
    );

    const session = await createSession(
      lineItems,
      newOrder._id.toString(),
      restaurant.price,
      restaurant._id.toString()
    );

    if (!session.url) {
      return res.status(500).json({ message: '無法創建stripe session' });
    }
    console.log(newOrder);

    await newOrder.save();

    res.json({ url: session.url });
  } catch (error: any) {
    res.status(500).json({ message: error.raw.message });
  }
};

const createLineItems = (
  checkoutSessionRequest: CheckoutSessionRequest,
  menuItems: MenuItemType[]
) => {
  const lineItems = checkoutSessionRequest.cartItems.map((cartItem) => {
    const menuItem = menuItems.find(
      (item) => item._id.toString() === cartItem.menuItemId.toString()
    );

    if (!menuItem) {
      throw new Error('菜單項目未找到');
    }

    const line_item: Stripe.Checkout.SessionCreateParams.LineItem = {
      price_data: {
        currency: 'TWD',
        unit_amount: menuItem.price * 100,
        product_data: {
          name: menuItem.name,
        },
      },
      quantity: parseInt(cartItem.quantity),
    };

    return line_item;
  });

  return lineItems;
};

const createSession = async (
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
  orderId: string,
  price: number,
  restaurantId: string
) => {
  const sessionData = await stripe.checkout.sessions.create({
    line_items: lineItems,
    shipping_options: [
      {
        shipping_rate_data: {
          display_name: '運費',
          type: 'fixed_amount',
          fixed_amount: {
            amount: price * 100,
            currency: 'TWD',
          },
        },
      },
    ],
    mode: 'payment',
    metadata: {
      orderId,
      restaurantId,
    },
    success_url: `${FRONTEND_URL}/order-status?success=true`,
    cancel_url: `${FRONTEND_URL}/detail/${restaurantId}?cancelled=true`,
  });

  return sessionData;
};

export default { getMyOrders, createCheckoutSession, stripeWebhookHandler };
