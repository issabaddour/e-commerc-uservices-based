var express = require('express');
var Request = require("request"); 
var router = express.Router();
/* --- global variable ---- */
/*
logged_in;
cartLength;
displayName;
*/
/* GET home/product page. */
router.get('/', function (req, res, next) {
  
  logged_in = false;
  displayName = '';
  cartLength = 0;
  if(req.user){
    const { _raw, _json, ...userProfile } = req.user;
    // check if user exist or new
    Request.post({
      "headers": { "content-type": "application/json" },
      "url": process.env.SERVICE_USERCHECK_FLASK,
      "body": JSON.stringify({userID: userProfile.user_id})
    }, (error, response, body) => {
      if(error) {return console.dir(error);}
      else if(JSON.parse(body).status){ // existing user
          console.dir('yes');
      }
      else{ // new user
        Request.post({ 
          "headers": { "content-type": "application/json" },
          "url": process.env.SERVICE_USERCREATE_FLASK,
          "body": JSON.stringify({userProfile})
        }, (error, response, body) => {
        if(error) {console.dir(error);}});
      }
  });
    
    logged_in = true;
    displayName = userProfile.displayName;
    var service_url = process.env.SERVICE_CART_NODEJS.concat(userProfile.user_id);
    Request.get(service_url, (error, response, body) => {
      if(error) {
        return console.dir(error);
      }
      cartLength = JSON.parse(body).length;
    });
  }
  else{
    logged_in = false;
    displayName = '';
    cartLength = 0;
  }
  var service_url = process.env.SERVICE_PRODUCTS_SPRINGBOOT;
    Request.get(service_url, (error, response, body) => {
      if(error) {
        return console.dir(error);
      }
      res.render('index',{
        cartL: cartLength, 
        logged: logged_in,
        dName: displayName,
        data : JSON.parse(body) 
      });
    });
});
module.exports = router;
