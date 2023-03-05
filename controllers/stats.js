import Question from "../models/question.js";
import User from "../models/user.js";

/*************************** USERS COUNT (ALL USERS IN DB EXCEPT ADMINS/NOT RELATED TO QUESTIONS) ***************************/
export async function countUsers(req, res) {
    try {
        const role = req.user["role"]
        if (role == 'ADMIN') {
            const usersCount = await User.countDocuments({ role: { $ne: "ADMIN" } });
            res.status(200).json({ result: usersCount });
        } else {
            res.status(401).send({ message: "Oops, looks like you're not an admin!" })
        }
    } catch (e) {
        res.status(500).send({ message: "Internal Server Error!" });
    }
}

/*************************** ROLES PERCENTAGES (ALL USERS IN DB EXCEPT ADMINS/NOT RELATED TO QUESTIONS) ***************************/
export async function getRolePercentage(req, res) {
    try {
        const role = req.user["role"]
        if (role == 'ADMIN') {
            const roles = ["STUDENT", "TEACHER", "GUEST"];
            const counts = await User.aggregate([
                {
                    $match: {
                        role: { $in: roles },
                    },
                },
                {
                    $group: {
                        _id: "$role",
                        count: { $sum: 1 },
                    },
                },
            ]);
            const total = counts.reduce((acc, { count }) => acc + count, 0);
            const result = roles.reduce((acc, role) => {
                const countObj = counts.find((c) => c._id === role) || { count: 0 };
                const res = countObj.count
                return { ...acc, [role]: res };
            }, {});
            res.status(200).json({ result });
        } else {
            res.status(401).send({ message: "Oops, looks like you're not an admin!" })
        }
    } catch (e) {
        res.status(500).send({ message: "Internal Server Error!" });
    }
}

/*************************** COUNT TOTAL NB ASKED QUESTIONS ***************************/
export async function countAsked(req, res) {
    try {
        const role = req.user["role"]
        if (role == 'ADMIN') {
            const totalAsked = await Question.countDocuments({ user: { $exists: true } });
            res.status(200).json({ result: totalAsked })
        } else {
            res.status(401).send({ message: "Oops, looks like you're not an admin!" })
        }
    } catch (e) {
        res.status(500).send({ message: "Internal Server Error!" })
    }
}

/*************************** STATS ON QUESTIONS BY TAGS ***************************/
export async function getTagStats(req, res) {
    try {
        const role = req.user["role"]
        if (role == 'ADMIN') {
            const totalQuestions = await Question.countDocuments();
            const tagstats = await Question.aggregate([
                { $group: { _id: "$tag", count: { $sum: 1 } } },
                { $project: { _id: 0, tag: "$_id", count: 1, percent: { $multiply: [{ $divide: ["$count", totalQuestions] }, 100] } } }
            ]);
            res.status(200).json({ result: tagstats })
        } else {
            res.status(401).send({ message: "Oops, looks like you're not an admin!" })
        }
    } catch (e) {
        res.status(500).send({ message: "Internal Server Error!" })
    }
}

/*************************** STATS ON QUESTIONS BY ROLE ***************************/
export async function getQuestionPercentageByRoles(req, res) {
    try {
        const role = req.user["role"];
        if (role == "ADMIN") {
            const roles = ["GUEST", "TEACHER", "STUDENT"];
            const roleCounts = roles.reduce((acc, role) => {
                return { ...acc, [role]: 0 };
            }, {});

            const counts = await User.aggregate([
                {
                    $match: {
                        role: { $in: roles },
                    },
                },
                {
                    $lookup: {
                        from: "questions",
                        localField: "questions",
                        foreignField: "_id",
                        as: "questions",
                    },
                },
                {
                    $project: {
                        role: 1,
                        questionCount: { $size: "$questions" },
                    },
                },
                {
                    $group: {
                        _id: "$role",
                        count: { $sum: "$questionCount" },
                    },
                },
            ]);

            const total = counts.reduce((acc, { count }) => acc + count, 0);
            counts.forEach(({ _id, count }) => {
                roleCounts[_id] = count;
            });
            const result = Object.keys(roleCounts).reduce((acc, role) => {
                const res = roleCounts[role];
                return { ...acc, [role]: res };
            }, {});

            return res.status(200).json({ result });
        } else {
            res.status(401).send({ message: "Oops, looks like you're not an admin!" })
        }
    } catch (e) {
        res.status(500).send({ message: "Internal Server Error!" });
    }
}

/*************************** STATS ON QUESTIONS BASED ON STUDENTS LEVELS ***************************/
export async function getQuestionPercentageByStudentLevel(req, res) {
    try {
        const role = req.user["role"];
        if (role == "ADMIN") {
            const levels = [1, 2, 3, 4, 5];
            const levelCounts = levels.reduce((acc, level) => {
                return { ...acc, [level]: 0 };
            }, {});
            const counts = await User.aggregate([
                {
                    $match: {
                        role: "STUDENT",
                        level: { $in: [1, 2, 3, 4, 5] } // add level filter
                    },
                },
                {
                    $lookup: {
                        from: "questions",
                        localField: "questions",
                        foreignField: "_id",
                        as: "questions",
                    },
                },
                {
                    $project: {
                        level: 1,
                        questionCount: { $size: "$questions" },
                    },
                },
                {
                    $group: {
                        _id: "$level",
                        count: { $sum: "$questionCount" },
                    },
                },
            ]);

            const total = counts.reduce((acc, { count }) => acc + count, 0);

            counts.forEach(({ _id, count }) => {
                levelCounts[_id] = count;
            });

            const result = Object.keys(levelCounts).reduce((acc, level) => {
                const res = levelCounts[level];
                return { ...acc, [level]: res };
            }, {});

            return res.status(200).json({ result });
        } else {
            res.status(401).send({ message: "Oops, looks like you're not an admin!" })
        }
    } catch (e) {
        res.status(500).send({ message: "Internal Server Error!" });
    }
}

/*************************** STATS ON QUESTIONS BASED ON STUDENTS SPECIALITIES ***************************/
export async function getQuestionPercentageBySpeciality(req, res) {
    try {
        const role = req.user["role"];
        if (role == "ADMIN") {
            const specialities = await User.distinct("speciality", { role: "STUDENT" });
            const counts = await User.aggregate([
                {
                    $match: {
                        role: "STUDENT",
                        speciality: { $in: specialities },
                    },
                },
                {
                    $lookup: {
                        from: "questions",
                        localField: "questions",
                        foreignField: "_id",
                        as: "questions",
                    },
                },
                {
                    $project: {
                        speciality: 1,
                        questionCount: { $size: "$questions" },
                    },
                },
                {
                    $group: {
                        _id: "$speciality",
                        count: { $sum: "$questionCount" },
                    },
                },
            ]);

            const total = counts.reduce((acc, { count }) => acc + count, 0);
            const result = counts.reduce((acc, { _id, count }) => {
                return { ...acc, [_id]: count };
            }, {});
            res.status(200).json({ result });
        } else {
            res.status(401).send({ message: "Oops, looks like you're not an admin!" })
        }
    } catch (e) {
        res.status(500).send({ message: "Internal Server Error!" });
    }
}
