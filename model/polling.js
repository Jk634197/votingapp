const mongoose = require('mongoose');

const polling = mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "voters"
    },
    questionId: {
        type: mongoose.Types.ObjectId,
        ref: "questions"
    },
    optionId: {
        type: mongoose.Types.ObjectId,
        ref: "options"
    },
    optionName: {
        type: String
    },
    dateTime: {
        type: String
    },

});

module.exports = mongoose.model("polling", polling);