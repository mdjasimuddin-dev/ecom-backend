import { Application } from 'express';
import config from './app/config';
import express, { Request, Response } from 'express';

import cookieParser from 'cookie-parser';
import { AuthRoutes } from './app/modules/auth/auth.route';
import { UserRoutes } from './app/modules/user/user.route';
import { CategoryRoutes } from './app/modules/category/category.route';
import cors from 'cors';

import { notFound } from './app/middlewares/notFound';
import { ProductRoutes } from './app/modules/products/product.route';
import { WishlistRoutes } from './app/modules/wishlist/wishlist.route';
import { CartRoutes } from './app/modules/cartItem/cartitem.route';
import { AddressRoutes } from './app/modules/address/address.route';
import { CouponRoutes } from './app/modules/coupon/coupon.route';
import { OrderRoutes } from './app/modules/order/order.route';

const app: Application = express();

app.use(
  cors({
    origin: config.frontend_url,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/v1/auth', AuthRoutes);
app.use('/api/v1/user', UserRoutes);
app.use('/api/v1/category', CategoryRoutes);
app.use('/api/v1/product', ProductRoutes);
app.use('/api/v1/wishlist', WishlistRoutes);
app.use('/api/v1/cart', CartRoutes);
app.use('/api/v1/address', AddressRoutes);
app.use('/api/v1/coupon', CouponRoutes);
app.use('/api/v1/order', OrderRoutes);

app.use(notFound);

app.get('/', (_req: Request, res: Response) => {
  res.send('Ecom-Backend Sever is ready for work.');
});

export default app;
