const express = require('express')
var bodyParser = require('body-parser')
var parseRequest = require('parse-request')
var mongoose = require('mongoose');
var cors = require('cors');
var rand_token = require('rand-token').uid;
var userId = null, mobileNumber = null, webhookId = null, mobileNumberToGetNotified = null;
var token = rand_token(10);
const accountSid = 'ACc38fa6d0c68439678732f1c4f1c27491';
const authToken = '0acda55dd6a9e2f4b976d0b7bbf1eb6f';
const client = require('twilio')(accountSid, authToken);
const app = express()
const port = 3000
app.use(bodyParser.json())
app.use(cors());

	app.get('/',(req, res) => {
		return res.send("Hey the Github Notifier is connected !!")
	});

	app.post('/notify::webhookId',(req, res) => {
		webhookId = req.params.webhookId;
		var body = req.body;
		var commitMessage = null, committer = null;
		if(body.commits[0].message !== undefined) {
			commitMessage = body.commits[0].message;
			committer = body.commits[0].author.name;
		}
		mongoose.connect("mongodb+srv://viivekmehta:viivekmehta@vivekcluster-jerny.mongodb.net/github_notifier",{
                    useNewUrlParser : true,
                    useUnifiedTopology: true
                }, function (error,db) {
                    if(error) {
                        console.log("Error is ==> "+error);
                    } else {
                        db.collection('users').find({webhookId : webhookId}).toArray(function(err, results){
                            if(results.length !== 0) {
                                mobileNumberToGetNotified = results[0].mobileNumber;
                                sendMessage(mobileNumberToGetNotified, committer, commitMessage);
                                console.log("User's mobile number to be notified ==> "+mobileNumberToGetNotified);
                            } else {
                                console.log("No data found!!");
                            }
                            db.close();
                         });
                    }
            });
		return res.send("<marquee><h2>Hey "+webhookId+"<h2></marquee>")
	});

	app.post('/getRandomNumber', (req, res) => {
		console.log("call made!!");
		var body = req.body;
		userId = body.name;
		mobileNumber = body.mobile_number;
		console.log("Response is ==> "+userId+" , "+mobileNumber);
		storeUserDetails(token, userId, mobileNumber);
		return res.send(token);
	})

	function storeUserDetails(token, userId, mobileNumber) {
		mongoose.connect("mongodb+srv://viivekmehta:viivekmehta@vivekcluster-jerny.mongodb.net/github_notifier",{
                useNewUrlParser : true,
                useUnifiedTopology: true
            }, function (error) {
                if(error) {
                    console.log("Error is ==> "+error);
                } else {
                    console.log("Connected to the database !!"+error)
                }
        });
        var userSchema = new mongoose.Schema({
            userId : String,
            webhookId : String,
            mobileNumber : String
        });

        var User = mongoose.models.users || mongoose.model('users', userSchema);

        User.create({
            userId : userId,
            webhookId : token,
            mobileNumber : mobileNumber
        }, function(error,data) {
            if(error) {
                console.log("Error ==> "+error);
            } else {
                console.log("Data saved!! "+data);
            }
        });
	}

	function sendMessage(userMobileNumber, committer, commitMessage) {
		var messageBody = null;
		if(committer == null) {
			messageBody = "You have a new github notification!!";
		} else {
			messageBody = "You have a new github notification!!\nCommitter : "+committer+"\nCommit Message : "+commitMessage;
		}
		client.messages
          .create({
             body: messageBody,
             from: '+16235524395',
             to: '+91'+userMobileNumber
           })
          .then(message => console.log("Message sent to mobile number ==> "+userMobileNumber+" and sms id ==> "+message.sid));
	}

app.listen(port, () => console.log(`Example app listening on port ${port}!`));