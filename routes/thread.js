import express from 'express';
import { deleteThread, getAll, getById } from '../controllers/thread.js';
import { authenticateUser } from '../middlewares/authorization.js';

const router = express.Router();

router.route("/getall")
    .get(authenticateUser, getAll)

router.route("/getone/:threadId")
    .get(authenticateUser, getById)
    
router.route("/delete")
.get(authenticateUser, deleteThread)

export default router;