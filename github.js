const express = require('express')
var bodyParser = require('body-parser')
var parseRequest = require('parse-request')
var mongoose = require('mongoose');
var cors = require('cors');
var rand_token = require('rand-token').uid;
var uid = null;
const app = express()
const port = 3000
app.use(bodyParser.json())
app.use(cors());
app.get('/',(req, res) => {
	return res.send("<marquee><h2>Hello World!!<h2></marquee>")
})
app.get('/storeUserDetails', (req, res) => {
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
    	name : String,
    	title : String
    });

    var User = mongoose.model("User", userSchema);

    User.create({
    	name : "Vivek Mehta",
    	title : "Mr."
    }, function(error,data) {
        if(error) {
            console.log("Error ==> "+error);
        } else {
            console.log("Data saved!! "+data);
        }
    });
})

app.post('/getRandomNumber', (req, res) => {
	var body = req.body;
	console.log("Response is ==> "+body.name);
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`));