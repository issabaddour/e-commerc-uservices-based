var express = require('express');
var Request = require("request"); 
var secured = require('../lib/middleware/secured');
var router = express.Router();

/* GET cart page. */
router.get('/cart',secured(), function(req, res){
    if(req.user){
        logged_in = true;
    
        const { _raw, _json, ...userProfile } = req.user;
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
      
    const { _raw, _json, ...userProfile } = req.user;
    var service_url = process.env.SERVICE_CART_NODEJS.concat(userProfile.user_id);
    Request.get(service_url, (error, response, body) => {
        if(error) {
            return console.dir(error);
        }
        res.render('cart',{
            cartL: cartLength, 
            logged: logged_in,
            dName: displayName,
            data : JSON.parse(body) 
        });
    });
});

module.exports = router;