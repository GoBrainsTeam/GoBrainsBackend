import express from 'express';
import { uploadSchedule } from '../controllers/schedule.js';

import { authenticateUser } from '../middlewares/authorization.js';
import multer from '../middlewares/multer-config.js';


const router = express.Router();


router
    .route('/uploadSchedule')
    .post(authenticateUser, multer("scheduleFile", "../public/schedules"), uploadSchedule)
export default router;