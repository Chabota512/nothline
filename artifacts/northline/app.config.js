require("dotenv").config();
const appJson = require("./app.json");

module.exports = () => ({
  expo: {
    ...appJson.expo,
    extra: {
      geminiApiKey: process.env.GEMINI_API_KEY ?? "",
      groqApiKey: process.env.GROQ_API_KEY ?? "",
    },
  },
});
