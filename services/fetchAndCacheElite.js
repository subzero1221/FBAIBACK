const redisClient = require("../redisClient");
const catchAsync = require("../utils/catchAsync");
const { filterElite } = require("../utils/sortAndGroupFixtures");
const { uefaLeagueId, eliteLeagueId } = require("./football");

exports.fetchAndCacheEliteLeagues = catchAsync(async (req, res, next) => {
  const season = 2024;
  const cacheTTL = 86400;
  const eliteKey = `elite:info:${season}`;

  req.eliteKey = eliteKey;

  const cachedAlready = await redisClient.exists(eliteKey);
  if (cachedAlready) {
    console.log("🧊 Leagues already cached, skipping fetch.");
    return next();
  }

  console.log("🌐 No cache found, calling API...EliteLEAGUES");

  const response = await fetch(
    `https://v3.football.api-sports.io/leagues?season=${season}`,
    {
      headers: {
        "x-rapidapi-host": "v3.football.api-sports.io",
        "x-rapidapi-key": process.env.FOOTBALLAPI_KEY,
      },
    }
  );
  const data = await response.json();
  const allLeagues = data.response;

  const eliteLeagues = filterElite(allLeagues, eliteLeagueId);
  redisClient.setEx(eliteKey, cacheTTL, JSON.stringify(eliteLeagues));

  next();
});

exports.fetchAndCacheUefaLeagues = catchAsync(async (req, res, next) => {
  const season = 2024;
  const cacheTTL = 86400;
  const uefaKey = `uefa:info:${season}`;

  req.uefaKey = uefaKey;

  const cachedAlready = await redisClient.exists(uefaKey);
  if (cachedAlready) {
    console.log("🧊 Leagues already cached, skipping fetch.");
    return next();
  }

  console.log("🌐 No cache found, calling API...UefaLEAGUES");

  const response = await fetch(
    `https://v3.football.api-sports.io/leagues?season=${season}`,
    {
      headers: {
        "x-rapidapi-host": "v3.football.api-sports.io",
        "x-rapidapi-key": process.env.FOOTBALLAPI_KEY,
      },
    }
  );
  const data = await response.json();
  const allLeagues = data.response;

  const uefaLeagues = filterElite(allLeagues, uefaLeagueId);
  redisClient.setEx(uefaKey, cacheTTL, JSON.stringify(uefaLeagues));

  next();
});
