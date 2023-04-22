import express from 'express';
import { saveSchedule, getSchedule } from '../controllers/schedule.js';
import { authenticateUser } from '../middlewares/authorization.js';
import multer from '../middlewares/multer-config-pdf.js';

const router = express.Router();

router.route("/save")
    .post(authenticateUser,multer("schedule"), saveSchedule)

router.route("/get")
    .get(authenticateUser, getSchedule)

export default router;