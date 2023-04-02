import express from 'express';
import { deleteThread, getAll, getOne } from '../controllers/thread.js';
import { authenticateUser } from '../middlewares/authorization.js';

const router = express.Router();

router.route("/getall")
    .get(authenticateUser, getAll)

router.route("/getone")
    .post(authenticateUser, getOne)
    
router.route("/delete")
.get(authenticateUser, deleteThread)

export default router;