// const express = require("express");
// const cors = require("cors");
// const app = express();
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

// // Setup Cross Origin
// app.use(cors({ origin: true, credentials: true }));

// const PORT = process.env.PORT;

// app.get('/', (req, res) => {
//   res.send('Hello from Express and MongoDB!');
// });

// app.use("/user", require("./routes/users"));

// //Setup Error Handlers
// const errorHandlers = require("./handlers/errorHandlers");
// app.use(errorHandlers.notFound);

// if (process.env.NODE_ENV === "development") {
//   app.use(errorHandlers.developmentErrors);
// } else {
//   app.use(errorHandlers.productionErrors);
// }

// module.exports = app;