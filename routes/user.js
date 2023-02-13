import express from 'express';
import { changePwd, forgotPassword, getAll, getProfile, resetPwd, sendConfirmationEmail, signin, signup, updateProfile, updateprofilepicture, userExists, verifyEmail, verifyOTP } from '../controllers/user.js';
import { authenticateUser } from '../middlewares/authorization.js';
import multer from '../middlewares/multer-config.js';

const router = express.Router();

router.route("/token")
    .get(authenticateUser, (req, res) => {
        res.status(200).send(req.user) // returns user's id and email
    })

router.route('/signup')
    .post(signup)

router.route("/sendvemail")
    .post(sendConfirmationEmail)

router.route('/verify/:token')
    .get(verifyEmail)

router.route('/signin')
    .post(signin)

router.route('/sendOTP')
    .post(forgotPassword)

router.route('/resetpwd')
    .put(resetPwd)

router.route('/verifyotp')
    .post(verifyOTP)

router.route('/userExists')
    .post(userExists)

router.route("/getall")
    .get(authenticateUser, getAll)

router.route('/profile')
    .get(authenticateUser, getProfile)

router
    .route('/updateprofile')
    .put(authenticateUser, updateProfile)
router
    .route('/updateprofilepic')
    .put(authenticateUser, multer("pic"), updateprofilepicture)

router.route('/changepwd')
    .put(authenticateUser, changePwd)

export default router;