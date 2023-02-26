import express from 'express';
import { blockUser, deleteMyAccount, deleteUserAccount, forgotPassword, getAdmins, getAll, getNonAdmins, getProfile, resetPwd, sendConfirmationEmail, signin, signinAdmin, signup, unblockUser, updateProfile, updateprofilepicture, userExists, verifyEmail, verifyOTP } from '../controllers/user.js';
import { authenticateUser } from '../middlewares/authorization.js';
import multer from '../middlewares/multer-config.js';

const router = express.Router();

router.route("/token")
    .get(authenticateUser, (req, res) => {
        res.status(200).send(req.user) // returns user's id, email and role (isAdmin=true or isAdmin=false)
    })

router.route('/signup')
    .post(signup)

router.route("/sendvemail")
    .post(sendConfirmationEmail)

router.route('/verify/:token')
    .get(verifyEmail)

router.route('/signin')
    .post(signin)

router.route('/signinadmin')
    .post(signinAdmin)

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

router.route("/getadmins")
    .get(authenticateUser, getAdmins)

router.route("/getnonadmins")
    .get(authenticateUser, getNonAdmins)

router.route('/profile')
    .get(authenticateUser, getProfile)

router
    .route('/updateprofile')
    .put(authenticateUser, updateProfile)
router
    .route('/updateprofilepic')
    .put(authenticateUser, multer("pic"), updateprofilepicture)

//router.route('/changepwd').put(authenticateUser, changePwd)

router.route('/deletemyacc')
    .delete(authenticateUser, deleteMyAccount)

router.route('/deleteuseracc')
    .delete(authenticateUser, deleteUserAccount)

router.route('/block')
    .put(authenticateUser, blockUser)

router.route('/unblock')
    .put(authenticateUser, unblockUser)

export default router;