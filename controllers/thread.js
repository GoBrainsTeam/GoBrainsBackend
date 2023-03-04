import Thread from "../models/thread.js";
import User from "../models/user.js";

export async function saveThread(req, res) {
    try {
        const userId = req.user["id"]
        const user = await User.findById(userId)
        if (user) {
            const thread = new Thread({
                question:req.body.question,
                answer:req.body.answer,
                tag:req.body.tag,
                subtag:req.body.subtag,
                user:userId
            });
            await thread.save().then(async t => {
                user.threads.push(thread);
                await user.save();
                res.status(201).json({ message: thread })
            })
        } else {
            return res.status(404).send({ message: "User not found!" });
        }
    } catch (e) {
        res.status(500).send({ message: "Internal Server Error!" })
    }
}

export async function randomAnswer(req, res) {
    try {
        const answers = [
            "The student must hold a scientific, economic, or technical baccalaureate. More information can be found on: https://esprit.tn/admission/esprit-ingenieur",
            "The student must hold a certificate of success in the 1st year of preparatory school or a certificate of success in the 1st year of engineering school (integrated preparatory program). More information can be found on: https://esprit.tn/admission/esprit-ingenieur",
            "The student must hold a scientific bachelor's degree or have passed entrance examination for national engineering schools. More information can be found on: https://esprit.tn/admission/esprit-ingenieur",
            "The student must hold a scientific or technical master's degree (M1) in the relevant field. More information can be found on: https://esprit.tn/admission/esprit-ingenieur",
            "The student must hold a scientific or technical bachelor's degree (duration of studies: 4 years). More information can be found on: https://esprit.tn/admission/esprit-ingenieur",
            "The student must hold a degree in computer science or a related field. More information can be found on: https://esprit.tn/admission/esprit-ingenieur",
          ];
          const index = Math.floor(Math.random() * answers.length);
          const randomAnswer = answers[index];
        return res.status(202).send({ message: randomAnswer });
    } catch (e) {
        res.status(500).send({ message: "Internal Server Error!" })
    }
}
  