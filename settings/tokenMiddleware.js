// token middleware ==> jwt decrypt decorator
const jwt_decode = require("jwt-decode");

function token(req, res, next) {
  const token = req.header("Authorization");
  const payload = jwt_decode(token);
  const clientKeyId = payload["clientKeyID"];
  res.locals.id = clientKeyId;
  next();
}

module.exports = token;
