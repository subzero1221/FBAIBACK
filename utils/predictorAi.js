const { OpenAI } = require("openai");
const dotenv = require("dotenv");

dotenv.config({ path: ".env" });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function predictResults(
  fixture,
  statToPredict,
  firstTeamData,
  secondTeamData,
  standingsData
) {
  const prompt = `
You are a smart football analyst. Based on historical performance and current standings, predict the **${statToPredict}** for the upcoming fixture.
Here is the fixture u should predict ${fixture}

---

📊 **Standings Info**:
${JSON.stringify(standingsData, null, 2)}

⚽ **First team Past Match Data** (related to ${statToPredict}):
${JSON.stringify(firstTeamData, null, 2)}

⚽ **Second team Past Match Data** (related to ${statToPredict}):
${JSON.stringify(secondTeamData, null, 2)}
---

Please answer:
1. What is the predicted number of **${statToPredict.toLowerCase()}** for each team?
2. Brief explanation why (form, matchups, etc).
3. Return result in this format:

{
  "homeTeam": "Team Name",
  "awayTeam": "Team Name",
  "homePrediction": number,
  "awayPrediction": number,
  "reason": "Short explanation"
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a smart football data analyst who predicts match statistics based on trends and league standings.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return response.choices[0].message.content;
  } catch (err) {
    console.error("❌ Prediction error:", err);
    return "Prediction failed.";
  }
}

module.exports = { predictResults };
