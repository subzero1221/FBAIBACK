const redisClient = require("../redisClient");
const catchAsync = require("../utils/catchAsync");
const AppError = require("./../utils/AppError");

exports.getLiveMatches = catchAsync(async (req, res, next) => {
  const raw = await redisClient.get("livematches");

  if (!raw) {
    return next(new AppError("Live matches not found", 404));
  }

  const liveMatches = JSON.parse(raw);

  res.status(200).json({
    status: "success",
    data: liveMatches,
  });
});

exports.getFixtures = catchAsync(async (req, res, next) => {
  const raw = await redisClient.get(req.cacheKey);

  if (!raw) {
    return next(new AppError("Fixtures matches not found", 404));
  }

  const fixtures = JSON.parse(raw);

  console.log("Returning fixtures");

  res.status(200).json({
    status: "success",
    data: fixtures,
  });
});

exports.getCountries = catchAsync(async (req, res, next) => {
  const raw = await redisClient.get("countries:info:2024");

  if (!raw) {
    return next(new AppError("Countries not found", 404));
  }

  const countries = JSON.parse(raw);

  res.status(200).json({
    status: "success",
    data: countries,
  });
});

exports.getCountriesLeagues = catchAsync(async (req, res, next) => {
  const { country } = req.params;
  const raw = await redisClient.get(`country:${country}:2024`);

  if (!raw) {
    return next(new AppError("Leagues not found", 404));
  }

  const leagues = JSON.parse(raw);

  res.status(200).json({
    status: "success",
    data: leagues,
  });
});

exports.getLeagueFixtures = catchAsync(async (req, res, next) => {
  const raw = await redisClient.get(req.cacheKey);

  if (!raw) {
    return next(new AppError("Leagues not found", 404));
  }

  const leagueFixtures = JSON.parse(raw);
  console.log(leagueFixtures);

  res.status(200).json({
    status: "success",
    leagueFixtures,
  });
});

exports.getSingleFixture = catchAsync(async (req, res, next) => {
  const raw = await redisClient.get(req.fixtureKey);
  console.log(raw);

  if (!raw) {
    return next(new AppError("fixture not found", 404));
  }

  const fixture = JSON.parse(raw);
  console.log(fixture);

  res.status(200).json({
    status: "success",
    fixture,
  });
});

exports.getFixtureCenter = catchAsync(async (req, res, next) => {
  const cacheKey = req.cacheKey;
  console.log(cacheKey);

  const raw = await redisClient.get(cacheKey);
  if (!raw) {
    return next(new AppError("Fixture center not found", 404));
  }

  const fixtureCenter = JSON.parse(raw);

  res.status(200).json({
    status: "success",
    fixtureCenter,
  });
});

exports.getFixtureLineups = catchAsync(async (req, res, next) => {
  const cacheKey = req.cacheKey;
  console.log(cacheKey);

  const raw = await redisClient.get(cacheKey);
  if (!raw) {
    return next(new AppError("Fixture lineups not found", 404));
  }

  const fixtureLineups = JSON.parse(raw);

  res.status(200).json({
    status: "success",
    fixtureLineups,
  });
});

exports.getFixtureHead2Head = catchAsync(async (req, res, next) => {
  const cacheKey = req.cacheKey;

  const raw = await redisClient.get(cacheKey);
  if (!raw) {
    return next(new AppError("Teams Head2Head not found", 404));
  }

  const fixtureHead2Head = JSON.parse(raw);

  res.status(200).json({
    status: "success",
    fixtureHead2Head,
  });
});

exports.getEliteLeagues = catchAsync(async (req, res, next) => {
  const eliteKey = req.eliteKey;

  const raw = await redisClient.get(eliteKey);
  if (!raw) {
    return next(new AppError("Elite leagues not found", 404));
  }

  const eliteLeagues = JSON.parse(raw);

  res.status(200).json({
    status: "success",
    eliteLeagues,
  });
});

exports.getUefaLeagues = catchAsync(async (req, res, next) => {
  const uefaKey = req.uefaKey;

  const raw = await redisClient.get(uefaKey);
  if (!raw) {
    return next(new AppError("Elite leagues not found", 404));
  }

  const uefaLeagues = JSON.parse(raw);

  res.status(200).json({
    status: "success",
    uefaLeagues,
  });
});

exports.getLeagueStandings = catchAsync(async (req, res, next) => {
  const standingsKey = req.standingsKey;

  const raw = await redisClient.get(standingsKey);
  if (!raw) {
    return next(new AppError("Elite leagues not found", 404));
  }

  const standings = JSON.parse(raw);

  res.status(200).json({
    status: "success",
    standings,
  });
});

exports.getTeamData = catchAsync(async (req, res, next) => {
  const teamKey = req.teamKey;

  const raw = await redisClient.get(teamKey);
  if (!raw) {
    return next(new AppError("Elite leagues not found", 404));
  }

  const team = JSON.parse(raw);

  res.status(200).json({
    status: "success",
    team,
  });
});

exports.getTeamStats = catchAsync(async (req, res, next) => {
  const teamStatsKey = req.teamStatsKey;

  const raw = await redisClient.get(teamStatsKey);
  if (!raw) {
    return next(new AppError("Elite leagues not found", 404));
  }

  const teamStats = JSON.parse(raw);

  res.status(200).json({
    status: "success",
    teamStats,
  });
});

exports.getPlayerProfile = catchAsync(async (req, res, next) => {
  const playerKey = req.playerKey;

  const raw = await redisClient.get(playerKey);
  if (!raw) {
    return next(new AppError("Elite leagues not found", 404));
  }

  const playerProfile = JSON.parse(raw);

  res.status(200).json({
    status: "success",
    playerProfile,
  });
});
