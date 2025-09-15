const redisClient = require("../redisClient");
const catchAsync = require("../utils/catchAsync");

exports.search = catchAsync(async (req, res, next) => {
  const { query } = req.query;
  console.log("Query:", query);

  if (!query || query.length < 2) {
    return res.status(400).json({ message: "Query too short" });
  }

  const cacheKey = `search:multi:${query.toLowerCase()}`;
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return res.status(200).json(JSON.parse(cached));
  }

  const headers = {
    "x-rapidapi-host": "v3.football.api-sports.io",
    "x-rapidapi-key": process.env.FOOTBALLAPI_KEY,
  };

  const teamPromise = fetch(
    `https://v3.football.api-sports.io/teams?search=${query}`,
    { headers }
  );

  const playerPromise = fetch(
    `https://v3.football.api-sports.io/players/profiles?search=${query}`,
    { headers }
  );

  const countryPromise = fetch(`https://v3.football.api-sports.io/countries`, {
    headers,
  });

  const [teamRes, playerRes, countryRes] = await Promise.all([
    teamPromise,
    playerPromise,
    countryPromise,
  ]);

  const [teamData, playerData, countryData] = await Promise.all([
    teamRes.json(),
    playerRes.json(),
    countryRes.json(),
  ]);

  const filteredCountries = countryData.response.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  const results = {
    teams: teamData.response,
    players: playerData.response,
    countries: filteredCountries,
  };

  await redisClient.set(cacheKey, JSON.stringify(results), {
    EX: 60 * 60 * 2, // cache 2 hours
  });

  res.status(200).json(results);
});
