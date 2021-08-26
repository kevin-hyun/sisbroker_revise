const express = require("express");
const router = express.Router();
const JobRouter = require("../controllers/config.controllers");

router.post("/", JobRouter.doCreateJob);
router.get("/list", JobRouter.doReadJob);
router.put("/", JobRouter.doUpdateJob);
router.delete("/", JobRouter.doDeleteJob);
router.post("/toggle", JobRouter.doToggleJob);

module.exports = router;
