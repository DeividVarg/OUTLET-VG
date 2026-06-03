import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connect } from "./config/db";
import { createDb } from "./middleware/createDb";
import { UserRouter } from "./routes/user";
import { productRouter } from "./routes/products";
import { categoryRouter } from "./routes/category";
import { defaultUser } from "./config/SetupAdmin";
import { subCategoryRouter } from "./routes/subCategories";
import { cartRouter } from "./routes/carts";
import { PurchaseRouter } from "./routes/pucharse";
import { PaymentRouter } from "./routes/payment";
import { questionsRouter } from "./routes/questions";

const app = express();
const port = 8080;

// Middlewares esenciales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://sbmt825h-5173.use2.devtunnels.ms/",
    ],
    credentials: true,
  }),
);
app.use(cookieParser());

app.use(morgan("dev"));

app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => res.send("Hello World!"));
app.use("/users", UserRouter);
app.use("/products", productRouter);
app.use("/categories", categoryRouter);
app.use("/subcategories", subCategoryRouter);
app.use("/cart", cartRouter);
app.use("/purchases", PurchaseRouter);
app.use("/payments", PaymentRouter);
app.use("/questions", questionsRouter);

const startServer = async () => {
  try {
    await createDb();
    await connect();

    await defaultUser();

    const server = app.listen(port, () => {
      console.log(
        `[${new Date().toISOString()}] Server running on http://localhost:${port}`,
      );
    });

    process.once("SIGUSR2", () => {
      console.log("[ts-node-dev] Server restarting...");
      server.close(() => process.kill(process.pid, "SIGUSR2"));
    });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error starting server:`, err);
  }
};

startServer();
