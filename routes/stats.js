import express from 'express';
import { countAsked, countUsers, getRolePercentage, getTagStats, getQuestionPercentageByRoles, getQuestionPercentageBySpeciality, getQuestionPercentageByStudentLevel } from '../controllers/stats.js';
import { authenticateUser } from '../middlewares/authorization.js';

const router = express.Router();

router.route("/user/count")
    .get(authenticateUser, countUsers)

router.route("/user/role")
    .get(authenticateUser, getRolePercentage)

router.route("/question/tags")
    .get(authenticateUser, getTagStats)

router.route("/question/count")
    .get(authenticateUser, countAsked)

router.route("/question/role")
    .get(authenticateUser, getQuestionPercentageByRoles)

router.route("/question/level")
    .get(authenticateUser, getQuestionPercentageByStudentLevel)

router.route("/question/speciality")
    .get(authenticateUser, getQuestionPercentageBySpeciality)

export default router;