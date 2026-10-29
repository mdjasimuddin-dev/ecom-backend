import express, { Application, Request, Response } from "express";
import config from "./app/config";
import cors from "cors";
import cookieParser from "cookie-parser";

const app: Application = express();

app.use(
  cors({
    origin: config.frontend_url,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Ecom-Backend Sever is ready for work.");
});

export default app;
