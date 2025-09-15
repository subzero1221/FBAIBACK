const { countries } = require("../services/football");

function sortAndGroupFixtures(fixtures) {
  const countryPriorityMap = countries.reduce((acc, country, index) => {
    acc[country] = index;
    return acc;
  }, {});

  const sortedFixtures = fixtures.sort((a, b) => {
    const countryA = a.league.country;
    const countryB = b.league.country;

    const priorityA = countryPriorityMap.hasOwnProperty(countryA)
      ? countryPriorityMap[countryA]
      : Number.MAX_SAFE_INTEGER;

    const priorityB = countryPriorityMap.hasOwnProperty(countryB)
      ? countryPriorityMap[countryB]
      : Number.MAX_SAFE_INTEGER;

    return priorityA - priorityB;
  });

  const groupedFixtures = {};

  sortedFixtures.forEach((fixture) => {
    const country = fixture.league.country;
    if (!groupedFixtures[country]) groupedFixtures[country] = [];
    groupedFixtures[country].push(fixture);
  });

  return groupedFixtures;
}

function filterElite(fixtures, filterBy) {
  const eliteLeagues = fixtures.filter((fixture) => {
    return filterBy.includes(fixture.league.id);
  });

  return eliteLeagues;
}

module.exports = { sortAndGroupFixtures, filterElite };
