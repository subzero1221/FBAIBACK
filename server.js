const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRouter = require("./routes/authRouter");
const userRouter = require("./routes/userRouter");
const fballRouter = require("./routes/fballRouter");
const predictionsRouter = require("./routes/predictionsRouter");
const paymentRouter = require("./routes/paymentRouter");
const { handleWebhook } = require("./controllers/paymentController");

dotenv.config({ path: ".env" });
const app = express();

const allowedOrigins = [
  "https://fbai-one.vercel.app",
  "https://fbai-git-main-subzero1221s-projects.vercel.app",
  "http://localhost:3000",
  "https://fbai-53phn9xr9-subzero1221s-projects.vercel.app",
  "https://fbai-md2qc3nw9-subzero1221s-projects.vercel.app",
  "https://fbai-34o0u1189-subzero1221s-projects.vercel.app",
  "https://fbai-eouf2l6ta-subzero1221s-projects.vercel.app"
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Stripe webhook must come before express.json()
app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  handleWebhook
);

// Body parsers
app.use(express.json());
app.use(cookieParser());

// DB Connection
const port = process.env.PORT;
const DB = process.env.MONGODB_URL;

mongoose
  .connect(DB, {})
  .then(() => console.log("✅ Database connected!"))
  .catch((err) => console.error(`❌ Database connection error: ${err}`));

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/fball", fballRouter);
app.use("/api/v1/predictions", predictionsRouter);
app.use("/api/v1/payments", paymentRouter);

// Start server
app.listen(port, () => {
  console.log(`🚀 Server is running on PORT ${port}`);
});
