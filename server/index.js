const express = require("express");
const port = 3001;
const app = express();

//[GET] /
app.get("/", (req, res) => {
  res.json({
    message: "Hello World",
    status: "success",
  });
});

//listen
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
