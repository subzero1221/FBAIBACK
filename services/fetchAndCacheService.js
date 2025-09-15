const redisClient = require("../redisClient.js");
const catchAsync = require("../utils/catchAsync.js");
const { sortAndGroupFixtures } = require("../utils/sortAndGroupFixtures.js");
const { countries } = require("./football.js");

const fetchAndCacheGroupedLeagues = catchAsync(async (req, res, next) => {
  const season = 2024;
  const cacheTTL = 86400;

  const infoKey = `countries:info:2024`;

  const cachedAlready = await redisClient.exists(infoKey);
  if (cachedAlready) {
    console.log("🧊 Leagues already cached, skipping fetch.");
    return next();
  }

  console.log("🌐 No cache found, calling API...COUNTRIESANDLEAGUES");

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

  const topLeagues = allLeagues.filter((el) =>
    countries.includes(el.country?.name)
  );

  const countryMap = {};

  for (const league of topLeagues) {
    const countryName = league.country?.name;
    if (!countryName) continue;

    if (!countryMap[countryName]) {
      countryMap[countryName] = [];
    }

    countryMap[countryName].push(league);
  }

  for (const [country, leagues] of Object.entries(countryMap)) {
    const key = `country:${country}:${season}`;
    await redisClient.setEx(key, cacheTTL, JSON.stringify(leagues));
  }

  const uniqueCountries = Array.from(
    new Map(
      topLeagues.map((el) => [
        el.country.name,
        {
          name: el.country.name,
          code: el.country.code,
          flag: el.country.flag,
        },
      ])
    ).values()
  );

  await redisClient.setEx(infoKey, cacheTTL, JSON.stringify(uniqueCountries));
  next();
});

const fetchAndCacheLeagueStandings = catchAsync(async (req, res, next) => {
  const { season, leagueId } = req.params;
  const cacheKey = `standings:info:${season}:${leagueId}`;
  const cacheTTL = 86400;
  req.standingsKey = cacheKey;

  const cachedAlready = await redisClient.exists(cacheKey);
  if (cachedAlready) {
    console.log("🧊 Leagues already cached, skipping fetch.");
    return next();
  }

  console.log("🌐 No cache found, calling API...League Standings");

  const response = await fetch(
    `https://v3.football.api-sports.io/standings?league=${leagueId}&season=${season}`,
    {
      headers: {
        "x-rapidapi-host": "v3.football.api-sports.io",
        "x-rapidapi-key": process.env.FOOTBALLAPI_KEY,
      },
    }
  );
  const data = await response.json();
  const standings = data.response;

  await redisClient.setEx(cacheKey, cacheTTL, JSON.stringify(standings));
  next();
});

const fetchAndCacheLiveMatches = catchAsync(async (req, res, next) => {
  const generalKey = `livematches`;
  const cacheTTL = 86400;

  const cachedAlready = await redisClient.exists(generalKey);
  if (cachedAlready) {
    console.log("🧊 live matches already cached, skipping fetch.");
    return next();
  }

  console.log("🌐 No cache found, calling API...LIVEMATCHES");

  const response = await fetch(
    `https://v3.football.api-sports.io/fixtures?live=all`,
    {
      headers: {
        "x-rapidapi-host": "v3.football.api-sports.io",
        "x-rapidapi-key": process.env.FOOTBALLAPI_KEY,
      },
    }
  );
  const data = await response.json();
  const liveMatches = data.response;

  const topLives = liveMatches.filter((el) => {
    return countries.includes(el.league.country);
  });

  const groupedFixtures = sortAndGroupFixtures(topLives);

  await redisClient.setEx(
    "livematches",
    cacheTTL,
    JSON.stringify(groupedFixtures)
  );
  next();
});

const fetchAndCacheFixtures = catchAsync(async (req, res, next) => {
  const { date } = req.params;
  console.log(date);

  const generalKey = `fixtures:from:${date}`;
  const cacheTTL = 21600;
  req.cacheKey = generalKey;

  const cachedAlready = await redisClient.exists(generalKey);
  if (cachedAlready) {
    console.log("🧊 fixtures already cached, skipping fetch.");
    return next();
  }

  console.log("🌐 No cache found, calling API...FIXTURES");

  const response = await fetch(
    `https://v3.football.api-sports.io/fixtures?date=${date}`,
    {
      headers: {
        "x-rapidapi-host": "v3.football.api-sports.io",
        "x-rapidapi-key": process.env.FOOTBALLAPI_KEY,
      },
    }
  );
  const data = await response.json();
  const fixtures = data.response;

  const topFixtures = fixtures.filter((el) => {
    return countries.includes(el.league.country);
  });

  const groupedFixtures = sortAndGroupFixtures(topFixtures);

  await redisClient.setEx(
    generalKey,
    cacheTTL,
    JSON.stringify(groupedFixtures)
  );

  next();
});

module.exports = {
  fetchAndCacheGroupedLeagues,
  fetchAndCacheLiveMatches,
  fetchAndCacheFixtures,
  fetchAndCacheLeagueStandings,
};
