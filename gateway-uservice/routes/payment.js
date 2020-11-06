var express = require('express');
var secured = require('../lib/middleware/secured');
var router = express.Router();

router.get('/payment',secured(), function(req, res){
    res.render('payment');
});

module.exports = router;
