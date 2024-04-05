const express = require("express");
const router = express.Router();
const {
  getAllJobs,
  getJob,
  addJob,
  updateJob,
  deleteJob,
  getStats,
} = require("../controllers/jobs");

router.route("/").get(getAllJobs).post(addJob);
router.route("/stats").get(getStats);
router.route("/:id").get(getJob).patch(updateJob).delete(deleteJob);

module.exports = router;
