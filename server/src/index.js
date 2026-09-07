const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");

//connect to env0
dotenv.config();
const app = express();
const route = require("./routes");
const db = require("./config/db/mongodb");
const cookieParser = require("cookie-parser");
const config = require("./config/url");
const port = config.port;
const web_url_dev = config.client_url_dev;

//connect to db
db.connect();

app.use(morgan("dev"));
app.use(cors({ origin: web_url_dev, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // de xu li thong tin tu form

//route
route(app);

//listen
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
