const express = require("express");
const router = express.Router();
const logger = require("../settings/winston");
const conmaria = require("./db_config.js");

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

//* res.locals.id === mideleware에서 가져온 token을 decrypt하면 나오는 clientkey_id

//* JOB CREATE
router.post("/", async (req, res, next) => {
  try {
    const data = req.body;
    //기존에 크론탭 존재하는지 확인하는 로직  //
    let second = await mariaConnQuery(
      `SELECT crontab from config where client_key_id = ${res.locals.id}`
    );
    let institutionKey = await mariaConnQuery(
      `SELECT client_key from client where id = ${res.locals.id}`
    );
    // 새 크론탭 5초씩 차이 두는 로직  기존 크론탭 없다면 "05"초 부여
    if (!second.slice(-1)[0]) {
      second = "05";
    } else {
      second = (
        parseInt(second.slice(-1)[0]["crontab"].substring(0, 2)) + 5
      ).toString();
      if (parseInt(second) >= 60) {
        second = "00";
      }
    }

    //jobname : data_type/aciton으로 구성
    const result =
      await mariaConnQuery(`INSERT INTO config( endpoint,data_type,client_key_id,password,term,crontab,jobname,username,action) \
    values(
      "${data.endpoint}",
      "${data.data_type}",
      ${res.locals.id},
      "${data.password}",
      "${data.term}",
      "${second + " " + data.crontab}",
      "${data.data_type}/${data.action}",
      "${data.username}",
      "${data.action}")`);

    // 위에 액션으로 추가된 로우(가장마지막 로우)의 id 가져오기
    let getId = await mariaConnQuery(
      "SELECT id from config order by id DESC  limit 1"
    );
    //쿼리 결과 meta데이터가 obj에 포함 --> 원하는 값만 가져오기 위해 슬라이싱
    getId = Object.entries(getId[0])[0][1];

    //action이 refresh인경우에 비교를 위해서 v1 v2테이블 만든다.
    if (data.action === "refresh") {
      await mariaConnQuery(`CREATE TABLE V1_${institutionKey}_${getId}(
        EXTERNAL_COURSE_KEY VARCHAR(45) NOT NULL,
        EXTERNAL_PERSON_KEY VARCHAR(45) NOT NULL,
        ROLE VARCHAR(45) NOT NULL,
        AVAILABLE_IND VARCHAR(45) NOT NULL,
        ROW_STATUS VARCHAR(45) NOT NULL,
        ROSTER_IND VARCHAR(45) NOT NULL,
        RECEIVE_EMAIL_IND VARCHAR(45) NOT NULL,
        )`);
      await mariaConnQuery(`CREATE TABLE V2_${institutionKey}_${getId}(
          EXTERNAL_COURSE_KEY VARCHAR(45) NOT NULL,
          EXTERNAL_PERSON_KEY VARCHAR(45) NOT NULL,
          ROLE VARCHAR(45) NOT NULL,
          AVAILABLE_IND VARCHAR(45) NOT NULL,
          ROW_STATUS VARCHAR(45) NOT NULL,
          ROSTER_IND VARCHAR(45) NOT NULL,
          RECEIVE_EMAIL_IND VARCHAR(45) NOT NULL
          )`);
    }

    res.status(201).json({
      data: data,
      success: true,
      message: "data inserted!",
    });
    //
    logger.info(
      `user: ${data.username}  //  ${data.endpoint} ${data.term} ${data.data_type} ${data.data_type}/${data.action} ${data.action} created!`
    );
  } catch (error) {
    res.status(400).send({
      success: false,
      error: error.message,
    });
    logger.error(`${error.message} - job creation failed!`);
  }
});

//*JOB LIST
router.get("/list", async (req, res, next) => {
  try {
    const result = await mariaConnQuery(
      `SELECT * FROM config WHERE client_key_id = ${res.locals.id}`
    );

    res.status(200).json({
      result: result,
      success: true,
    });
    logger.info(`clienKeyId : ${res.locals.id} list call`);
  } catch (error) {
    res.status(400).send({
      success: false,
      error: error.message,
    });
    logger.error(`${error.message} - job list call failed!`);
  }
});

//*JOB UPDATE -- 변경된 부분만 주는 것이 아니라 전체 자료 주기로 한 경우
//  query sstring --- clentkeyid + jobname + action
router.post("/", async (req, res, next) => {
  try {
    const data_type = req.query.data_type;
    const action = req.query.action;

    const data = req.body;
    // second 바꾸는 경우 --> create로직과 동일
    let second = await mariaConnQuery(
      `SELECT crontab from config where data_type = "${data_type}" AND action = "${action}" AND client_key_id = ${res.locals.id}`
    );
    second = parseInt(
      second.slice(-1)[0]["crontab"].substring(0, 2)
    ).toString();

    const result = await mariaConnQuery(`UPDATE config SET
      endpoint  = "${data.endpoint}",
      data_type = "${data.data_type}",
      password  = "${data.password}",
      term      = "${data.term}",
      crontab   = "${second + " " + data.crontab}",
      jobname   = "${data.jobname}",
      username  = "${data.username}",
      action    = "${
        data.action
      }" where where data_type = "${data_type}" AND action = "${action}" AND client_key_id = ${
      res.locals.id
    } `);

    res.status(200).json({
      success: true,
      message: "updated!",
    });
    logger.info(
      `user : ${data.username} // log ${data.term} ${data.data_type} ${data.jobname}  ${data.action} has been updated! `
    );
  } catch (error) {
    res.status(400).send({
      success: false,
      error: error.message,
    });
    logger.error(`${error.message} - job list update failed`);
  }
});

//*JOB DELETE
// query string --- clentkeyid + jobname + action

router.delete("/", async (req, res, next) => {
  try {
    const data_type = req.query.data_type;
    const action = req.query.action;

    // 연관된 v1 v2 table부터 삭제
    let institutionKey = await mariaConnQuery(
      `SELECT client_key from client where id = ${res.locals.id}`
    );

    let getId = await mariaConnQuery(
      `SELECT id from config where data_type = "${data_type}" AND action = "${action}" AND client_key_id = ${res.locals.id}`
    );

    await mariaConnQuery(`DROP TABLE V1_${institutionKey}_${getId}`);
    await mariaConnQuery(`DROP TABLE V1_${institutionKey}_${getId}`);

    const result = await mariaConnQuery(
      `DELETE FROM config where data_type = "${data_type}" AND action = "${action}" AND client_key_id = ${res.locals.id}`
    );

    res.status(200).json({
      success: true,
      message: "deleted!",
    });
    logger.info(
      `clientId : ${res.locals.id} data_type : ${data_type} action ${action} deleted!`
    );
  } catch (error) {
    res.status(400).send({
      success: false,
      error: error.message,
    });
    logger.error(`${error.message} - job deletion failed!`);
  }
});

//*JOB TOGGLE ON/OFF if off(0)--> on(1)/ on(1)--> off(0)
// query string --- clentkeyid + jobname + action

router.post("/toggle", async (req, res, next) => {
  try {
    const dataType = req.body.dataType;
    const action = req.body.action;

    const result = await mariaConnQuery(
      `select toggle from config where data_type = "${dataType}" AND action = "${action}" AND client_key_id = ${res.locals.id}`
    );

    const toggle = result[0].toggle;

    if (toggle === 1) {
      await mariaConnQuery(
        `UPDATE config SET toggle = 0 where data_type = "${dataType}" AND action = "${action}" AND client_key_id = ${res.locals.id}`
      );
      logger.info(
        `client_key_id : ${res.locals.id} ${dataType} ${action} toggle turned off `
      );
    } else if (toggle === 0) {
      await mariaConnQuery(
        `UPDATE config SET toggle = 1 where data_type = "${dataType}" AND action = "${action}" AND client_key_id = ${res.locals.id}`
      );
      logger.info(
        `client_key_id : ${res.locals.id} ${dataType} ${action} toggle turned on `
      );
    }

    res.status(200).json({
      success: true,
      message: "toggle status changed",
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      error: error.message,
    });
    logger.error(
      `${error.message} , ${dataType} ${action} - toggle control failed!`
    );
  }
});

module.exports = router;
