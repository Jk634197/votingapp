var express = require('express');
var router = express.Router();
var config = require('../config');
const bcrypt = require('bcrypt');
const userSchema = require('../model/voter');
const { mongo } = require('mongoose');
const mongoose = require('mongoose');
const questionSchema = require('../model/question');
const optionSchema = require('../model/option');
const pollingSchema = require('../model/polling');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

//Signup--------JAINIK--------------13/10/2021
router.post('/signUp', async function (req, res, next) {
  try {

    const { name, mobileno, email, isAdmin, password } = req.body;

    let user = new userSchema({
      name: name,
      password: password,
      mobileNo: mobileno,
      email: email,
      isAdmin: isAdmin != null && isAdmin != undefined && isAdmin != "" ? isAdmin : false
    })
    try {
      await user.save();
      return res.status(200).json({ IsSuccess: true, Data: user, Message: "Successfully Registered" })
    }
    catch (err) {
      return res.status(500).json({ IsSuccess: false, Data: [], Message: err.Message || "Having issue is server" })
    }
  }
  catch (error) {
    return res.status(500).json({ IsSuccess: false, Data: [], Message: error.Message || "Having issue is server" })
  }

  // return res.status(200).json({IsSuccess:true,Data:[],Message:""})
});

//login--------JAINIK--------------13/10/2021
router.post('/login', async function (req, res, next) {
  try {

    const { mobileno, email, password } = req.body;

    console.log(mobileno + "  " + email + "  " + password)
    if (mobileno != null && mobileno != "" && mobileno != undefined && password != "" && password != undefined && password != null) {
      let checkUser = await userSchema.aggregate([
        {
          $match: {
            mobileNo: mobileno
          }
        }
      ]);
      console.log(checkUser.length);
      if (checkUser.length > 0) {
        for (i = 0; i < checkUser.length; i++) {
          try {
            var match = await bcrypt.compare(password, checkUser[i].password);
            if (match) {
              return res.status(200).json({ IsSuccess: true, Data: checkUser, Message: "password match login succesful" })
            }
            else {
              return res.status(401).json({ IsSuccess: true, Data: [], Message: "sorry Password not match" })
            }
          }
          catch (errorm) {
            res.status(500).send({ message: errorm.message || "error occured while comparing password" });
          }
        }
      }
      return res.status(200).json({ IsSuccess: true, Data: [], Message: "No User Found" })
    }
    else if (email != null && email != "" && email != undefined && password != "" && password != undefined && password != null) {
      let checkUser = await userSchema.aggregate([
        {
          $match: {
            $and: [
              {
                email: email
              }
            ]
          }
        }
      ]);
      console.log(checkUser.length);
      if (checkUser.length > 0) {
        for (i = 0; i < checkUser.length; i++) {
          try {
            var match = await bcrypt.compare(password, checkUser[i].password);
            if (match) {
              return res.status(200).json({ IsSuccess: true, Data: checkUser, Message: "password match login succesful" })
            }
            else {
              return res.status(401).json({ IsSuccess: true, Data: [], Message: "sorry Password not match" })
            }
          }
          catch (errorm) {
            res.status(500).send({ message: errorm.message || "error occured while comparing password" });
          }
        }
      }
      return res.status(200).json({ IsSuccess: true, Data: [], Message: "No User Found" })
    }
    else {
      return res.status(200).json({ IsSuccess: true, Data: [], Message: "Please Provide either mobileno and password or email and password" })
    }
  }
  catch (error) {
    return res.status(500).json({ IsSuccess: false, Data: [], Message: error.Message || "Having issue is server" })
  }

  // return res.status(200).json({IsSuccess:true,Data:[],Message:""})
});
//get all polling question--------JAINIK--------------13/10/2021
router.post('/getAllPollingQuestion', async function (req, res, next) {
  try {

    const { userId } = req.body;

    let getPoll = await questionSchema.aggregate([{
      $match: {
        isActive: true
      }
    }]);

    if (getPoll.length > 0) {
      allPoll = []
      for (i = 0; i < getPoll.length; i++) {
        questionIdIs = getPoll[i]._id
        let getOption = await optionSchema.aggregate([
          {
            $match: {
              questionId: mongoose.Types.ObjectId(questionIdIs)
            }
          }
        ]);
        let poll = {
          result: getPoll[i].result,
          lastDate: getPoll[i].lastDate,
          isActive: getPoll[i].isActive,
          _id: getPoll[i]._id,
          question: getPoll[i].question,
          adminId: getPoll[i].adminId,
          option: getOption
        }
        allPoll.push(poll)
      }
      return res.status(200).json({ IsSuccess: true, Data: allPoll, Message: "all poll send" })
    }
    return res.status(200).json({ IsSuccess: true, Data: [], Message: "sorry no any open poll found" })
  }
  catch (error) {
    return res.status(500).json({ IsSuccess: false, Data: [], Message: error.Message || "Having issue is server" })
  }

  // return res.status(200).json({IsSuccess:true,Data:[],Message:""})
});

//add vote--------JAINIK--------------13/10/2021
router.post('/votting', async function (req, res, next) {
  try {

    const { questionId, optionId, userId, dateTime } = req.body;

    let checkQuestion = await questionSchema.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(questionId)
        }
      }
    ]);
    if (checkQuestion.length > 0) {
      let checkOption = await optionSchema.aggregate([
        {
          $match: {
            _id: mongoose.Types.ObjectId(optionId)
          }
        }
      ]);
      if (checkOption.length > 0) {
        let checkUser = await userSchema.aggregate([
          {
            $match: {
              _id: mongoose.Types.ObjectId(userId)
            }
          }
        ]);
        if (checkUser.length > 0) {
          let addPoll = new pollingSchema({
            userId: userId,
            questionId: questionId,
            optionId: optionId,
            optionName: checkOption[0].option,
            dateTime: dateTime != undefined && dateTime != "" && dateTime != null ? dateTime : dateTime
          })

          await addPoll.save();

          return res.status(200).json({ IsSuccess: true, Data: addPoll, Message: "Vote added" })
        }
        return res.status(200).json({ IsSuccess: true, Data: [], Message: "sorry you are not user" })

      }
      return res.status(200).json({ IsSuccess: true, Data: [], Message: "sorry option not find" })
    }
    return res.status(200).json({ IsSuccess: true, Data: [], Message: "sorry question not find" })
  }
  catch (error) {
    return res.status(500).json({ IsSuccess: false, Data: [], Message: error.Message || "Having issue is server" })
  }

  // return res.status(200).json({IsSuccess:true,Data:[],Message:""})
});

//update vote
//add vote--------JAINIK--------------13/10/2021
router.post('/updateVote', async function (req, res, next) {
  try {

    const { questionId, optionId, userId, dateTime, pollingId } = req.body;

    let checkQuestion = await questionSchema.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(questionId)
        }
      }
    ]);
    if (checkQuestion.length > 0) {
      let checkOption = await optionSchema.aggregate([
        {
          $match: {
            _id: mongoose.Types.ObjectId(optionId)
          }
        }
      ]);
      if (checkOption.length > 0) {
        let checkUser = await userSchema.aggregate([
          {
            $match: {
              _id: mongoose.Types.ObjectId(userId)
            }
          }
        ]);
        if (checkUser.length > 0) {
          let checkPoll = await pollingSchema([
            {
              $match: {
                _id: mongoose.Types.ObjectId(pollingId)
              }
            }
          ]);
          if (checkPoll.length > 0) {
            let update = {
              userId: userId,
              questionId: questionId,
              optionId: optionId,
              optionName: checkOption[0].option,
              dateTime: dateTime != undefined && dateTime != "" && dateTime != null ? dateTime : ""
            }
            let updatePoll = await pollingSchema.findByIdAndUpdate(pollingId, update, { new: true })

            return res.status(200).json({ IsSuccess: true, Data: updatePoll, Message: "Vote updated" })
          }
          return res.status(200).json({ IsSuccess: true, Data: [], Message: "sorry you are not vote before" })
        }
        return res.status(200).json({ IsSuccess: true, Data: [], Message: "sorry you are not user" })

      }
      return res.status(200).json({ IsSuccess: true, Data: [], Message: "sorry option not find" })
    }
    return res.status(200).json({ IsSuccess: true, Data: [], Message: "sorry question not find" })
  }
  catch (error) {
    return res.status(500).json({ IsSuccess: false, Data: [], Message: error.Message || "Having issue is server" })
  }

  // return res.status(200).json({IsSuccess:true,Data:[],Message:""})
});
//change to admin--------JAINIK--------------13/10/2021
router.post('/requestAdmin', async function (req, res, next) {
  try {

    const { userId, adminId } = req.body;

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
      let checkUser = await userSchema.aggregate([
        {
          $match: {
            _id: mongoose.Types.ObjectId(userId)
          }
        }
      ]);
      //console.log(checkUser.length)
      if (checkUser.length > 0) {
        let update = {
          isAdmin: true
        }

        let updateUser = await userSchema.findByIdAndUpdate(checkUser[0]._id, update, { new: true });

        return res.status(200).json({ IsSuccess: true, Data: updateUser, Message: "user changed to admin" })
      }
      return res.status(200).json({ IsSuccess: true, Data: [], Message: "sorry you are not user" })
    }
    return res.status(200).json({ IsSuccess: true, Data: [], Message: "sorry you are not admin" })
  }
  catch (error) {
    return res.status(500).json({ IsSuccess: false, Data: [], Message: error.Message || "Having issue is server" })
  }

  // return res.status(200).json({IsSuccess:true,Data:[],Message:""})
});
module.exports = router;
