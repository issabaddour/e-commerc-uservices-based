var express = require('express');
var Request = require("request"); 
var bodyParser = require('body-parser');
var secured = require('../lib/middleware/secured');
var router = express.Router();


var urlencodedParser = bodyParser.urlencoded({extended: false});

router.post('/', secured(), urlencodedParser,function(req, res){
    console.dir("post!!!");
    const { _raw, _json, ...userProfile } = req.user;

    console.dir(userProfile.user_id);
    console.dir(req.body.productID);
    console.dir(req.body.productType);
    console.dir(req.body.productName);
    console.dir(req.body.productPrice);
    console.dir(req.body.productPhoto);
  
    Request.post({
      "headers": { "content-type": "application/json" },
      "url": process.env.SERVICE_ADDTOCART_NODEJS,
      "body": JSON.stringify({
        userID: userProfile.user_id,
        productID: req.body.productID,
        productType: req.body.productType,
        productName: req.body.productName,
        productPrice: req.body.productPrice,
        productPhoto: req.body.productPhoto
      })
      }, (error, response, body) => {
      if(error) {
          return console.dir(error);
      }
      console.dir(body);
    });
    res.redirect('/cart');
  });

  
module.exports = router;