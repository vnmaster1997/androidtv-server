var uploadService = require('../services/uploadService');
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/mongoose.json");
const auth = require('../middleware/auth');
const User = require("../models/user");
const utils = require('../utils/util');
const path = require('path');
const refreshTokenList = [];

module.exports = {
    authLogin: async(req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const { username, password } = req.body;
        try {
            let user = await User.findOne({
                username
            });
            if (!user)
                return res.status(400).json({
                    message: "User Not Exist",
                    login: false,
                });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch)
                return res.status(400).json({
                    message: "Incorrect Password !",
                    login: false
                });

            const payload = {
                user: {
                    id: user.id
                }
            };

            // login success, create token for user
            const token = jwt.sign(
                payload,
                config.tokenSecret, {
                    expiresIn: config.tokenLife
                }
            );

            // create other token - refreshToken
            const refreshToken = jwt.sign(
                payload,
                config.refreshTokenSecret, {
                    expiresIn: config.refreshTokenLife
                }
            )

            // save refreshToken, attach user information 
            refreshTokenList[refreshToken] = user;
            const response = {
                id: user.id,
                username: user.username,
                password: user.password,
                email: user.email,
                avatar_url: user.avatar_url,
                createAt: user.createAt,
                login: true,
                token,
                refreshToken
            }
            res.json(response);
        } catch (e) {
            console.error(e);
            res.status(500).json({
                message: "Server Error"
            });
        }
    },

    getNewToken: async(req, res) => {
        // User attach refreshToken in body
        const { refreshToken } = req.body;
        // If refreshToken exists!
        if ((refreshToken) && (refreshToken in refreshTokenList)) {
            try {
                // check refreshToken
                await utils.verifyJwtToken(refreshToken, config.refreshTokenSecret);
                // get User information
                const user = refreshTokenList[refreshToken];

                const payload = {
                    user: {
                        id: user.id
                    }
                };
                // create new token and response it to user;
                const token = jwt.sign(
                    payload,
                    config.tokenSecret, {
                        expiresIn: config.tokenLife
                    }
                )

                const response = {
                    user,
                    token,
                    refreshToken
                }
                res.status(200).json(response);
            } catch (err) {
                console.error(err);
                res.status(403).json({
                    message: 'Invalid refresh token'
                })
            }
        }
    },

    signUp: async(req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
                register: false
            });
        }

        const {
            username,
            email,
            password
        } = req.body;
        try {
            let user = await User.findOne({
                username
            });
            if (user) {
                return res.status(400).json({
                    msg: "User Already Exists",
                    register: false
                });
            }

            user = new User({
                username,
                email,
                password
            });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            const payload = {
                user: {
                    id: user.id
                }
            };
            await user.save();
            // create other token - refreshToken
            const refreshToken = jwt.sign(
                payload,
                config.refreshTokenSecret, {
                    expiresIn: config.refreshTokenLife
                }
            )

            // save refreshToken, attach user information 
            refreshTokenList[refreshToken] = user;

            const token = jwt.sign(
                payload,
                "signUpSecret", {
                    expiresIn: config.tokenLife
                }
            );
            const response = {
                id: user.id,
                username: user.username,
                password: user.password,
                email: user.email,
                avatar_url: user.avatar_url,
                createAt: user.createAt,
                register: true,
                token,
                refreshToken
            }
            res.json(response);
        } catch (err) {
            console.log(err.message);
            res.status(500).send("Error in Saving");
        }
    },

    getUserLogin: async(req, res) => {
        try {
            // request.user is getting fetched from Middleware after token authentication
            const user = await User.findById(req.user.id);
            res.json(user);
        } catch (e) {
            res.send({ message: "Error in fetching user!" })
        }
    },

    uploadAvatar: async(req, res) => {
        try {
            const user = await User.findById(req.user.id);
            let response = uploadService.uploadAvatar(req.file);
            if (response) {
                console.log(path.resolve(`./assets/${response.fileNameInServ}`))
                user.avatar_url = `http://${config.baseURL}/users/avatar/${response.fileNameInServ}`;
                response.avatar_url = user.avatar_url;
                await user.save();
            }
            res.json(response);
        } catch (e) {
            res.send({ message: "Error in upload avatar" });
        }
    },

    getAvatar: async(req, res) => {
        try {
            const fileName = req.params.name;
            console.log('fileName', fileName);
            if (!fileName) {
                return res.send({
                    status: false,
                    message: 'no filename specifiled'
                })
            }
            res.sendFile(path.resolve(`./assets/${fileName}`));
        } catch (e) {
            res.send({ message: "Error in get avatar" })
        }
    },

    changePassword: async(req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                changePassword: false,
                message: errors.array()
            })
        }
        try {
            let user = await User.findById(req.user.id);
            console.log(user)
            const { currentpassword, newpassword } = req.body;
            const isMatch = await bcrypt.compare(currentpassword, user.password);
            if (!isMatch)
                return res.status(400).json({
                    message: "Incorrect Password !",
                    changePassword: false
                });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newpassword, salt);
            await user.save();
            res.send({
                message: "Change password success!",
                resetPassword: true
            })
        } catch (e) {
            res.send({ message: "Error in change password" })
        }
    },

    logOut: async(req, res) => {}
}