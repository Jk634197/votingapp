const mongoose = require('mongoose');

const question = mongoose.Schema({
    question: {
        type: String
    },
    result: {
        type: String,
        default: ""
    },
    adminId: {
        type: mongoose.Types.ObjectId,
        ref: "voters"
    },
    lastDate: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model("question", question);