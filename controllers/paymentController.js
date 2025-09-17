const User = require("../models/userModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createPaymentSession = catchAsync(async (req, res, next) => {
  const { product } = req.body;

  const validProducts = {
    starter: 599,
    advanced: 1599,
    pro: 2999,
  };

  const priceInCents = validProducts[product];
  if (!priceInCents) {
    return next(new AppError("Invalid product", 400));
  }

  const productImages = {
    starter: "http://localhost:3000/rashford10.jpg",
    advanced: "http://localhost:3000/ronaldo7.jpg",
    pro: "http://localhost:3000/messi10.jpg",
  };

  const productDescriptions = {
    starter: "Starter pack: great for beginners!",
    advanced: "Advanced plan: more features for growing users.",
    pro: "Pro plan: unlock everything with priority support.",
  };

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: productDescriptions[product],
            description: productDescriptions[product],
            images: [productImages[product]],
          },
          unit_amount: priceInCents,
        },
        quantity: 1,
      },
    ],
    customer_email: req.user.email, // prefill email
    metadata: {
      product,
      userId: req.user.id.toString(),
      userEmail: req.user.email,
      userName: req.user.name,
      userImage: req.user.avatar,
    },
    success_url: `${process.env.FRONTEND_URL}/payment-success`,
    cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
  });

  res.status(200).json({ status: "success", url: session.url });
});

exports.handleWebhook = catchAsync(async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  let event;

  console.log("Stripe Webhook runs!");

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SIGNATURE
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("Event Type:", event.type);

  // Handle different event types
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("✅ Payment succeeded!", session);

    const product = session.metadata.product; // "starter", "advanced", "pro"
    const userId = session.metadata.userId;

    try {
      await sendTokens(product, userId, next);
      console.log("✅ Tokens added to user:", userId);
    } catch (err) {
      console.error("❌ Error updating user tokens:", err);
    }
  } else {
    console.log(`Unhandled event type: ${event.type}`);
  }

  // Always respond 200 so Stripe stops sending the event again
  res.status(200).json({ received: true });
});

async function sendTokens(pack, userId, next) {
  const tokensPackage = { starter: 1000, advanced: 5000, pro: 15000 };

  const user = await User.findById(userId); // <-- add await
  if (!user)
    return next(new AppError("User not found! reach support team", 404));

  console.log(user);

  user.tokens = (user.tokens || 0) + tokensPackage[pack]; // if you want to add, not overwrite
  await user.save({ validateBeforeSave: false });

  return true;
}
