var express = require("express");
var app = express();
const configRouter = require("./routes/config.route");
const cors = require("cors");
const token = require("./settings/tokenMiddleware");

app.use(express.json());
app.use(cors());

app.use(token);
app.use("/config", configRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`LISTENING ON ${port}`);
});
