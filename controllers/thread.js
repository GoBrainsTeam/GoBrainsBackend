import Thread from "../models/thread.js";

/*************************** GET MY THREADS ***************************/
export async function getAll(req, res) {
    try {
        const id = req.user["id"]
        var threads = await Thread.find({ user: id }).sort({ createdAt: -1 }).populate("questions");
        if (threads.length != 0) {
            res.status(200).send({ threads })
        } else if (threads.length == 0) {
            res.status(404).send({ message: "No threads created!" })
        } else {
            res.status(400).send({ message: "Failed to get threads!" })
        }
    } catch (e) {
        res.status(500).send({ message: "Internal Server Error!" })
    }
}

/*************************** GET THREAD BY ID ***************************/
export async function getOne(req, res) {
    try {
        const threadId = req.body.threadId
        const thread = await Thread.findById(threadId).populate("questions")
        if (thread) {
            res.status(200).send({ thread })
        } else if (!thread) {
            res.status(404).send({ message: "Thread not found!" })
        } else {
            res.status(400).send({ message: "Failed to get thread!" })
        }
    } catch (e) {
        res.status(500).send({ message: "Internal Server Error!" })
    }
}

/*************************** DELETE THREAD ***************************/
export async function deleteThread(req, res) {
    try {
        const threadId = req.body.threadId
        let thread = await Thread.findById(threadId)
        if (thread) {
            await thread.remove()
            return res.status(204).send({ message: "Thread deleted!" })
        } else {
            return res.status(404).send({ message: "Thread not found!" })
        }
    }
    catch (e) {
        res.status(500).send({ message: "Internal Server Error!" })
    }
}
