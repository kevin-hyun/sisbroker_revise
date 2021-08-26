const conmaria = require("../settings/db_config.js");

const mariaConnQuery = async (query) => {
  let marconn;
  try {
    marconn = await conmaria.mariaDb.getConnection();
    const rows = await marconn.query(query);
    logger.info("query completed");
    marconn.end();
    return rows;
  } catch (e) {
    logger.error(`${e}`);
    console.log(e);
  }
};

modeule.exports = mariaConnQuery;
