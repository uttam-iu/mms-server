const express = require("express");
const cors = require("cors");
const app = express();
const multer = require('multer')
const { v4: uuid } = require('uuid');
// const dbCon = require("./helpers/dbHelper");
// const checkLogin = require("./middlewares/checkLogin");

const { serverFormattedDate, serverFormattedDateAndTime } = require('./helpers/utilities');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup Cross Origin
app.use(cors({ origin: true, credentials: true }));
// app.use(cors({ 
//   origin: 'http://localhost:3000', // Aponar frontend dynamic port exact hobe (Do NOT use true)
//   credentials: true 
// }));

const PORT = process.env.PORT;
// const USER_TABLE = process.env.DB_USER_TABLE;
// const MESSAGE_TABLE = process.env.DB_MESSAGE_TABLE;
// const basePath = 'http://localhost:' + PORT + '/';

// app.use(express.static(__dirname + '/public'));
// const IMAGE_FOLDER = process.env.IMAGE_FOLDER;
// app.use(`/${IMAGE_FOLDER}`, express.static(`${IMAGE_FOLDER}`));

app.get('/', (req, res) => {
  res.send('Hello from Express and MongoDB!');
});

app.use("/user", require("./routes/users"));

// const imageFileFilter = function (req, file, cb) {
//   if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
//     return cb(new Error("Please upload an image file"));
//   }

//   cb(undefined, true);
// };
// const audioFileFilter = function (req, file, cb) {
//   if (!file.originalname.match(/\.(mp3|wav|webm)$/)) {
//     return cb(new Error("Please upload an audio file"));
//   }

//   cb(undefined, true);
// };

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, `./${IMAGE_FOLDER}/`)
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//     cb(null, uniqueSuffix + '-' + file?.originalname)
//   }
// });

// const uploadImage = multer({
//   limits: {
//     fileSize: 1024 * 1024 * 1, // This number is in bytes, so this is 5mb
//   },
//   fileFilter: imageFileFilter,
//   storage
// });

// const uploadAudio = multer({
//   limits: {
//     fileSize: 1024 * 1024 * 1, // This number is in bytes, so this is 5mb
//   },
//   fileFilter:audioFileFilter,
//   storage
// });

// app.post("/post-image", checkLogin, uploadImage.single('profileFile'), (req, res) => {
//   const { senderId, chatId, receiverId } = req?.body;
 
//   const filePath = basePath + `${IMAGE_FOLDER}/` + req?.file?.filename;
//   const messageId = uuid();
//   const postMessageQuery = `insert into ${MESSAGE_TABLE} (messageId, chatId, senderId, receiverId, message, messageDate, messageTime, photoUrl) values('${messageId}', '${chatId}', '${senderId}', '${receiverId}', '""', '${serverFormattedDate(new Date())}', '${serverFormattedDateAndTime(new Date())}', '${filePath}');`

//   dbCon.query(postMessageQuery, (err, rows) => {
//     if (!err) res.status(200).json({
//       success: true,
//       rows,
//       error: null,
//     })
//     else res.status(500).json({
//       success: false,
//       rows: null,
//       error: err
//     })
//   });
// });

// app.post("/post-profile-image", checkLogin,  uploadImage.single('profileFile'), (req, res) => {
//   const { userId } = req?.body;
  
//   const filePath = basePath + `${IMAGE_FOLDER}/` + req?.file?.filename;

// const postMessageQuery = `update ${USER_TABLE} set userPhotoUrl = '${filePath}' where userId='${userId}';`
      
//   dbCon.query(postMessageQuery, (err, rows) => {
//       if (!err) res.status(200).json({
//           success: true,
//           rows,
//           error: null,
//           filePath
//       })
//       else res.status(500).json({
//           success: false,
//           rows: [],
//           error: err
//       })
//   });
// })

// app.post("/post-audio", checkLogin, uploadAudio.single('audioFile'), (req, res) => {
//   const { senderId, chatId, receiverId } = req?.body;
 
//   const filePath = basePath + `${IMAGE_FOLDER}/` + req?.file?.filename;
//   const messageId = uuid();
//   const postMessageQuery = `insert into ${MESSAGE_TABLE} (messageId, chatId, senderId, receiverId, message, messageDate, messageTime, audioUrl) values('${messageId}', '${chatId}', '${senderId}', '${receiverId}', '""', '${serverFormattedDate(new Date())}', '${serverFormattedDateAndTime(new Date())}', '${filePath}');`

//   dbCon.query(postMessageQuery, (err, rows) => {
//     if (!err) res.status(200).json({
//       success: true,
//       rows,
//       error: null,
//     })
//     else res.status(500).json({
//       success: false,
//       rows: null,
//       error: err
//     })
//   });
// });

//Bring in the routes
// app.use("/user", require("./routes/users"));

//Setup Error Handlers
const errorHandlers = require("./handlers/errorHandlers");
app.use(errorHandlers.notFound);
app.use(errorHandlers.mysqlErrors);
if (process.env.NODE_ENV === "development") {
  app.use(errorHandlers.developmentErrors);
} else {
  app.use(errorHandlers.productionErrors);
}

module.exports = app;