var userService = require('../services/userService');
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require('../middleware/auth');
const User = require("../models/user");
module.exports = {
    authLogin: async (req, res) => {
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
                    message: "User Not Exist"
                });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch)
                return res.status(400).json({
                    message: "Incorrect Password !"
                });

            const payload = {
                user: {
                    id: user.id
                }
            };

            jwt.sign(
                payload,
                "loginSecret",
                {
                    expiresIn: '1d'
                },
                (err, token) => {
                    if (err) throw err;
                    res.status(200).json({
                        user,
                        token
                    });
                }
            );
        } catch (e) {
            console.error(e);
            res.status(500).json({
                message: "Server Error"
            });
        }
    },
    signUp: async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				errors: errors.array()
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
					msg: "User Already Exists"
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

			jwt.sign(
				payload,
				"signUpSecret", 
				{
					expiresIn: '1d'
				},
				(err, token) => {
					if (err) throw err;
					res.status(200).json({
						token
					});
				}
			);
			await user.save();
		} catch (err) {
			console.log(err.message);
			res.status(500).send("Error in Saving");
		}
    },

    getUserLogin: async (req, res) => {
        try {
             // request.user is getting fetched from Middleware after token authentication
            const user = await User.findById(req.user.id);
            res.json(user);
        } catch(e) {
            res.send({ message: "Error in fetching user!"})
        }
    },

    logOut: async (req, res) => {
    }
}
