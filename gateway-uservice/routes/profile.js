var express = require('express');
var Request = require("request");
var secured = require('../lib/middleware/secured');
var router = express.Router();

router.get('/profile',secured(), function(req, res){
   
    logged_in = true;
    
    const { _raw, _json, ...userProfile } = req.user;
    //displayName = userProfile.displayName;
    var service_url = process.env.SERVICE_CART_NODEJS.concat(userProfile.user_id);
        
    Request.get(service_url, (error, response, body) => {
        if(error) {
            return console.dir(error);
        }
        cartLength = JSON.parse(body).length;
    });

    Request.post({
        "headers": { "content-type": "application/json" },
        "url": process.env.SERVICE_USERGET_FLASK,
        "body": JSON.stringify({
            userID: userProfile.user_id
        })
        }, (error, response, body) => {
        if(error) {
            return console.dir(error);
        }
        res.render('profile',{
            cartL: cartLength, 
            logged: logged_in,
            dName: JSON.parse(body)[0].displayName,
            email: JSON.parse(body)[0].emails[0].value,
            fname: JSON.parse(body)[0].name.givenName,
            lname: JSON.parse(body)[0].name.familyName,
            nickname: JSON.parse(body)[0].nickname,
            picture: JSON.parse(body)[0].picture
        });
        console.dir(JSON.parse(body)[0]);
    });
    
    
});

module.exports = router;
