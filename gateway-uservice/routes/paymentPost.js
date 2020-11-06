var express = require('express');
var Request = require("request"); 
var bodyParser = require('body-parser');
var secured = require('../lib/middleware/secured');
var router = express.Router();


var urlencodedParser = bodyParser.urlencoded({extended: false});

router.post('/payment', secured(), urlencodedParser,function(req, res){
    console.dir("post!!!");
    const { _raw, _json, ...userProfile } = req.user;

    console.dir(userProfile.user_id);
  
    Request.post({
      "headers": { "content-type": "application/json" },
      "url": process.env.SERVICE_FROMCARTTOORDERS_NODEJS,
      "body": JSON.stringify({userID: userProfile.user_id})
      }, (error, response, body) => {
      if(error) {
          return console.dir(error);
      }
      console.dir(body);
    });
    res.redirect('/orders');
  });

  
module.exports = router;