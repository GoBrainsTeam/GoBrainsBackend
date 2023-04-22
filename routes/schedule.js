import express from 'express';
import { saveSchedule, getSchedule, uploadSchedule } from '../controllers/schedule.js';
import { authenticateUser } from '../middlewares/authorization.js';
import multer from '../middlewares/multer-config.js';
import multerSchedules from '../middlewares/multer-schedules.js';

const router = express.Router();

router
    .route('/uploadSchedule')
    .post(authenticateUser, multerSchedules("scheduleFile", "../public/schedules"), uploadSchedule)

router.route("/save")
    .post(authenticateUser,multer("schedule","../public/schedules"), saveSchedule)

router.route("/get")
    .get(authenticateUser, getSchedule)

export default router;