import Schedule from "../models/schedule.js";
import User from "../models/user.js";

export function uploadSchedule(req, res) {

  if (req.file) {
    res.status(201).json({ message: "Schedule uploaded!" });
  }
  else {
    res.status(500).send({ message: "Failed to upload schedule!" })
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