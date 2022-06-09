import express from "express";
const app = express();

import dotenv from "dotenv";
dotenv.config();

import bodyparser from "body-parser";
app.use(bodyparser.urlencoded({ extended: true }));

import cors from "cors";
app.use(cors());

import mongoose from "mongoose";
import User from "./models/user.js";
import Exercise from "./models/exercise.js";

mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("connected succesfully."))
  .catch((err) => console.error(err));

//62a16e3b8413530938cc4e55

// {
// "_id": "62a16e3b8413530938cc4e55",
// "username": "zar_ni_myo",
// "date": "Thu Jun 09 2022",
// "duration": 45,
// "description": "Playing table tennis"
// }

app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.get("/api/users", (req, res) => {
  User.find({}, (err, result) => {
    res.send(result);
  });
});

app.post("/api/users", (req, res) => {
  const { username } = req.body;
  User.create({ username }, (err, result) => {
    res.send(result);
  });
});

app.post("/api/users/:id/exercises", (req, res) => {
  const id = req.params.id;
  const { description, duration, date } = req.body;
  User.findById(id, (err, data) => {
    if (err || !data) {
      res.send("Could not find user");
    } else {
      const newExercise = new Exercise({
        userId: id,
        description,
        duration,
        date: date ? new Date(date) : new Date(),
      });
      newExercise.save((err, newData) => {
        if (err || !newData) {
          res.send("Could not save exercise");
        } else {
          res.send({
            _id: data._doc._id,
            username: data._doc.username,
            description: newData.description,
            duration: newData.duration,
            date: newData.date.toDateString(),
          });
        }
      });
    }
  });
});

app.get("/api/users/:id/logs", (req, res) => {
  const id = req.params.id;
  const { from, to, limit } = req.query;
  User.findById(id, (err, data) => {
    if (err || !data) {
      res.send("Could not find user");
    } else {
      let dateFilter = {};
      if (from) {
        dateFilter["$gte"] = new Date(from);
      }
      if (to) {
        dateFilter["$lte"] = new Date(to);
      }
      console.log(dateFilter);
      let filter = {
        userId: id,
      };
      if (from || to) {
        filter.date = dateFilter;
      }
      console.log(filter);

      let defaultLimit = limit ? Number(limit) : 50;
      Exercise.find(filter)
        .limit(+defaultLimit)
        .exec((err, results) => {
          if (err || !results) {
            res.send([]);
          } else {
            const logs = results.map((result) => ({
              description: result.description,
              duration: result.duration,
              date: result.date.toDateString(),
            }));
            res.send({
              _id: data._id,
              username: data.username,
              count: results.length,
              log: logs,
            });
          }
        });
    }
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
