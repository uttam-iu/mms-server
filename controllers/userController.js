
const { v4: uuid } = require('uuid');
const { getHassPassword, isPasswordMatch, getResponseTemplate, serverFormattedDateAndTime } = require('../helpers/utilities');
const members = require('../dummyData/users.json');
var jwt = require('jsonwebtoken');
const { default: mongoose } = require('mongoose');
const { LoggableMemberModel, MemberModel } = require('../schemas/memberSchema');

// exports.register = async (req, res) => {
//     const { displayName, gender, email, password } = req.body;
//     const emailRegex = /@gmail.com|@yahoo.com|@hotmail.com|@live.com/;

//     if (!emailRegex.test(email))
//         getResponseTemplate(res, 400, null, "Email is not supported from your domain.")
//     if (password.length < 6)
//         getResponseTemplate(res, 400, null, "Password must be atleast 6 characters long.")

//     const fetchQuery = `select email from ${USER_TABLE} where email='${email}';`;
//     dbCon.query(fetchQuery, (err, rows, fields) => {
//         if (err)
//             getResponseTemplate(res, 400, null, "Something went wrong.");

//         if (rows?.length === 0) {
//             getHassPassword(password, (hPass) => {
//                 const userId = uuid();
//                 const regiQuery = `insert into ${USER_TABLE} (userId, email, displayName, password, gender, lastActiveTime) values('${userId}', '${email}', '${displayName}', '${hPass}', '${gender}', '${serverFormattedDateAndTime(new Date)}');`
//                 dbCon.query(regiQuery, (err1, rows1, fields) => {
//                     console.log("register-err1", err1);
//                     if (err1)
//                         getResponseTemplate(res, 400, null, err1)
//                     else
//                         getResponseTemplate(res, 200, null, "Registration successfully.");
//                 })
//             })
//         } else {
//             getResponseTemplate(res, 400, null, "Email already exists.");
//         }
//     });
// };

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

exports.profile = async (req, res) => {
    const data = {
        "userId": 1,
        "phone": "01617630101",
        "userName": "uttam@k.com",
        "fullName": "Uttam Kumar",
        "photoUrl": "https://github.com/shadcn.png",
        "role": "admin",
        "status": "active",
        "joinedDate": "2024-01-15",
        "individualCosts": [
            {
                "id": "ic-1-1",
                "costType": "House Rent",
                "amount": 3500
            },
            {
                "id": "ic-1-2",
                "costType": "Room Gas Addon",
                "amount": 300
            }
        ]
    }
    return getResponseTemplate(res, 200, data, "success.");
};
