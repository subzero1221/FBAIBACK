const redisClient = require("../redisClient.js");
const AppError = require("../utils/AppError.js");
const catchAsync = require("../utils/catchAsync.js");

//////////////////////////////////////////////////////////////Fixture Statistics
exports.fetchAndCacheFixtureCenter = catchAsync(async (req, res, next) => {
  const { fixtureId } = req.params;
  const cacheTTL = 86400 * 5;

  const cacheKey = `fixture:info:${fixtureId}`;
  req.cacheKey = cacheKey;

  const cachedAlready = await redisClient.exists(cacheKey);
  if (cachedAlready) {
    console.log("🧊 Fixture already cached, skipping fetch.");
    return next();
  }

  console.log("🌐 No cache found, calling API...FIXTURE");

  const response = await fetch(
    `https://v3.football.api-sports.io/fixtures/statistics?fixture=${fixtureId}`,
    {
      headers: {
        "x-rapidapi-host": "v3.football.api-sports.io",
        "x-rapidapi-key": process.env.FOOTBALLAPI_KEY,
      },
    }
  );
  const data = await response.json();
  const fixtureCenter = data.response;

  redisClient.setEx(cacheKey, cacheTTL, JSON.stringify(fixtureCenter));

  next();
});

/////////////////////////////////////////////////////////////////////Fixture Lineups

exports.fetchAndCacheFixtureLineUps = catchAsync(async (req, res, next) => {
  const { fixtureId } = req.params;
  const cacheTTL = 86400 * 5;

  const cacheKey = `fixture:lineups:${fixtureId}`;
  req.cacheKey = cacheKey;

  const cachedAlready = await redisClient.exists(cacheKey);
  if (cachedAlready) {
    console.log("🧊 Fixture Lineups already cached, skipping fetch.");
    return next();
  }

  console.log("🌐 No cache found, calling API...FIXTURE");

  const response = await fetch(
    `https://v3.football.api-sports.io/fixtures/lineups?fixture=${fixtureId}`,
    {
      headers: {
        "x-rapidapi-host": "v3.football.api-sports.io",
        "x-rapidapi-key": process.env.FOOTBALLAPI_KEY,
      },
    }
  );
  const data = await response.json();
  const fixtureCenter = data.response;

  redisClient.setEx(cacheKey, cacheTTL, JSON.stringify(fixtureCenter));

  next();
});

///////////////////////////////////////////////////////////////Fixture Teams Head2Head

async function getTeamsForH2H(fixtureId) {
  const cacheTTL = 86400 * 5;
  const cachedFixtureKey = `fixture:info:${fixtureId}`;

  let fixture = {};

  const cachedFixture = await redisClient.exists(cachedFixtureKey);

  if (cachedFixture) {
    const rawFixture = await redisClient.get(cachedFixtureKey);
    fixture = JSON.parse(rawFixture);
  } else {
    const res = await fetch(
      `https://v3.football.api-sports.io/fixtures/statistics?fixture=${fixtureId}`,
      {
        headers: {
          "x-rapidapi-host": "v3.football.api-sports.io",
          "x-rapidapi-key": process.env.FOOTBALLAPI_KEY,
        },
      }
    );

    const data = await res.json();
    fixture = data.response;

    await redisClient.setEx(
      cachedFixtureKey,
      cacheTTL,
      JSON.stringify(fixture)
    );
  }

  const teamId1 = fixture?.at(0)?.team.id;
  const teamId2 = fixture?.at(1)?.team.id;

  return { teamId1, teamId2 };
}

exports.fetchAndCacheFixtureHead2Head = catchAsync(async (req, res, next) => {
  const { fixtureId } = req.params;
  const cacheTTL = 86400 * 5;
  const { teamId1, teamId2 } = await getTeamsForH2H(fixtureId);

  const cacheKey = `fixture:headtohead:${teamId1}-${teamId2}`;
  req.cacheKey = cacheKey;

  const cachedAlready = await redisClient.exists(cacheKey);
  if (cachedAlready) {
    console.log("🧊 Fixture H2H already cached, skipping fetch.");
    return next();
  }

  console.log("🌐 No cache found, calling API...HEADTOHEAD");

  const response = await fetch(
    `https://v3.football.api-sports.io/fixtures/headtohead?h2h=${teamId1}-${teamId2}&last=5`,
    {
      headers: {
        "x-rapidapi-host": "v3.football.api-sports.io",
        "x-rapidapi-key": process.env.FOOTBALLAPI_KEY,
      },
    }
  );
  const data = await response.json();
  const head2Head = data.response;

  if (head2Head.length === 0) {
    return next(new AppError("H2H data not found", 404, []));
  }

  redisClient.setEx(cacheKey, cacheTTL, JSON.stringify(head2Head));

  next();
});

exports.fetchAndCacheSingleFixture = catchAsync(async (req, res, next) => {
  const { fixtureId } = req.params;

  const cacheTTL = 86400;
  const fixtureKey = `fixture:single:${fixtureId}`;
  req.fixtureKey = fixtureKey;

  const cachedAlready = await redisClient.exists(fixtureKey);
  if (cachedAlready) {
    return next();
  }

  const response = await fetch(
    `https://v3.football.api-sports.io/fixtures?id=${fixtureId}`,
    {
      headers: {
        "x-rapidapi-host": "v3.football.api-sports.io",
        "x-rapidapi-key": process.env.FOOTBALLAPI_KEY,
      },
    }
  );

  const data = await response.json();

  const fixtureData = data.response;

  await redisClient.setEx(fixtureKey, cacheTTL, JSON.stringify(fixtureData));

  next();
});

///////////////////////////////////////////////////////////////Fixture Teams Head2Head

exports.fetchAndCacheLeagueFixtures = catchAsync(async (req, res, next) => {
  const { leagueId, type } = req.params;
  console.log(type);

  const cacheTTL = 86400;
  const cacheKey = `league:${leagueId}:fixtures:${type}`;
  req.cacheKey = cacheKey;

  const cachedAlready = await redisClient.exists(cacheKey);

  if (cachedAlready) {
    return next();
  }

  console.log("🌐 No cache found, calling API...League fixtures fetch");

  const response = await fetch(
    `https://v3.football.api-sports.io/fixtures?league=${leagueId}&${type}`,
    {
      headers: {
        "x-rapidapi-host": "v3.football.api-sports.io",
        "x-rapidapi-key": process.env.FOOTBALLAPI_KEY,
      },
    }
  );

  const data = await response.json();
  const fixtures = data.response;

  redisClient.setEx(cacheKey, cacheTTL, JSON.stringify(fixtures));
  next();
});

exports.fetchAndCacheFixtureForPrediction = catchAsync(
  async (req, res, next) => {
    const { fixtureId } = req.params;
    const cacheTTL = 86400;
    const fixtureKey = `forPrediction:fixture:${fixtureId}`;
    req.fixtureKey = fixtureKey;

    const cachedAlready = await redisClient.exists(fixtureKey);
    if (cachedAlready) {
      return next();
    }

    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures?id=${fixtureId}`,
      {
        headers: {
          "x-rapidapi-host": "v3.football.api-sports.io",
          "x-rapidapi-key": process.env.FOOTBALLAPI_KEY,
        },
      }
    );

    const data = await response.json();
    const fixtureData = data.response;

    const readyForPrediction = {
      home: fixtureData[0].teams.home.name,
      away: fixtureData[0].teams.away.name,
      date: fixtureData[0].fixture.date.split("T").at(0),
    };

    await redisClient.setEx(
      fixtureKey,
      cacheTTL,
      JSON.stringify(readyForPrediction)
    );

    res.status(200).json({
      fixtureData,
    });
  }
);
