const express = require("express");
const {
  getCountries,
  getCountriesLeagues,
  getLiveMatches,
  getFixtures,
  getFixtureCenter,
  getFixtureLineups,
  getFixtureHead2Head,
  getLeague,
  getLeagueFixtures,
  getEliteLeagues,
  getUefaLeagues,
  getLeagueStandings,
  getTeamData,
  getTeamStats,
  getPlayerProfile,
  getSingleFixture,
} = require("../controllers/fballController");

const {
  fetchAndCacheGroupedLeagues,
  fetchAndCacheLiveMatches,
  fetchAndCacheFixtures,
  fetchAndCacheLeagueStandings,
} = require("../services/fetchAndCacheService");
const {
  fetchAndCacheFixtureCenter,
  fetchAndCacheFixtureLineUps,
  fetchAndCacheFixtureHead2Head,
  fetchAndCacheLeagueFixtures,
  fetchAndCacheSingleFixture,
} = require("../services/fetchAndCacheFixture");
const {
  fetchAndCacheEliteLeagues,
  fetchAndCacheUefaLeagues,
} = require("../services/fetchAndCacheElite");
const {
  fetchAndCacheTeam,
  fetchAndCacheTeamStats,
  fetchAndCachePlayerProfile,
} = require("../services/fetchAndCacheTeams");
const { search } = require("../services/fetchAndCacheSearch");

const router = express.Router();

router.get("/getCountries", fetchAndCacheGroupedLeagues, getCountries);
router.get(
  "/getCountriesLeagues/:country",
  fetchAndCacheGroupedLeagues,
  getCountriesLeagues
);
router.get(
  "/getLeagueFixtures/:leagueId/:type",
  fetchAndCacheLeagueFixtures,
  getLeagueFixtures
);

router.get(
  "/getLeagueStandings/:season/:leagueId",
  fetchAndCacheLeagueStandings,
  getLeagueStandings
);

router.get("/getLiveMatches", fetchAndCacheLiveMatches, getLiveMatches);
router.get("/getFixtures/:date", fetchAndCacheFixtures, getFixtures);
router.get(
  "/getFixtureCenter/:fixtureId",
  fetchAndCacheFixtureCenter,
  getFixtureCenter
);

router.get(
  "/getSingleFixture/:fixtureId",
  fetchAndCacheSingleFixture,
  getSingleFixture
);

router.get(
  "/getFixtureLineups/:fixtureId",
  fetchAndCacheFixtureLineUps,
  getFixtureLineups
);

router.get(
  "/getFixtureH2H/:fixtureId",
  fetchAndCacheFixtureHead2Head,
  getFixtureHead2Head
);

router.get("/getEliteLeagues", fetchAndCacheEliteLeagues, getEliteLeagues);
router.get("/getUefaLeagues", fetchAndCacheUefaLeagues, getUefaLeagues);

router.get("/getTeamData/:teamId", fetchAndCacheTeam, getTeamData);
router.get(
  "/getTeamStats/:leagueId/:teamId/:season",
  fetchAndCacheTeamStats,
  getTeamStats
);
router.get(
  "/getPlayerProfile/:playerId/:season",
  fetchAndCachePlayerProfile,
  getPlayerProfile
);

router.get("/search", search);

module.exports = router;
