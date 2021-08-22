var express = require("express");
var app = express();
const configRouter = require("./routes/config.js");
const cors = require("cors");
const jwt_decode = require("jwt-decode");

app.use(express.json());
app.use(cors());

// token ==> jwt decrypt decorator
function token(req, res, next) {
  const token = req.header("Authorization");
  const payload = jwt_decode(token);
  const clientKeyId = payload["clientKeyID"];
  res.locals.id = clientKeyId;
  next();
}
app.use(token);
app.use("/config", configRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`LISTENING ON ${port}`);
});
