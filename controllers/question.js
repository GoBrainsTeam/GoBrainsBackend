import Question from "../models/question.js";
import User from "../models/user.js";
import axios from 'axios';


/*************************** GENERATED RANDOM ANSWER WHEN CALLED ***************************/
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

/*************************** GET PROMPT TAG FROM API ***************************/
async function getTag(prompt) {
    try {
        const response = await axios.post('http://127.0.0.1:5000/predict', {
            'prompt': prompt
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data.tag;
    } catch (error) {
        console.error(error);
    }
}

/*************************** GET USER QUESTION, GET CORRESPONDING TAG AND SAVE TO DB ***************************/
export async function predictTag(req, res) {
    try {
        const userId = req.user["id"]
        const user = await User.findById(userId)
        const prompt = req.body.prompt;
        getTag(prompt)
            .then(async predictedTag => {
                const question = new Question({
                    prompt: req.body.prompt,
                    completion: "test",
                    tag: predictedTag,
                    subtag: "",
                    user: userId
                });
                await question.save().then(async t => {
                    user.questions.push(question);
                    await user.save();
                    res.status(201).json({ question })
                })
            })
            .catch(error => {
                console.error(error);
                res.status(500).send({ message: "Internal Server Error!" });
            });

    } catch (e) {
        res.status(500).send({ message: "Internal Server Error!" })
    }
}