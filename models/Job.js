const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, "Please provide the company name"],
      maxlength: [50, "Company name can't exceed 50 characters"],
    },
    position: {
      type: String,
      required: [true, "Please provide the position"],
      maxlength: [100, "Position can't exceed 100 characters"],
    },
    status: {
      type: String,
      enum: {
        values: ["interview", "declined", "pending"],
        message: "Status '{VALUE}' is not supported",
      },
      default: "pending",
    },
    jobLocation: {
      type: String,
      required: [true, "Please provide the job location"],
      maxlength: [20, "Job location can't exceed 20 characters"],
    },
    jobType: {
      type: String,
      enum: {
        values: ["full-time", "part-time", "remote", "internship"],
        message: "Job type '{VALUE}' is not supported",
      },
      default: "full-time",
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "User details not available"],
    },
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", JobSchema);

module.exports = Job;
