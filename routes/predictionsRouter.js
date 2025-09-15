const express = require("express");
const {
  getTeamsLastTenFixtures,
} = require("../services/fetchAndCacheForPredictions");
const {
  getLeaguesAllFixtures,
  predictResult,
} = require("../controllers/predictionsController");
const {
  fetchAndCacheFixtureForPrediction,
} = require("../services/fetchAndCacheFixture");
const {
  fetchAndCacheLeagueStandings,
} = require("../services/fetchAndCacheService");
const { protect, hasEnoughTokens } = require("../controllers/authController");

const router = express.Router();

router.get(
  "/predictResults/:leagueId/:season/:fixtureId/:team1Id/:team2Id/:predict",
  protect,
  hasEnoughTokens,
  fetchAndCacheLeagueStandings,
  fetchAndCacheFixtureForPrediction,
  getTeamsLastTenFixtures,
  predictResult
);

router.get(
  "/getFixture/:fixtureId",
  fetchAndCacheLeagueStandings,
  fetchAndCacheFixtureForPrediction
);

module.exports = router;
