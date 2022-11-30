const mongoose = require('mongoose');

const options = mongoose.Schema({
    option: {
        type: String
    },
    questionId: {
        type: mongoose.Types.ObjectId,
        ref: "questions"
    }
});

module.exports = mongoose.model("option", options);