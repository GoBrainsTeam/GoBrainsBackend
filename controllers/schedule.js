import Schedule from "../models/schedule.js";
import User from "../models/user.js";
import axios from 'axios';

export async function uploadSchedule(req, res) {

  if (req.file) {
    await sendSchedules()
    res.status(201).json({ message: "Schedule uploaded!" });
  }
  else {
    res.status(500).send({ message: "Failed to upload schedule!" })
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