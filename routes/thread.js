import express from 'express';
import { predictTag, randomAnswer } from '../controllers/thread.js';
import { authenticateUser } from '../middlewares/authorization.js';

const router = express.Router();

router.route("/randomanswer")
    .get(randomAnswer)

router.route("/predictag")
    .post(authenticateUser, predictTag)

export default router;