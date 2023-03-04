import express from 'express';
import { randomAnswer, saveThread } from '../controllers/thread.js';
import { authenticateUser } from '../middlewares/authorization.js';

const router = express.Router();

router.route("/save")
    .post(authenticateUser, saveThread)

router.route("/randomanswer")
    .get(randomAnswer)

export default router;