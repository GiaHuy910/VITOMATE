const express = require("express");
const cors = require("cors");

const port = 3001;
const app = express();

const route = require("./routes");
const db = require("./config/db");

//connect to db
db.connect();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // de xu li thong tin tu form

//route
route(app);

//listen
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
