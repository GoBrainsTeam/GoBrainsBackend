import User from "../models/user.js";
import axios from 'axios';
import { io } from '../index.js';

export async function uploadSchedule(req, res) {

  if (req.file) {
    await sendSchedules()
    res.status(201).json({ message: "Schedule uploaded!" });
  }
  else {
    res.status(500).send({ message: "Failed to upload schedule!" })
  }
}

export async function saveSchedule(req, res) {
  try {

  if (req.file) {
      await res.status(201).json({ message: "Schedule uploaded!" });
      const userId = req.user["id"];
      const user = await User.findById(userId);
      const userGrade = user.level + user.speciality + user.classe
      const fn = req.file.filename.toLocaleLowerCase()
      if (user.role == "STUDENT" && fn.includes(userGrade.toLowerCase())) {
        console.log("NOTIF TRIGGERED")
        io.sockets.emit("message", {
          message: "Next week's schedule is uploaded!",
        });
      }
    } else {
      res.status(400).send({ message: "Failed to upload schedule!" });
    }
  } catch (error) {
    res.status(500).send({ message: "Internal server error!" });
  }
}


export async function sendNotif(req, res) {
  try {
    const response = req.body.response
    if (response.toLowerCase() == "done") {
      const userId = req.user["id"]
      const user = await User.findById(userId)
      if (user.role.toLowerCase() == "student") {
        io.sockets.emit('message', { message: "Next week's schedule is uploaded!" });
      }
      res.status(200).json({ message: "Operation succeeded!" });
    }else{
      res.status(400).send({ message: "Operation failed!" })
    }
  } catch (e) {
    res.status(500).send({ message: "Internal server error!" })
  }
}

async function sendSchedules() {
  try {
    const response = await axios.post('http://127.0.0.1:5000/schedule', {
      'pdf_url': "http://localhost:9090/schedule/schedules.pdf"
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return true;
  } catch (error) {
    console.error(error);
  }
}

/*export async function saveSchedule(req, res) {
    try {
      if (req.file) {
        const emploi = new Schedule({
          grade: req.body.grade,
          schedule:req.file.filename
        });
        await emploi.save();
        res.status(201).json({ message: "Schedule saved!" });
      }else{
        res.status(400).json({ message: "No Schedule provided!" });
      }
    } catch (e) {
        res.status(500).send({ message: "Internal Server Error!" });
    }
  }
  


export async function getSchedule(req, res) {
    try {
        const userId = req.user["id"]
        const user = await User.findById(userId)
        if (user) {
            const userGrade = user.level + user.speciality + user.classe
            var schedule = await Schedule.findOne({ grade: userGrade })
            if (schedule) {
                res.status(200).json(schedule)
            } else {
                res.status(404).json({ message: "Schedule not found!" })
            }
        } else {
            res.status(404).json({ message: "User not found!" })
        }
    } catch (e) {
        res.status(500).send({ message: "Internal Server Error!" });
    }
}*/