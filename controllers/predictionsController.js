const redisClient = require("../redisClient");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { predictResults } = require("../utils/predictorAi");

exports.getLeaguesAllFixtures = catchAsync(async (req, res, next) => {
  const team1Key = req.team1Ready;
  const team2Key = req.team2Ready;
  let team1Ready = [];
  let team2Ready = [];

  const team1Raw = await redisClient.get(team1Key);
  if (!team1Raw) {
    return next(new AppError("fixtures not found", 404));
  } else {
    team1Ready = JSON.parse(team1Raw);
  }

  const team2Raw = await redisClient.get(team2Key);
  if (!team2Raw) {
    return next(new AppError("fixtures not found", 404));
  } else {
    team2Ready = JSON.parse(team2Raw);
  }

  res.status(200).json({
    status: "success",
    team1Ready,
    team2Ready,
  });
});

exports.predictResult = catchAsync(async (req, res, next) => {
  const { predict } = req.params;

  const team1Key = req.team1Ready;
  const team2Key = req.team2Ready;

  const standingsKey = req.standingsKey;
  const fixtureKey = req.fixtureKey;

  const firstTeamData = await getDataFromCache(team1Key);
  const secondTeamData = await getDataFromCache(team2Key);

  const standings = await getDataFromCache(standingsKey);
  const fixture = await getDataFromCache(fixtureKey);

  const firstTeam = extractDataForPrediction(predict, firstTeamData);
  const secondTeam = extractDataForPrediction(predict, secondTeamData);

  const predictionString = await predictResults(
    fixture,
    predict,
    firstTeam,
    secondTeam,
    standings
  );

  const cleaned = predictionString.replace(/```json|```/g, "").trim();
  const prediction = JSON.parse(cleaned);

  res.status(200).json({
    status: "success",
    prediction,
    user: req.user,
  });
});

async function getDataFromCache(cacheKey) {
  let data = [];
  const raw = await redisClient.get(cacheKey);
  if (!raw) {
    return next(new AppError("fixtures not found", 404));
  } else {
    data = JSON.parse(raw);
  }

  return data;
}

function extractDataForPrediction(predict, teamData) {
  return teamData.map((data) => ({
    date: data.date,
    homeTeam: data.homeTeam?.name ?? null,
    awayTeam: data.awayTeam?.name ?? null,
    [`${predict}Home`]: data.homeTeam?.stats?.[predict] ?? null,
    [`${predict}Away`]: data.awayTeam?.stats?.[predict] ?? null,
  }));
}
