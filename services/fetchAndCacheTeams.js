const redisClient = require("../redisClient");
const catchAsync = require("../utils/catchAsync");

exports.fetchAndCacheTeam = catchAsync(async (req, res, next) => {
  const { teamId } = req.params;
  const cacheTTL = 86400;
  const teamKey = `team:info:${teamId}`;

  req.teamKey = teamKey;

  const cachedAlready = await redisClient.exists(teamKey);
  if (cachedAlready) {
    console.log("🧊 Team already cached, skipping fetch.");
    return next();
  }

  console.log("🌐 No cache found, calling API...Team");

  const response = await fetch(
    `https://v3.football.api-sports.io/teams?id=${teamId}`,
    {
      headers: {
        "x-rapidapi-host": "v3.football.api-sports.io",
        "x-rapidapi-key": process.env.FOOTBALLAPI_KEY,
      },
    }
  );
  const data = await response.json();
  const team = data.response;

  redisClient.setEx(teamKey, cacheTTL, JSON.stringify(team));

  next();
});

exports.fetchAndCacheTeamStats = catchAsync(async (req, res, next) => {
  const { leagueId, teamId, season } = req.params;
  const cacheTTL = 86400;
  const teamStatsKey = `team:info:stats:${leagueId}:${teamId}:${season}`;

  req.teamStatsKey = teamStatsKey;

  const cachedAlready = await redisClient.exists(teamStatsKey);
  if (cachedAlready) {
    console.log("🧊 Team Stats already cached, skipping fetch.");
    return next();
  }

  console.log("🌐 No cache found, calling API...TeamStats");

  const response = await fetch(
    `https://v3.football.api-sports.io/teams/statistics?league=${leagueId}&team=${teamId}&season=${season}`,
    {
      headers: {
        "x-rapidapi-host": "v3.football.api-sports.io",
        "x-rapidapi-key": process.env.FOOTBALLAPI_KEY,
      },
    }
  );
  const data = await response.json();
  const teamStats = data.response;

  redisClient.setEx(teamStatsKey, cacheTTL, JSON.stringify(teamStats));

  next();
});

exports.fetchAndCachePlayerProfile = catchAsync(async (req, res, next) => {
  const { playerId, season } = req.params;
  const cacheTTL = 86400;
  const playerKey = `player:stats:${playerId}:${season}`;

  req.playerKey = playerKey;

  const cachedAlready = await redisClient.exists(playerKey);
  if (cachedAlready) {
    console.log("🧊 Player Stats already cached, skipping fetch.");
    return next();
  }

  console.log("🌐 No cache found, calling API...PlayerStats");

  const response = await fetch(
    `https://v3.football.api-sports.io/players?id=${playerId}&season=${season}`,
    {
      headers: {
        "x-rapidapi-host": "v3.football.api-sports.io",
        "x-rapidapi-key": process.env.FOOTBALLAPI_KEY,
      },
    }
  );
  const data = await response.json();
  const playerProfile = data.response;

  redisClient.setEx(playerKey, cacheTTL, JSON.stringify(playerProfile));

  next();
});

//
////////////////////////
//////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////FOR AI PREDICTIONDS/////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////
////////////////////
