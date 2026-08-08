const express = require("express");

const port = 3001;
const app = express();

const route = require("./routes");
const db = require("./config/db");

//connect to db
db.connect();

app.use(express.json());

//route
route(app);

//listen
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
