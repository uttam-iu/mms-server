
const { v4: uuid } = require('uuid');
const { getHassPassword, isPasswordMatch, getResponseTemplate, serverFormattedDateAndTime } = require('../helpers/utilities');
// const dbCon = require("../helpers/dbHelper");
const members = require('../dummyData/users.json');
var jwt = require('jsonwebtoken');

// const USER_TABLE = process.env.DB_USER_TABLE;


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
    const { userName, password } = req.body;
    if (!userName || !password) {
        return getResponseTemplate(res, 400, null, "userName and password are required.");
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
        return getResponseTemplate(res, 500, null, "Server configuration error: missing JWT_SECRET.");
    }

    const token = jwt.sign({ userId: userName }, JWT_SECRET, { expiresIn: '1h' });
    return getResponseTemplate(res, 200, {
        user:  {
            "userId": 1,
            "phone": "01617630101",
            "userName": "uttam@k.com",
            "fullName": "Uttam Kumar",
            "photoUrl": "https://github.com/shadcn.png",
            isAdmin: true,
        },
        token,
    }, "Logged in successfully.");
    // const emailCheckQuery = `select password from ${USER_TABLE} where email='${email}';`;
    // dbCon.query(emailCheckQuery, (err, rows, fields) => {
    //     if (err) getResponseTemplate(res, 400, null, err);
    //     else if (rows?.length === 0) getResponseTemplate(res, 400, null, "Invalid email.");
    //     else {
    //         isPasswordMatch(password, rows?.[0]?.password, (isMatch) => {
    //             if (!isMatch) getResponseTemplate(res, 400, null, "Invalid password.");

    //             const loginQuery = `select userId, email, displayName, gender, userPhotoUrl from ${USER_TABLE} where email='${email}'`;
    //             dbCon.query(loginQuery, (err1, rows1, fields) => {
    //                 if (err1)
    //                     getResponseTemplate(res, 400, null, "Something went wrong.");
    //                 else {
    //                     jwt.sign({
    //                         userId: rows1?.[0]?.userId
    //                     }, JWT_SECRET, { expiresIn: '1h' }, (tError, token) => {
    //                         if (tError)
    //                             getResponseTemplate(res, 400, null, "Something went wrong.");
    //                         else getResponseTemplate(res, 200, {
    //                             user: rows1?.[0],
    //                             token,
    //                         }, "Success.");
    //                     });
    //                 }
    //             })

    //         });
    //     }
    // })
    // console.log(userName, password)
    // jwt.sign({
    //         userId: 1231
    //     }, JWT_SECRET, { expiresIn: '1h' }, (tError, token) => {
    //         if (tError)
    //             getResponseTemplate(res, 400, null, "Something went wrong.");
    //         else getResponseTemplate(res, 200, {
    //             user: {userId: 1231},
    //             token,
    //         }, "Success.");
    //     });
};

exports.profile = async (req, res) => {    
    const data= {
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
