import Question from "../models/question.js";
import Thread from "../models/thread.js";
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

/*************************** GET COMPLETION AND TAG FROM SEQ CHATBOT AND SAVE QUESTION TO DB ***************************/
async function getResponse(message) {
    try {
        const response = await axios.post('http://127.0.0.1:5000/getResponse', {
            'message': message
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

//get completion and tag from seq bot
export async function getResponseSeq(req, res) {
    try {
        const userId = req.user["id"];
        var threadId = req.body.threadId;
        const user = await User.findById(userId);
        const prompt = req.body.prompt
        const response = await getResponse(prompt)
        if (response) {
            var title="Untitled"
            const predictedTag = response.tag;
            const predictedSubTag = response.subtag;
            const completion = response.completion;
            let thread
            if(predictedTag!=null && predictedTag!=""){
                title=predictedTag+": "+predictedSubTag
            }
            if (threadId==null || threadId != "") {
                thread = await Thread.findById({ "_id": threadId });
            }

            if (!thread) {
                thread = new Thread({
                    title: title,
                    user: userId,
                });
                threadId = thread._id
            }

            const question = createQuestion(prompt, completion, predictedTag,predictedSubTag, userId, threadId)
            await question.save().then(async q => {
                if (!thread.questions) {
                    thread.questions = [];
                }
                thread.questions.push(q);
                thread.save().then(async t => {
                    if (!user.threads) {
                        user.threads = [];
                    }
                    const threadIds = user.threads.map(thread => thread._id.toString());
                    if (!threadIds.includes(t._id.toString())) {
                        user.threads.push(t);
                        await user.save();
                    }

                })
                res.status(201).json({ question: q });
            })
        } else {
            res.status(500).json({ message: "Couldn't reach bot!" });
        }
    } catch (e) {
        res.status(500).json({ message: "Internal Server Error!" });
    }
}


//create question
function createQuestion(prompt, completion, predictedTag,predictedSubTag, userId, threadId) {
    const question = new Question({
        prompt: prompt,
        completion: completion,
        tag: predictedTag,
        subtag: predictedSubTag,
        user: userId,
        thread: threadId
    });
    return question
}

/*************************** BOTPRESS ***************************/
async function askBot(message) {
    const botpressUrl = 'http://localhost:3000/api/v1/bots/welcomebot/converse/userId/secured?include=nlu';
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': process.env.BOTPRESS_TOKEN
    };
    const data = { text: message };
    const response = await axios.post(botpressUrl, data, { headers });
    return response.data.responses[0].text;
}

export async function getBotpressResponse(req, res) {
    try {
        const response = await askBot(req.body.prompt);
        res.status(200).json({ response });
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error!" });
    }
}