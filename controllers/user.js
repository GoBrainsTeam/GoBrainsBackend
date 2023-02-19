import User from "../models/user.js";
import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import path from "path";

/*************************** SIGN UP USER ***************************/
export async function signup(req, res) {
    try {
        var email = req.body.email
        var exist = await User.findOne({ email: email })
        if (exist) {
            return res.status(403).send({
                message: "User already exists!"
            })
        } else if (!exist) {
            var pwd = await bcrypt.hash(req.body.pwd, 10)
            /*var pwd = ""
            var isVerified = true
            if (req.body.pwd != "") {
                pwd = await bcrypt.hash(req.body.pwd, 10)
              isVerified = false
            }*/
            const user = new User({
                fullname: req.body.fullname,
                email: email,
                pwd: pwd,
                pic: "",
                isAdmin: req.body.isAdmin //optional in req body (default=false)
            });

            user.save().then(async u => {
                /*if (pwd == "") {
                  const token = generateUserToken(user)
                  res.status(200).send({ token,id: user.id, message: "User logged in!" })
                } else {*/
                // token creation for email verif
                const token = generateUserToken(user)
                await doSendConfirmationEmail(email, token, req.protocol)
                res.status(201).send({
                    message: "User account created!",
                })
                //}
            })
        } else {
            res.status(400).send({
                message: "Failed to create account!",
            })
        }
    } catch (e) {
        res.status(500).send({ message: "Internal Server Error!" })
    }
}

/*************************** SEND CONFIRMATION EMAIL ***************************/
export async function sendConfirmationEmail(req, res) {
    try {
        const user = await User.findOne({ email: req.body.email })
        if (user) {
            token = generateUserToken(user)
            doSendConfirmationEmail(req.body.email, token, req.protocol)
            res.status(200).send({ message: "Account verification email sent!" })
        } else if (!user) {
            res.status(404).send({ message: "User not found!" })
        } else {
            res.status(400).send({ message: "Failed to send verification email!" })
        }
    } catch (e) {
        res.status(500).send({ message: "Internal Server Error!" })
    }
}

/*************************** RENDER CONFIRMATION EMAIL VIEWS ***************************/
export async function verifyEmail(req, res) {
    if (req.params.token) {
        try {
            jwt.verify(req.params.token, 'secret', (err, token) => {
                if (err) return res.status(400)
                else {
                    User.findById(token["id"], function (err, user) {
                        if (!user) {
                            return res.render("main", {
                                title: "Account verification",
                                message: "Account not found, please create an account first!",
                                link: ""
                            })
                        } else if (user.isVerified) {
                            return res.render("main", {
                                title: "Account verification",
                                message: "This account has already been verified!",
                                link: ""
                            })
                        } else {
                            user.isVerified = true
                            user.save(function (err) {
                                if (err) {
                                    return res.render("main", {
                                        title: "Account verification",
                                        message: err.message,
                                        link: ""
                                    })
                                } else {
                                    return res.render("main", {
                                        title: "Account verification",
                                        message: "Your account has been verified!",
                                        link: ""
                                    })
                                }
                            })
                        }
                    })
                }
            })
        } catch (e) {
            console.log(e);
        }
    } else {
        return res.render("main", {
            title: "Account verification",
            message: "Could not verify account!",
            link: ""
        })
    }
}

/*************************** CHECK IF USER EXISTS ***************************/
export async function userExists(req, res) {
    try {
        var email = req.body.email
        var exist = await User.findOne({ email: email })
        if (!exist) {
            return res.status(200).send({ message: "User does not exist!" })
        } else {
            return res.status(200).send({ message: "User exists!" })
        }
    } catch (e) {
        res.status(500).send({ message: "Internal Server Error!" })
    }
}

/*************************** SIGN IN USER ***************************/
export async function signin(req, res) {
    try {
        const { email, pwd } = req.body
        const user = await User.findOne({ email })
        if (user) {
            const verifyPwd = await user.verifyPwd(pwd);
            if (verifyPwd) {
                const token = generateUserToken(user)
                if (!user.isVerified) {
                    await doSendConfirmationEmail(email, token, req.protocol)
                    res.status(403).send({ user, message: "Please verify your account!" })
                } else {
                    res.status(200).send({ token, message: "User logged in!" })
                }
            } else {
                res.status(403).send({ message: "Password is incorrect!" })
            }
        } else if (!user) {
            res.status(403).send({ message: "No account with this email was found!" })
        } else {
            res.status(400).send({ message: "Failed to login!" })
        }
    } catch (e) {
        res.status(500).send({ message: "Internal Server Error!" })
    }
}

/*************************** SEND OTP TO ENTERED EMAIL ***************************/
export async function forgotPassword(req, res) {
    try {
        const resetCode = Math.floor(1000 + Math.random() * 9000)
        const user = await User.findOne({ email: req.body.email })
        if (user) {
            await User.findOneAndUpdate({ email: req.body.email, otp: resetCode })
            await sendOTP(req.body.email, resetCode, req.protocol)
            res.status(200).send({ message: "Reset code was sent!" })
        } else if (!user) {
            res.status(404).send({ message: "User not found!" })
        } else {
            res.status(400).send({ message: "Failed to send code!" })
        }
    } catch (e) {
        res.status(500).send({ message: "Internal Server Error!" })
    }
}

function generateUserToken(user) {
    return jwt.sign({ "id": user._id, "email": user.email, "isAdmin": user.isAdmin }, 'secret', {
        expiresIn: "30d",
    })
}

/*************************** CHECK IF ENTERED OTP IS CORRECT ***************************/
export async function verifyOTP(req, res) {
    try {
        const user = await User.findOne({ email: req.body.email })
        const otp = req.body.otp;
        if (user) {
            if (otp == user.otp) {
                return res.status(200).send({ message: "OTP verified!" });
            } else {
                return res.status(422).send({ message: "OTP is incorrect!" });
            }
        } else if (!user) {
            res.status(404).send({ message: "User not found!" })
        } else {
            res.status(400).send({ message: "Failed to verify OTP!" })
        }
    } catch (e) {
        res.status(500).send({ message: "Internal Server Error!" })
    }
}

/*************************** RESET USER PWD ***************************/
export async function resetPwd(req, res) {
    try {
        const user = await User.findOne({ email: req.body.email })
        const new_pwd = req.body.new_pwd;
        if (user) {
            user.pwd = await bcrypt.hash(new_pwd, 10);
            await user.save();
            return res.status(200).send({ message: "Password reset!" });

        } else if (!user) {
            res.status(404).send({ message: "User not found!" })
        } else {
            res.status(400).send({ message: "Failed to reset password!" })
        }
    } catch (e) {
        res.status(500).send({ message: "Internal Server Error!" })
    }
}

/*************************** GET ALL USERS ***************************/
export async function getAll(req, res) {
    try {
        const isAdmin = req.user["isAdmin"]
        if (isAdmin) {
            let users = await User.find({}, { fullname: 1, email: 1, pic: 1, isVerified: 1, isAdmin: 1, isBlocked: 1 })
            if (users.length != 0) {
                res.status(200).send({ users: users })
            } else if (users.length == 0) {
                res.status(404).send({ message: "No users found!" })
            } else {
                res.status(400).send({ message: "Failed to get users!" })
            }
        } else {
            res.status(401).send({ message: "Oops, looks like you're not an admin!" })
        }
    } catch (e) {
        res.status(500).send({ message: "Internal Server Error!" })
    }
}

/*************************** GET ADMINS ***************************/
export async function getAdmins(req, res) {
    try {
        const isAdmin = req.user["isAdmin"]
        if (isAdmin) {
            let users = await User.find({ "isAdmin": true }, { fullname: 1, email: 1, pic: 1, isVerified: 1, isAdmin: 1, isBlocked: 1 })
            if (users.length != 0) {
                res.status(200).send({ users: users })
            } else if (users.length == 0) {
                res.status(404).send({ message: "No admins found!" })
            } else {
                res.status(400).send({ message: "Failed to get admins!" })
            }
        } else {
            res.status(401).send({ message: "Oops, looks like you're not an admin!" })
        }
    } catch (e) {
        res.status(500).send({ message: "Internal Server Error!" })
    }
}

/*************************** GET NON ADMINS ***************************/
export async function getNonAdmins(req, res) {
    try {
        const isAdmin = req.user["isAdmin"]
        if (isAdmin) {
            let users = await User.find({ "isAdmin": false }, { fullname: 1, email: 1, pic: 1, isVerified: 1, isAdmin: 1, isBlocked: 1 })
            if (users.length != 0) {
                res.status(200).send({ users: users })
            } else if (users.length == 0) {
                res.status(404).send({ message: "No users found!" })
            } else {
                res.status(400).send({ message: "Failed to get users!" })
            }
        } else {
            res.status(401).send({ message: "Oops, looks like you're not an admin!" })
        }
    } catch (e) {
        res.status(500).send({ message: "Internal Server Error!" })
    }
}

/*************************** GET CURRENT USER PROFILE ***************************/
export async function getProfile(req, res) {
    try {
        const id = req.user["id"]
        const u = await User.findById(id)
        if (u) {
            const { fullname, email, pic, isVerified, isAdmin, isBlocked } = u;
            res.status(200).send({ user: { fullname, email, pic, isVerified, isAdmin, isBlocked } })
        } else if (!u) {
            res.status(404).send({ message: "User not found!" })
        } else {
            res.status(400).send({ message: "Failed to get profile!" })
        }
    } catch (e) {
        res.status(500).send({ message: "Internal Server Error!" })
    }
}

/*************************** UPDATE CURRENT USER NAME ***************************/
/*export async function updateProfile(req, res) {
    const email = req.user["email"]
    const { fullname } = req.body
    User.findOneAndUpdate(
        { email: email },
        {
            $set: {
                fullname
            },
        }
    ).then(val =>
        res.status(200).send({ message: "Profile updated successfully!" }))
        .catch(err => {
            res.status(500).send({ message: "Failed to update profile!" })
        })
}*/

/*************************** GET CURRENT USER PROFILE PIC ***************************/
export function updateprofilepicture(req, res) {
    const id = req.user["id"]
    var profilePic = "";
    if (req.file) {
        profilePic = `${req.file.filename}`
    }
    User
        .findByIdAndUpdate({ "_id": id }, {
            "pic": profilePic
        })
        .then(val =>
            res.status(200).json(val))
        .catch(err => {
            res.status(500).send({ message: "Failed to update profile picture!" })
        })
}

/*************************** UPDATE CURRENT USER PROFILE ***************************/
export async function updateProfile(req, res) {
    try {
        const { old_pwd, new_pwd } = req.body
        const email = req.user["email"]
        const user = await User.findOne({ email })
        var fullname
        if(req.body.fullname){
            fullname=req.body.fullname
        }else{
            fullname=user.fullname
        }
      
        if (old_pwd && new_pwd) {
            const isCorrectPassword = await user.isCorrectPassword(old_pwd);
            if (user && isCorrectPassword) {
                await User.findOneAndUpdate(
                    { email: email },
                    {
                        $set: {
                            fullname: fullname,
                            pwd: await bcrypt.hash(new_pwd, 10)
                        },
                    }
                )
                return res.status(200).send({ message: "Profile updated!" })
            } else {
                return res.status(401).send({ message: "Incorrect credentials!" })
            }
        } else if (!(old_pwd && new_pwd)) {
            await User.findOneAndUpdate(
                { email: email },
                {
                    $set: {
                        fullname
                    },
                }
            )
            return res.status(200).send({ message: "Profile updated!" })
        } else {
            res.status(400).send({ message: "Failed to update profile!" })
        }
    } catch (e) {
        res.status(500).send({ message: "Internal Server Error!" })
    }
}

/*************************** DELETE CURRENT USER ACCOUNT ***************************/
export async function deleteMyAccount(req, res) {
    try {
        const id = req.user["id"]
        let user = await User.findById(id)
        if (user) {
            await user.remove()
            return res.status(204).send({ message: "Account deleted!" })
        } else if (!user) {
            return res.status(404).send({ message: "Account does not exist!" })
        } else {
            res.status(400).send({ message: "Failed to delete account!" })
        }
    } catch (e) {
        res.status(500).send({ message: "Internal Server Error!" })
    }
}

/*************************** DELETE A USER ACCOUNT ***************************/
export async function deleteUserAccount(req, res) {
    try {
        const isAdmin = req.user["isAdmin"]
        if (isAdmin) {
            const user = await User.findOne({ email: req.body.email })
            if (user) {
                await user.remove()
                return res.status(204).send({ message: "Account deleted!" })
            } else if (!user) {
                return res.status(404).send({ message: "Account does not exist!" })
            } else {
                res.status(400).send({ message: "Failed to delete account!" })
            }
        } else {
            res.status(401).send({ message: "Oops, looks like you're not an admin!" })
        }
    } catch (e) {
        res.status(500).send({ message: "Internal Server Error!" })
    }
}

/*************************** BLOCK USER ACCOUNT ***************************/
export async function blockUser(req, res) {
    try {
        const isAdmin = req.user["isAdmin"]
        if (isAdmin) {
            const user = await User.findOne({ email: req.body.email })
            if (user) {
                user.isBlocked = true
                user.save().then(u => {
                    res.status(200).send({ message: "User blocked!" })
                })
            } else {
                res.status(404).send({ message: "User not found!" })
            }
        } else {
            res.status(401).send({ message: "Oops, looks like you're not an admin!" })
        }
    }
    catch (e) {
        res.status(500).send({ message: "Internal Server Error!" })
    }
}

/*************************** UNBLOCK USER ACCOUNT ***************************/
export async function unblockUser(req, res) {
    try {
        const isAdmin = req.user["isAdmin"]
        if (isAdmin) {
            const user = await User.findOne({ email: req.body.email })
            if (user) {
                user.isBlocked = false
                user.save().then(u => {
                    res.status(200).send({ message: "User unblocked!" })
                })
            } else {
                res.status(404).send({ message: "User not found!" })
            }
        } else {
            res.status(401).send({ message: "Oops, looks like you're not an admin!" })
        }
    }
    catch (e) {
        res.status(500).send({ message: "Internal Server Error!" })
    }
}

/*************************** CONFIRMATION EMAIL CONTENT ***************************/
async function doSendConfirmationEmail(email, token, protocol) {
    let port = process.env.PORT || 9090
    sendEmail({
        from: process.env.EMAIL,
        to: email,
        subject: "ESPRIT GPT Account Verification",
        template: 'main',
        context: {
            title: "ESPRIT GPT Account Verification",
            message: "Please confirm your email using the link below",
            message2: "",
            link: protocol + "://localhost:" + port + "/user/verify/" + token
        },
    })
}

/*************************** OTP EMAIL CONTENT ***************************/
async function sendOTP(email, codeDeReinit, protocol) {
    sendEmail({
        from: process.env.EMAIL,
        to: email,
        subject: "ESPRIT GPT Verification Code",
        template: 'main',
        context: {
            title: codeDeReinit,
            message: "Please copy the code above in ESPRIT GPT app",
            message2: "",
            link: ""
        },
    })
}

/*************************** TRIGGER EMAIL SENDING ***************************/
function sendEmail(mailOptions) {
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS,
        },
        tls: { rejectUnauthorized: false }
    })

    transporter.use('compile', hbs({
        viewEngine: {
            partialsDir: path.resolve('./views/'),
            defaultLayout: false,
        },
        viewPath: path.resolve('./views/'),
    }));

    transporter.verify(function (error, success) {
        if (error) {
            console.log(error)
            console.log("Server not ready")
        } else {
            console.log("Server is ready to take our messages")
        }
    })

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error)
        } else {
            console.log("Email sent: " + info.response)
        }
    })
}