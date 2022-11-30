var express = require('express');
var router = express.Router();
var config = require('../config');
const bcrypt = require('bcrypt');
const userSchema = require('../model/voter');
const questionSchema = require('../model/question');
const optionSchema = require('../model/option');
const pollingSchema = require('../model/polling');
const { mongo } = require('mongoose');
const mongoose = require('mongoose');
const question = require('../model/question');


/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

// add poll question
router.post('/addQuestion', async function (req, res, next) {
    const { adminId, questionPoll, optionsIs, lastDate } = req.body;
    try {
        let checkAdmin = await userSchema.aggregate([
            {
                $match: {
                    $and: [
                        { _id: mongoose.Types.ObjectId(adminId) },
                        { isAdmin: true }
                    ]
                }
            }
        ]);
        if (checkAdmin.length > 0) {
            let questionIs = new questionSchema({
                question: questionPoll,
                adminId: adminId,
                lastDate: lastDate
            });
            await questionIs.save();

            if (optionsIs != null && optionsIs != undefined && optionsIs != "") {
                console.log("option")
                optionIs = optionsIs.split(",")
                optionsAre = [];
                if (optionIs.length > 0) {
                    for (i = 0; i < optionIs.length; i++) {
                        let optionIss = new optionSchema({
                            option: optionIs[i],
                            questionId: questionIs._id
                        });

                        await optionIss.save();
                        optionsAre.push(optionIss);
                    }
                }
                return res.status(200).json({ IsSuccess: true, Data: questionIs, options: optionsAre, Message: "question added with options" })
            }
            return res.status(200).json({ IsSuccess: true, Data: questionIs, Message: "question added successfully" })
        }
        return res.status(200).json({ IsSuccess: true, Data: [], Message: "sorry you are not admin" })
    }
    catch (error) {
        return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message })
    }

});

// update poll question
router.post('/updatePollQuestion', async function (req, res, next) {
    const { adminId, questionPoll, lastDate, result, isActive, questionId } = req.body;
    try {
        let checkAdmin = await userSchema.aggregate([
            {
                $match: {
                    $and: [
                        { _id: mongoose.Types.ObjectId(adminId) },
                        { isAdmin: true }
                    ]
                }
            }
        ]);
        if (checkAdmin.length > 0) {
            let checkQuestion = await questionSchema.aggregate([
                {
                    $match: {
                        _id: mongoose.Types.ObjectId(questionId)
                    }
                }
            ]);
            if (checkQuestion.length > 0) {
                let update = {
                    question: questionPoll != undefined && questionPoll != null && questionPoll != "" ? questionPoll : checkQuestion[0].question,
                    lastDate: lastDate != null && lastDate != "" && lastDate != undefined ? lastDate : checkQuestion[0].lastDate,
                    result: result != null && result != "" && result != undefined ? result : checkQuestion[0].result,
                    isActive: isActive != null && isActive != "" && isActive != undefined ? isActive : checkQuestion[0].isActive
                };

                let updateQuestion = await questionSchema.findByIdAndUpdate(questionId, update, { new: true });

                return res.status(200).json({ IsSuccess: true, Data: updateQuestion, Message: "question Updated SuccessFully" })
            }
            return res.status(200).json({ IsSuccess: true, Data: [], Message: "question Not Found" })
        }
        return res.status(200).json({ IsSuccess: true, Data: [], Message: "sorry you are not admin" })
    }
    catch (error) {
        return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message })
    }

});

//update poll options
router.post('/updatePollOption', async function (req, res, next) {
    const { adminId, optionId, optionIs } = req.body;
    try {
        let checkAdmin = await userSchema.aggregate([
            {
                $match: {
                    $and: [
                        { _id: mongoose.Types.ObjectId(adminId) },
                        { isAdmin: true }
                    ]
                }
            }
        ]);
        if (checkAdmin.length > 0) {
            let checkOption = await optionSchema.aggregate([
                {
                    $match: {
                        _id: mongoose.Types.ObjectId(optionId)
                    }
                }
            ]);
            if (checkOption.length > 0) {
                let update = {
                    option: optionIs
                }
                let updateOption = await optionSchema.findByIdAndUpdate(optionId, update, { new: true });

                return res.status(200).json({ IsSuccess: true, Data: updateOption, Message: "Option Updated Successfully" })
            }
            return res.status(200).json({ IsSuccess: true, Data: [], Message: "No Any Option Found" })
        }
        return res.status(200).json({ IsSuccess: true, Data: [], Message: "sorry you are not admin" })
    }
    catch (error) {
        return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message })
    }

});

//update poll options
router.post('/removePollQuestion', async function (req, res, next) {
    const { adminId, isActive, questionId } = req.body;
    try {
        let checkAdmin = await userSchema.aggregate([
            {
                $match: {
                    $and: [
                        { _id: mongoose.Types.ObjectId(adminId) },
                        { isAdmin: true }
                    ]
                }
            }
        ]);
        if (checkAdmin.length > 0) {
            let checkQuestion = await questionSchema.aggregate([
                {
                    $match: {
                        _id: mongoose.Types.ObjectId(questionId)
                    }
                }
            ]);
            if (checkQuestion.length > 0) {
                let update = {
                    isActive: isActive
                };

                let updateQuestion = await questionSchema.findByIdAndUpdate(questionId, update, { new: true });

                return res.status(200).json({ IsSuccess: true, Data: updateQuestion, Message: "question Updated SuccessFully" })
            }
            return res.status(200).json({ IsSuccess: true, Data: [], Message: "question Not Found" })
        }
        return res.status(200).json({ IsSuccess: true, Data: [], Message: "sorry you are not admin" })
    }
    catch (error) {
        return res.status(500).json({ IsSuccess: false, Data: [], Message: error.message })
    }

});

module.exports = router;
