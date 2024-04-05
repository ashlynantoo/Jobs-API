const mongoose = require("mongoose");
const moment = require("moment");
const { StatusCodes } = require("http-status-codes");
const Job = require("../models/Job");
const { BadRequestError, NotFoundError } = require("../errors");

const getAllJobs = async (req, res) => {
  const queryObject = { createdBy: req.user.userId };

  const { search, status, jobType, sort } = req.query;

  if (search) {
    queryObject.position = { $regex: search, $options: "i" };
  }

  if (status && status !== "all") {
    queryObject.status = status;
  }

  if (jobType && jobType !== "all") {
    queryObject.jobType = jobType;
  }

  let result = Job.find(queryObject);

  if (sort) {
    if (sort === "latest") {
      result = result.sort("-createdAt");
    } else if (sort === "oldest") {
      result = result.sort("createdAt");
    } else if (sort === "a-z") {
      result = result.sort("position");
    } else if (sort === "z-a") {
      result = result.sort("-position");
    }
  } else {
    result = result.sort("-createdAt");
  }

  const page = Number(req.query.page) || 1;
  const skip = (page - 1) * 10;
  result = result.limit(10).skip(skip);

  const jobs = await result;
  const totalJobs = await Job.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalJobs / 10);

  res.status(StatusCodes.OK).json({
    totalJobs,
    numOfPages,
    jobs,
  });
};

const getJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req;
  const job = await Job.findOne({ createdBy: userId, _id: jobId });
  if (!job) {
    throw new NotFoundError(`No job with Id ${jobId}`);
  }
  res.status(StatusCodes.OK).json({ job });
};

const addJob = async (req, res) => {
  req.body.createdBy = req.user.userId;
  const job = await Job.create(req.body);
  res.status(StatusCodes.CREATED).json({ job });
};

const updateJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
    body: { status },
  } = req;
  if (status === "") {
    throw new BadRequestError("Status field can't be empty");
  }
  const job = await Job.findOneAndUpdate(
    { createdBy: userId, _id: jobId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!job) {
    throw new NotFoundError(`No job with Id ${jobId}`);
  }
  res.status(StatusCodes.OK).json({ job });
};

const deleteJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req;
  const job = await Job.findOneAndRemove({ createdBy: userId, _id: jobId });
  if (!job) {
    throw new NotFoundError(`No job with Id ${jobId}`);
  }
  res.status(StatusCodes.OK).send();
};

const getStats = async (req, res) => {
  const { userId } = req.user;

  let stats = await Job.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  stats = stats.reduce((statusInfo, stat) => {
    const { _id: status, count } = stat;
    statusInfo[status] = count;
    return statusInfo;
  }, {});

  const defaultStats = {
    pending: stats.pending || 0,
    interview: stats.interview || 0,
    declined: stats.declined || 0,
  };

  let monthlyApplications = await Job.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    { $limit: 6 },
  ]);

  monthlyApplications = monthlyApplications
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item;
      const date = moment()
        .month(month - 1)
        .year(year)
        .format("MMM YYYY");
      return { date, count };
    })
    .reverse();

  res.status(StatusCodes.OK).json({
    defaultStats,
    monthlyApplications,
  });
};

module.exports = { getAllJobs, getJob, addJob, updateJob, deleteJob, getStats };
