const express = require("express");
const router = express.Router();
const logger = require("../settings/winston");
const mariaConnQuery = require("./mariaConn.controllers");

//* res.locals.id === mideleware에서 가져온 token을 decrypt하면 나오는 clientkey_id

//* JOB CREATE
const doCreateJob = async (req, res, next) => {
  try {
    const data = req.body;

    //jobname : data_type/aciton으로 구성
    const result =
      await mariaConnQuery(`INSERT INTO config(endpoint,data_type,client_key_id,password,term,crontab,jobname,username,action) \
    values(
      "${data.endpoint}",
      "${data.data_type}",
      ${res.locals.id},
      "${data.password}",
      "${data.term}",
      "${data.crontab}",
      "${data.data_type}/${data.action}",
      "${data.username}",
      "${data.action}")`);

    res.status(201).json({
      data: res.locals.id,
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
};

//*JOB LIST
const doReadJob = async (req, res, next) => {
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
};

//* JOB UPDATE/DELETE/TOGGLE use query parameter (clentkeyid + jobname + action)

//*JOB UPDATE
const doUpdateJob = async (req, res, next) => {
  try {
    const dataType = req.query.dataType;
    const action = req.query.action;
    const data = req.body;

    const result = await mariaConnQuery(`UPDATE config SET
      endpoint  = "${data.endpoint}",
      data_type = "${data.dataType}",
      password  = "${data.password}",
      term      = "${data.term}",
      crontab   = "${data.crontab}",
      jobname   = "${data.dataType}/${data.action}",
      username  = "${data.username}",
      action    = "${data.action}" where data_type = "${dataType}" AND action = "${action}" AND client_key_id = ${res.locals.id}`);

    res.status(200).json({
      success: true,
      message: "updated!",
    });
    logger.info(
      `user : ${data.username} // log ${data.term} ${data.dataType} ${data.dataType}/${data.action}  ${data.action} has been updated! `
    );
    logger.info(`user : ${dataType} ${action} has been updated! `);
  } catch (error) {
    res.status(400).send({
      success: false,
      error: error.message,
    });
    logger.error(`${error.message} - job list update failed`);
  }
};

//*JOB DELETE
const doDeleteJob = async (req, res, next) => {
  try {
    const dataType = req.query.dataType;
    const action = req.query.action;

    const result = await mariaConnQuery(
      `DELETE FROM config where data_type = "${dataType}" AND action = "${action}" AND client_key_id = ${res.locals.id}`
    );

    res.status(200).json({
      success: true,
      message: "deleted!",
    });
    logger.info(
      `clientId : ${res.locals.id} data_type : ${dataType} action ${action} deleted!`
    );
  } catch (error) {
    res.status(400).send({
      success: false,
      error: error.message,
    });
    logger.error(`${error.message} - job deletion failed!`);
  }
};

//*JOB TOGGLE ON/OFF if off(0)--> on(1)/ on(1)--> off(0)
const doToggleJob = async (req, res, next) => {
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
        `client_key_id : ${res.locals.id}// ${dataType}/${action} toggle turned off `
      );
    } else if (toggle === 0) {
      await mariaConnQuery(
        `UPDATE config SET toggle = 1 where data_type = "${dataType}" AND action = "${action}" AND client_key_id = ${res.locals.id}`
      );
      logger.info(
        `client_key_id : ${res.locals.id}// ${dataType}/${action} toggle turned on `
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
};

module.exports = {
  doCreateJob,
  doReadJob,
  doUpdateJob,
  doDeleteJob,
  doToggleJob,
};
