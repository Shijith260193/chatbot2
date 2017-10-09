var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
var app = express()
var moment = require('moment')
var mongoose = require('mongoose')
//var errorHandler = require('./helpers/error_handler');
var UserModel = require('./models/user.model');
var UserSchema = require('./Schemas/user.schema');
var User= mongoose.model('user',UserSchema);
var validator = require('./helpers/validators');


app.set('port', (process.env.PORT || 5000))

//MONGODB_URI="mongodb://chatbot:chatbot@ds113435.mlab.com:13435/chatbot";
// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())
app.db = mongoose.connect(process.env.MONGODB_URI);
//app.db = mongoose.connect(MONGODB_URI);

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'myverifytoken') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})

function datevalidator(value){
    //format is mm/dd/yyyy
    result=value.split("/")
    if(result[0]<13 && result[1]<32 && result[2].length == 4){
        return true
    }
    else{
        return false
    }
}


app.post('/webhook/', function (req, res) {
    messaging_events = req.body.entry[0].messaging
   
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i]
        sender = event.sender.id
         var count =0;
        
        if (event.message && event.message.text) {
            text = event.message.text
            
            if (text === 'hi' && count < 2) {
                // sendGenericMessage(sender)
                sendTextMessage(sender,"Hello from bot, Please pass me your name and DOB in mm/dd/yyyy")
                continue
            }
            if (text.indexOf("name=")!=-1 ){
                
                var name_text = text.substr(text.indexOf("name=")+"name=".length)
                User.findOne({name:name_text},function(err,doc){
                    if(err){
                        sendTextMessage(sender,"Error while searching your name... very strange!!!!")
                    }
                    else if(doc != undefined || doc != null ){
                        count+=1
                        sendTextMessage(sender,"Welcome "+name_text+" Now pass me your DOB for next step validation");
                        //PersonModel.update(
                        //     { _id: person._id }, 
                        //     { $push: { friends: friend } },
                        //     done
                        // );
                        
                        User.update(
                            {_id:doc._id},
                            {$push:{messages:text}},
                            function(err,result){
                                if(err){
                                    sendTextMessage(sender,"Error while updating the message... Hmm that is so ambigious")
                                }
                                
                            }
                        )
                    }
                    else{
                        sendTextMessage(sender,"Please register.. i feel you are not registered")
                    }

                })
                continue
            }
            if (text.indexOf("DOB=")!=-1){
                
                var dob_text = text.substr(text.indexOf("DOB=")+"DOB=".length)
                if(datevalidator(dob_text)){
                    User.findOne({DOB:dob_text},function(err,doc){
                        if(err){
                            sendTextMessage(sender,"Your DOB not found in DB")
                        }
                        else if(doc != undefined || doc != null ){
                            count+=1 
                            sendTextMessage(sender,"Welcome you are verfied user")
                        }
                        else{
                            sendTextMessage(sender,"arghhhhhh.....Please register.._/\\_ ")
                        }
                    })
                }
                
                continue
            }
            // now add the user by the Bot
            if(text ===`Show all for Shijith`){
                var val=text.split(" ")
                var name=val[val.length - 1]
                User.find({"name":name},'name DOB',function(err,docs){
                   if(err){
                      sendTextMessage(sender,"Error while reteriving the documents from DB")   
                     }
                   else if (docs != undefined || docs != null){
                     var data={}
                     docs.forEach(function(value){
                         data[value._id]=value
                     })
                     sendTextMessage(sender,"the values are "+JSON.stringify(data))
                     
                    }
                    else{
                     sendTextMessage(sender,"There is no data")   
                    }
               }) 
                continue
            }
            
            //load the conversation of the bot to the user
           
                sendTextMessage(sender, "Bot replied " + text.substring(0, 200))       
    
        }
        if (event.postback) {
            text = JSON.stringify(event.postback)
            sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token)
            continue
        }
    }
    res.sendStatus(200)
});

//register the user to chat
app.post('/register',function(req,res,next){
    // req.checkBody('name','Name is mandatory').isNotEmpty();
    // req.checkBody('email','Invalid email').isValidEmail();
    // req.checkBody('password','password is mandatory').isNotEmpty();
    // req.checkBody('DOB','DOB is mandatory').isDate();
    // req.checkBody('mobileNumber','mobileNumber is mandatory').isNotEmpty();
    // req.checkBody('profileImage','Invalid profileImage url').optional().isUrl();
    // var errors = req.validationErrors();
    // if (errors) {
    //     return errorHandler.sendFormattedError(res, errors);
    // }
    var userData={
        name: req.param('name'),
        email: req.param('email'),
        password: req.param("password"),
        mobileNumber: req.param('mobileNumber'),
        DOB:req.param('DOB')
    };
    console.log(userData)
    UserModel.saveNewUser(userData,function(error,result){
        if (error) {
            console.log(error)
            return res.json({error:"error in index.js page"})
        }
        return res.json({msg:"success",data:result})
      });
});



var token = "EAALZCio6Pr0MBAJdztnxTZCSXFLElq4DCCoY8ai0BMK1iITYcXMASY9c4VCXPLfklZBHzGlbTRGxWD5JZAPTWmF0gYXMvLy1CbAZAld0a3oYC7FIjh9K6rDl3nZBVl9ZBH2FL3rx0GpWS2b5tsXonAQtVdVznDbR1zHqBhBCJ0y2AZDZD"

// function to echo back messages -

function sendTextMessage(sender, text) {
    messageData = {
        text:text
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
       
    })
}

