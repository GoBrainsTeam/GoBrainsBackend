import Schedule from "../models/schedule.js";
import User from "../models/user.js";

export async function saveSchedule(req, res) {
    const schedule = new Schedule({
        grade: req.body.grade,
    });

    if (req.file) {
        schedule.schedule = req.file.filename;
    }else{
        res.status(400).json({ message: "No Schedule provided!" })
    }
    try {
        await schedule.save();
        res.status(201).json({ message: "Schedule saved!" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error!" });
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
}

