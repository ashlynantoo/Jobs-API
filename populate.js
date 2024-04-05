require("dotenv").config();

const connectDB = require("./db/connect");
const Job = require("./models/Job");

const jobsList = require("./mock-data.json");

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log("Connected to DB...");
    await Job.deleteMany();
    await Job.create(jobsList);
    console.log("Success!!!");
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start();
