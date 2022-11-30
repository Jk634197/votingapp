require("dotenv").config();
const mongoose = require("mongoose");
// const firebase = require("firebase-admin");

/*Database Connection*/
mongoose.connect(process.env.HOST, {
    useUnifiedTopology: true
});

mongoose.connection
    .once("open", () => console.log("DB Connected"))
    .on("error", (error) => {
        console.log("Error While Connecting With DB");
    });
// console.log(tokenIs);

module.exports = { mongoose };