const express = require("express");
const cors = require("cors");

const { getRichieRichResponse } = require("./clients/richieRich");
const { getWebSocketData } = require("./clients/richieRich");
const RRML2HTML = require("./utils/RRML2HTML");

const PORT = 8081;
const app = express();

app.use(cors());
app.use(express.json());

app.post("/", async (req, res) => {
  const requestPrompt = req.body.prompt;
  const response = await getWebSocketData(requestPrompt);
  const responseHTML = RRML2HTML(response.join(""));
  res.send(responseHTML);
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
