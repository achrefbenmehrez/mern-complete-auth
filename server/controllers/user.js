const User = require('../models/User');
const expressJwt = require('express-jwt');
const _ = require('lodash');
const {
    OAuth2Client
} = require('google-auth-library');
const fetch = require('node-fetch');
const {
    validationResult
} = require('express-validator');
const jwt = require('jsonwebtoken');
const {
    errorHandler
} = require('../helpers/dbErrorHandling');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.MAIL_KEY);

exports.registerController = (req, res, next) => {
    const {
        name,
        email,
        password
    } = req.body
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        const firstError = errors.array().map(error => error.msg)[0]
        return res.status(422).json({
            error: firstError
        })
    } else {
        User.findOne({
                email
            })
            .then(user => {
                if (user) {
                    return res.status(400).json({
                        error: "Email is taken"
                    })
                } else {
                    const token = jwt.sign({
                        name,
                        email,
                        password
                    }, process.env.JWT_SECRET, {
                        expiresIn: '15m'
                    })

                    const emailData = {
                        from: process.env.EMAIL_FROM,
                        to: email,
                        subject: 'Account activation link',
                        html: `<h1>Please click this link to activate your account</h1>
                        <p>${process.env.CLIENT_URL}/users/activate/${token}</p>
                        </hr>
                        <p>This email contains sensitive information</p>
                        <p>${process.env.CLIENT_URL}</p>
                        `
                    }
                    sgMail.send(emailData).then(sent => {
                        return res.json({
                            message: "Email has been sent to " + email
                        })
                    })
                }
            })
            .catch(error => {
                res.status(500).json({
                    message: error
                })
            })
    }
}

exports.activationController = (req, res) => {
    const {
        token
    } = req.body;

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                console.log('Activation error');
                return res.status(401).json({
                    errors: 'Link is expired please Signup again'
                });
            } else {
                const {
                    name,
                    email,
                    password
                } = jwt.decode(token);

                const user = new User({
                    name,
                    email,
                    password
                });
                console.log(password);

                user.save((err, user) => {
                    if (err) {
                        return res.status(401).json({
                            errors: err
                        });
                    } else {
                        return res.json({
                            success: true,
                            message: user,
                            message: 'Signup successful'
                        });
                    }
                });
            }
        });
    } else {
        return res.json({
            message: 'Server error please try again'
        });
    }
}

exports.loginController = (req, res) => {
    const {
        email,
        password
    } = req.body;
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        const firstError = errors.array().map(error => error.msg)[0]
        return res.status(422).json({
            error: firstError
        })
    } else {
        User.findOne({
                email
            })
            .then(user => {
                if (!user) {
                    return res.status(400).json({
                        error: 'Wrong credentials'
                    })
                } else {
                    if (!user.authenticate(password)) {
                        return res.status(400).json({
                            error: 'Wrong credentials'
                        })
                    } else {
                        const token = jwt.sign({
                            _id: user._id
                        }, process.env.JWT_SECRET, {
                            expiresIn: '7d'
                        })

                        const {
                            _id,
                            name,
                            email,
                            role
                        } = user
                        return res.json({
                            msg: "You are successfully logged in",
                            token,
                            user: {
                                _id,
                                name,
                                email,
                                role
                            }
                        })
                    }
                }
            })
            .catch(err => {
                res.status(500).json({
                    err
                })
            })
    }
}

exports.forgotController = (req, res) => {
    const {
        email
    } = req.body;
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        const firstError = errors.array().map(error => error.msg)[0]
        return res.status(422).json({
            error: firstError
        })
    } else {
        User.findOne({
            email
        }, (err, user) => {
            if (err || !user) {
                return res.status(400).json({
                    error: "User with this email does not exist"
                })
            } else {
                const token = jwt.sign({
                    _id: user.id
                }, process.env.JWT_SECRET, {
                    expiresIn: '10m'
                })

                const emailData = {
                    from: process.env.EMAIL_FROM,
                    to: email,
                    subject: 'Password reset link',
                    html: `<h1>Please click this link to reset your password</h1>
                    <p>${process.env.CLIENT_URL}/users/reset-password/${token}</p>
                    </hr>
                    <p>This email contains sensitive information</p>
                    <p>${process.env.CLIENT_URL}</p>
                    `
                }

                user.updateOne({
                    resetPasswordLink: token
                }, (err, user) => {
                    if (err) {
                        return res.status(400).json({
                            err
                        })
                    } else {
                        sgMail.send(emailData).then(sent => {
                                return res.json({
                                    message: "Password reset link has been sent to " + email
                                })
                            })
                            .catch(err => {
                                return res.json({
                                    message: err.message
                                })
                            })
                    }
                })
            }
        })
    }
}

exports.resetController = (req, res) => {
    const {
        newPassword,
        resetPasswordLink
    } = req.body;

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        const firstError = errors.array().map(error => error.msg)[0]
        return res.status(422).json({
            error: firstError
        })
    } else {
        if (resetPasswordLink) {
            jwt.verify(resetPasswordLink, process.env.JWT_SECRET, (err, user) => {
                if (err) {
                    return res.status(400).json({
                        error: 'Token is expired, please try again'
                    })
                } else {
                    User.findOne({
                        resetPasswordLink
                    }, (err, user) => {
                        if (err || !user) {
                            return res.status(400).json({
                                error: 'Something went wrong, please try again'
                            })
                        } else {
                            const updatedFields = {
                                password: newPassword,
                                resetPasswordLink: ""
                            }

                            user = _.extend(user, updatedFields)

                            user.save((err, result) => {
                                if (err) {
                                    return res.status(400).json({
                                        error: 'Something went wrong, please try again'
                                    })
                                } else {
                                    res.json({
                                        message: 'Great, Now you can Login with your new password'
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    }
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT)
exports.googleController = (req, res) => {
    const {
        idToken
    } = req.body

    client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT
        })
        .then(response => {
            const {
                email,
                verified,
                name
            } = response.payload

            User.findOne({
                email
            }, (err, user) => {
                if (user) {
                    const token = jwt.sign({
                            _id: user._id
                        },
                        process.env.JWT_SECRET, {
                            expiresIn: "7d"
                        })
                    const {
                        _id,
                        email,
                        name,
                        role
                    } = user;
                    return res.json({
                        token,
                        user: {
                            _id,
                            email,
                            name,
                            role
                        }
                    })
                } else {
                    let password = email + process.env.JWT_SECRET
                    user = new User({
                        name,
                        email,
                        password
                    })
                    user.save((err, data) => {
                        if (err) {
                            return res.status(500).json({
                                err
                            })
                        }
                        const token = jwt.sign({
                            _id: data._id,
                        }, process.env.JWT_SECRET, {
                            expiresIn: "7d"
                        })
                        const {
                            _id,
                            email,
                            name,
                            role
                        } = data
                        return res.json({
                            token,
                            user: {
                                _id,
                                email,
                                name,
                                role
                            }
                        })
                    })
                }
            })
        })
}

exports.facebookController = (req, res) => {
    const {
        userId,
        accessToken
    } = req.body
    const url = `https://graph.facebook.com/v2.11/${userId}?fields=id,name,email&access_token=${accessToken}`

    fetch(url, {
            method: 'GET',
        }).then(response => response.json())
        .then(response => {
            const {
                email,
                name
            } = response
            User.findOne({
                email
            }, (err, user) => {
                if (user) {
                    const token = jwt.sign({
                        _id: user._id,
                    }, process.env.JWT_SECRET, {
                        expiresIn: "7d"
                    })
                    const {
                        _id,
                        email,
                        name,
                        role
                    } = user
                    return res.json({
                        token,
                        user: {
                            _id,
                            email,
                            name,
                            role
                        }
                    })
                } else {
                    let password = email + process.env.JWT_SECRET
                    user = new User({
                        name,
                        email,
                        password
                    })
                    user.save((err, user) => {
                        if (err) {
                            return res.status(400).json({
                                error: "Facebook login failed"
                            })
                        } else {
                            const token = jwt.sign({
                                _id: data._id,
                            }, process.env.JWT_SECRET, {
                                expiresIn: "7d"
                            })
                            const {
                                _id,
                                email,
                                name,
                                role
                            } = data
                            return res.json({
                                token,
                                user: {
                                    _id,
                                    email,
                                    name,
                                    role
                                }
                            })
                        }
                    })
                }
            })
        })
        .catch(error => {
            res.json({
                error: "Facebook login failed, please try again"
            })
        })
}

exports.readController = (req, res) => {
    const userId = req.params.id;
    User.findById(userId).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User not found'
            });
        }
        user.hashed_password = undefined;
        user.salt = undefined;
        res.json(user);
    });
};

exports.updateController = (req, res) => {
    const {
        name,
        password
    } = req.body;

    User.findOne({
        _id: req.user._id
    }, (err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User not found'
            });
        }
        if (!name) {
            return res.status(400).json({
                error: 'Name is required'
            });
        } else {
            user.name = name;
        }

        if (password) {
            if (password.length < 6) {
                return res.status(400).json({
                    error: 'Password should be min 6 characters long'
                });
            } else {
                user.password = password;
            }
        }

        user.save((err, updatedUser) => {
            if (err) {
                console.log('USER UPDATE ERROR', err);
                return res.status(400).json({
                    error: 'User update failed'
                });
            }
            updatedUser.hashed_password = undefined;
            updatedUser.salt = undefined;
            res.json(updatedUser);
        });
    });
};

exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET, // req.user._id
    algorithms: ['RS256']
});

exports.adminMiddleware = (req, res, next) => {
    User.findById({
        _id: req.user._id
    }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User not found'
            });
        }

        if (user.role !== 'admin') {
            return res.status(400).json({
                error: 'Admin resource. Access denied.'
            });
        }

        req.profile = user;
        next();
    });
};