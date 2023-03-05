import Thread from "../models/thread.js";
import User from "../models/user.js";

/*************************** USERS COUNT (ALL USERS IN DB EXCEPT ADMINS/NOT RELATED TO THREADS) ***************************/
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

/*************************** ROLES PERCENTAGES (ALL USERS IN DB EXCEPT ADMINS/NOT RELATED TO THREADS) ***************************/
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
                const percentage = (countObj.count / total) * 100;
                return { ...acc, [role]: percentage };
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
            const totalAsked = await Thread.countDocuments({ user: { $exists: true } });
            res.status(200).json({ result: totalAsked })
        } else {
            res.status(401).send({ message: "Oops, looks like you're not an admin!" })
        }
    } catch (e) {
        res.status(500).send({ message: "Internal Server Error!" })
    }
}

/*************************** STATS ON THREADS BY TAGS ***************************/
export async function getTagStats(req, res) {
    try {
        const role = req.user["role"]
        if (role == 'ADMIN') {
            const totalQuestions = await Thread.countDocuments();
            const tagstats = await Thread.aggregate([
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

/*************************** STATS ON THREADS BY ROLE ***************************/
export async function getThreadPercentageByRoles(req, res) {
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
                        from: "threads",
                        localField: "threads",
                        foreignField: "_id",
                        as: "threads",
                    },
                },
                {
                    $project: {
                        role: 1,
                        threadCount: { $size: "$threads" },
                    },
                },
                {
                    $group: {
                        _id: "$role",
                        count: { $sum: "$threadCount" },
                    },
                },
            ]);

            const total = counts.reduce((acc, { count }) => acc + count, 0);

            counts.forEach(({ _id, count }) => {
                const percentage = (count / total) * 100;
                roleCounts[_id] = percentage;
            });

            const result = Object.keys(roleCounts).reduce((acc, role) => {
                const percentage = roleCounts[role];
                return { ...acc, [role]: percentage };
            }, {});

            return res.status(200).json({ result });
        } else {
            res.status(401).send({ message: "Oops, looks like you're not an admin!" })
        }
    } catch (e) {
        res.status(500).send({ message: "Internal Server Error!" });
    }
}

/*************************** STATS ON THREADS BASED ON STUDENTS LEVELS ***************************/
export async function getThreadPercentageByStudentLevel(req, res) {
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
                        from: "threads",
                        localField: "threads",
                        foreignField: "_id",
                        as: "threads",
                    },
                },
                {
                    $project: {
                        level: 1,
                        threadCount: { $size: "$threads" },
                    },
                },
                {
                    $group: {
                        _id: "$level",
                        count: { $sum: "$threadCount" },
                    },
                },
            ]);

            const total = counts.reduce((acc, { count }) => acc + count, 0);

            counts.forEach(({ _id, count }) => {
                const percentage = (count / total) * 100;
                levelCounts[_id] = percentage;
            });

            const result = Object.keys(levelCounts).reduce((acc, level) => {
                const percentage = levelCounts[level];
                return { ...acc, [level]: percentage };
            }, {});

            return res.status(200).json({ result });
        } else {
            res.status(401).send({ message: "Oops, looks like you're not an admin!" })
        }
    } catch (e) {
        res.status(500).send({ message: "Internal Server Error!" });
    }
}

/*************************** STATS ON THREADS BASED ON STUDENTS SPECIALITIES ***************************/
export async function getThreadPercentageBySpeciality(req, res) {
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
                        from: "threads",
                        localField: "threads",
                        foreignField: "_id",
                        as: "threads",
                    },
                },
                {
                    $project: {
                        speciality: 1,
                        threadCount: { $size: "$threads" },
                    },
                },
                {
                    $group: {
                        _id: "$speciality",
                        count: { $sum: "$threadCount" },
                    },
                },
            ]);

            const total = counts.reduce((acc, { count }) => acc + count, 0);
            const result = counts.reduce((acc, { _id, count }) => {
                const percentage = (count / total) * 100;
                return { ...acc, [_id]: percentage };
            }, {});
            res.status(200).json({ result });
        } else {
            res.status(401).send({ message: "Oops, looks like you're not an admin!" })
        }
    } catch (e) {
        res.status(500).send({ message: "Internal Server Error!" });
    }
}
