// Require Express, MongoDB, Cors, Dotenv and Declaring Port
const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const moment = require("moment");

// Creating Server App
const app = express();
const port = 1001;

// Middle Ware
app.use(cors());
app.use(express.json());

// Database Credentials
const MONGO_STR = `mongodb+srv://chat-application:chat-application1234@cluster0.lznpq.mongodb.net/alarm`;
const client = new MongoClient(MONGO_STR, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Async Function for Data Management
async function run() {
  try {
    const database = client.db("alarm");
    await client.connect();
    const TimeSchedule = database.collection("Schedules");
    // const User = database.collection("Users");
    console.log("DB CONNECTED");

    const checkSchedule = async (email) => {
      const schedules = await TimeSchedule.find({ email });
      return schedules;
    };

    const scheduleById = async (_id) => {
      return await TimeSchedule.findOne({ _id });
    };

    const addSchedule = async (data) => {
      const newData = { ...data };
      newData.createdAt = new Date().toISOString();
      return await TimeSchedule.insertOne(newData);
    };
    // POST API FOR ADDING Schedule
    app.post("/add-schedule", async (req, res) => {
      if (!req?.body?.datetime)
        return res
          .status(404)
          .json({ success: false, msg: `Date Time is required!` });
      //   //Time compare start
      const add20 = moment(req.body.datetime);
      if (15000 > add20.diff(moment())) {
        return res.status(404).json({
          success: false,
          msg: "Time Should be",
        });
      }

      const { insertedId } = await addSchedule(req.body);
      const result = await scheduleById(insertedId);
      res.status(200).json({ schedule: result });
    });

    // GET API For ALL Schedules
    app.get("/my-schedule/:email", async ({ params: { email } }, res) => {
      const schedule = await checkSchedule(email);
      const allSchedules = await schedule.toArray();

      const filtered = allSchedules.reduce((acc, cur) => {
        if (moment(cur.datetime) > moment()) {
          acc = [...acc, cur];
        }
        return acc;
      }, []);

      res.status(200).json(filtered);
    });

    // DLETE FOOD API
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);
// Default Root
app.get("/", (req, res) => {
  res.send("Bismillah");
});

app.listen(port, () => {
  console.log(`Listening to PORT - ${port}`);
});
