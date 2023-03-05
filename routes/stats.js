import express from 'express';
import { countAsked, countUsers, getRolePercentage, getTagStats, getThreadPercentageByRoles, getThreadPercentageBySpeciality, getThreadPercentageByStudentLevel } from '../controllers/stats.js';
import { authenticateUser } from '../middlewares/authorization.js';

const router = express.Router();

router.route("/user/count")
    .get(authenticateUser, countUsers)

router.route("/user/role")
    .get(authenticateUser, getRolePercentage)

router.route("/thread/tags")
    .get(authenticateUser, getTagStats)

router.route("/thread/count")
    .get(authenticateUser, countAsked)

router.route("/thread/role")
    .get(authenticateUser, getThreadPercentageByRoles)

router.route("/thread/level")
    .get(authenticateUser, getThreadPercentageByStudentLevel)

router.route("/thread/speciality")
    .get(authenticateUser, getThreadPercentageBySpeciality)

export default router;