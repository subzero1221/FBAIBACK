const redisClient = require("../redisClient");
const catchAsync = require("../utils/catchAsync");

async function fetchLastTen(teamId) {
  const response = await fetch(
    `https://v3.football.api-sports.io/fixtures?team=${teamId}&last=10`,
    {
      headers: {
        "x-rapidapi-host": "v3.football.api-sports.io",
        "x-rapidapi-key": process.env.FOOTBALLAPI_KEY,
      },
    }
  );

  const data = await response.json();

  return data.response;
}

async function fetchLastTenFixtureStats(teamId, lastTenFixtures) {
  const fixtureIds = lastTenFixtures.map((fixture) => fixture.fixture.id);

  const lastTenFixturesStatistics = await Promise.all(
    fixtureIds.map(async (fixtureId) => {
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
      console.log(data);

      return data.response;
    })
  );

  return lastTenFixturesStatistics;
}

async function checkRedisCache(cacheKey, teamId, callback, data) {
  const cacheTTL = 86400;

  const dataCachedAlready = await redisClient.exists(cacheKey);
  if (dataCachedAlready) {
    const rawData = await redisClient.get(cacheKey);
    data = JSON.parse(rawData);
  } else {
    data = await callback(teamId, data);
    await redisClient.setEx(cacheKey, cacheTTL, JSON.stringify(data));
  }
  return data;
}

exports.getTeamsLastTenFixtures = catchAsync(async (req, res, next) => {
  const { team1Id, team2Id } = req.params;
  const team1Ready = `forPrediction:Ready:team:${team1Id}`;
  const team2Ready = `forPrediction:Ready:team:${team2Id}`;

  req.team1Ready = team1Ready;
  req.team2Ready = team2Ready;

  const firstTeamReady = await redisClient.exists(team1Ready);
  const secondTeamReady = await redisClient.exists(team2Ready);

  console.log(secondTeamReady);

  if (firstTeamReady && secondTeamReady) {
    return next();
  }

  ////////////////////////
  const team1Key = `forPrediction:team:${team1Id}`;
  const team2Key = `forPrediction:team:${team2Id}`;

  ///fetches each teams last 10 fixture details
  let team1LastTenFixtures = await checkRedisCache(
    team1Key,
    team1Id,
    fetchLastTen,
    []
  );
  let team2LastTenFixtures = await checkRedisCache(
    team2Key,
    team2Id,
    fetchLastTen,
    []
  );

  ////////// fetches and caches teams last 10 fixtures with statistics /////////
  const team1LastTenStatistics = `forPrediction:fixtureStatistics:team:${team1Id}`;
  const team2LastTenStatistics = `forPrediction:fixtureStatistics:team:${team2Id}`;

  let team1LastFixtureStatistics = await checkRedisCache(
    team1LastTenStatistics,
    team1Id,
    fetchLastTenFixtureStats,
    team1LastTenFixtures
  );

  let team2LastFixtureStatistics = await checkRedisCache(
    team2LastTenStatistics,
    team2Id,
    fetchLastTenFixtureStats,
    team2LastTenFixtures
  );

  /////////////caches normalazied objects///////// Ready for prediction

  const readyForPredictionFirstTeam = normalizeFixturesForContext(
    team1LastFixtureStatistics,
    team1LastTenFixtures
  );

  const readyForPredictionSecondTeam = normalizeFixturesForContext(
    team2LastFixtureStatistics,
    team2LastTenFixtures
  );

  await redisClient.setEx(
    team1Ready,
    86400,
    JSON.stringify(readyForPredictionFirstTeam)
  );
  await redisClient.setEx(
    team2Ready,
    86400,
    JSON.stringify(readyForPredictionSecondTeam)
  );

  next();
});

function normalizeFixturesForContext(fixturesStatsArray, fixturesRaw) {
  return fixturesStatsArray.map((fixtureStats, i) => {
    const fixture = fixturesRaw[i];
    const homeId = fixture.teams.home.id;
    const awayId = fixture.teams.away.id;

    // creates a map of stats per teamId
    const statsByTeamId = {};
    fixtureStats.forEach((teamObj) => {
      const statsMap = {};
      teamObj.statistics.forEach((stat) => {
        statsMap[stat.type] = stat.value;
      });

      statsByTeamId[teamObj.team.id] = {
        id: teamObj.team.id,
        name: teamObj.team.name,
        logo: teamObj.team.logo,
        stats: {
          totalShots: statsMap["Total Shots"] ?? 0,
          shotsOnGoal: statsMap["Shots on Goal"] ?? 0,
          fouls: statsMap["Fouls"] ?? 0,
          offsides: statsMap["Offsides"] ?? 0,
          yellowCards: statsMap["Yellow Cards"] ?? 0,
          redCards: statsMap["Red Cards"] ?? 0,
          corners: statsMap["Corner Kicks"] ?? 0,
          ballPossession: statsMap["Ball Possession"] ?? "0%",
          expectedGoals: parseFloat(statsMap["expected_goals"] ?? 0),
          goalkeeperSaves: statsMap["Goalkeeper Saves"] ?? 0,
        },
      };
    });

    return {
      fixtureId: fixture.fixture.id,
      date: fixture.fixture.date,
      league: fixture.league.name,
      round: fixture.league.round,
      venue: fixture.fixture.venue.name,
      homeTeam: {
        ...statsByTeamId[homeId],
        goals: fixture.goals.home,
      },
      awayTeam: {
        ...statsByTeamId[awayId],
        goals: fixture.goals.away,
      },
    };
  });
}
