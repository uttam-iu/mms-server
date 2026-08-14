const { getHassPassword, isPasswordMatch, getResponseTemplate, serverFormattedDateAndTime } = require('../helpers/utilities');
var jwt = require('jsonwebtoken');
const { default: mongoose } = require('mongoose');
const { LoggableMemberModel, MemberModel } = require('../schemas/memberSchema');

exports.login = async (req, res) => {
    const { userName, password } = req?.body;
    if (!userName || !password) {
        return getResponseTemplate(res, 400, null, "userName and password are required.");
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
        return getResponseTemplate(res, 500, null, "Server configuration error: missing JWT_SECRET.");
    }

    try {
        const matchedUser = await MemberModel.findOne({
            $or: [
                { userName: userName },
                { phone: userName }
            ]
        }).lean();

        if (!matchedUser) {
            return getResponseTemplate(res, 400, null, 'UserName or Password Mismatch');
        }

        isPasswordMatch(password, matchedUser.password, (isMatch) => {
            if (!isMatch) {
                return getResponseTemplate(res, 400, null, 'UserName or Password Mismatch');
            }

            const { password: _password, ...userWithoutPassword } = matchedUser;
            const token = jwt.sign({ userId: matchedUser?.userId }, JWT_SECRET, { expiresIn: '1h' });
            return getResponseTemplate(res, 200, {
                user: userWithoutPassword,
                token,
            }, "Logged in successfully.");
        });
    } catch (err) {
        console.error('login error', err);
        return getResponseTemplate(res, 500, null, 'Server error');
    }
};

