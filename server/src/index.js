const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
//connect to env
dotenv.config();

const cookieParser = require("cookie-parser");
const route = require("./routes");

const app = express();

const db = require("./config/db/mongodb");
const config = require("./config/config");
const clientUrlDev = config.app.clientUrlDev;
const port = config.app.port;
//connect to db
db.connect();

app.use(morgan("dev"));
app.use(cors({ origin: clientUrlDev, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // de xu li thong tin tu form

//route
route(app);

//listen
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
