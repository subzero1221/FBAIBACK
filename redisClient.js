const { createClient } = require("redis");

const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
    rejectUnauthorized: false
  }
});

redisClient.on("error", (err) => console.error("Redis error:", err));
redisClient.on("connect", () => console.log("✅ Redis connected!"));

redisClient
  .connect()
  .then(() => {
    console.log("Redis client is ready");
  })
  .catch((err) => {
    console.error("Redis connection error:", err);
  });

module.exports = redisClient;
