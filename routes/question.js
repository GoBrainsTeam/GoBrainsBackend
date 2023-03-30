import express from 'express';
import { getBotpressResponse, getResponseSeq, predictTag, randomAnswer } from '../controllers/question.js';
import { authenticateUser } from '../middlewares/authorization.js';

const router = express.Router();

router.route("/randomanswer")
    .get(randomAnswer)

router.route("/predictag")
    .post(authenticateUser, predictTag)

router.route("/getseqrep")
    .post(authenticateUser,getResponseSeq)

router.route("/botpress")
    .post(authenticateUser,getBotpressResponse)

export default router;