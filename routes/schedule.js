import express from 'express';
import { uploadSchedule } from '../controllers/schedule.js';
import { authenticateUser } from '../middlewares/authorization.js';
import multerSchedule from '../middlewares/multer-schedule.js';
import multerSchedules from '../middlewares/multer-schedules.js';

const router = express.Router();

router
    .route('/uploadSchedule')
    .post(authenticateUser, multerSchedules("scheduleFile", "../public/schedules"), uploadSchedule)

router.route("/save")
    .post(authenticateUser,multerSchedule("schedule","../public/schedules"), uploadSchedule)

/*router.route("/get")
    .get(authenticateUser, getSchedule)*/

export default router;