var express = require('express');
var bodyParser = require('body-parser');
var Request = require("request"); 
var Cloudant = require('@cloudant/cloudant');
var async = require('async');
var dateTime = require('node-datetime');
const e = require('express');

var urlencodedParser = bodyParser.urlencoded({extended: false});


var cloudant = new Cloudant({ url: 'https://bae39618-8d45-4c18-9ce2-868efe5164e6-bluemix.cloudantnosqldb.appdomain.cloud',
 plugins: { iamauth: { iamApiKey: '9l9dF4SIboAy3uixrH8HQb2Qt6ArU65g37vxiQgt7pBx' } } });
 
 cloudant.db.list(function(err, body) {
     body.forEach(function(db) {
         console.log(db);
        });
    });

    
    



var queryDocument = function(db ,query, callback){
    console.log("New Query!");
    cloudant.use(db).find(query, function(err, data){
        callback(err, data);
    });
}

/*queryDocument(query,function(err, data){
    console.log('Error:', err);
    console.log('Data:', data);
});*/

var createDocument = function(db, newData, callback) {
    console.log("Creating document ");
    // specify the id of the document so you can update and delete it later
    cloudant.use(db).insert(
      /*
        {
            user_id:  newData.userID,
            product_id: newData.productID,
            type: newData.productType,
            name: newData.productName,
            price: newData.productPrice,
            photo_url: newData.productPhoto,
            date_time: dateTime.create().format('Y-m-d H:M:S')
        }*/
        newData, 
        function(err, data) {
            console.log('Error:', err);
            console.log('Data:', data);
            callback(err, data);
        });
};
//createDocument(function(err,data){});


var readDocument = function(callback) {
    console.log("Reading document 'mydoc'");
    cloudant.use('cart-database').get('mydoc', function(err, data) {
      //console.log('Error:', err);
      //console.log('Data:', data);
      // keep a copy of the doc so you know its revision token
      doc = data;
      callback(err, data);
    });
  };

/*readDocument(function(err, data){
  console.log('--------------------------');
    console.log('Error:', err);
    console.log('Data:', data);
});*/

  var updateDocument = function(callback) {
    console.log("Updating document 'mydoc'");
    // make a change to the document, using the copy we kept from reading it back
    doc.c = true;
    cloudant.use('cart-database').insert(doc, function(err, data) {
      console.log('Error:', err);
      console.log('Data:', data);
      // keep the revision of the update so we can delete it
      doc._rev = data.rev;
      callback(err, data);
    });
  };

  var deleteDocument = function(db ,query, callback) {
    console.log("Deleting document  ");
    cloudant.use(db).destroy(query._id, query._rev, function(err, data) {
      callback(err, data);
    });
  };

  //async.series([/*createDocument, readDocument, updateDocument, deleteDocument]);

  
  var app = express();
  app.use(urlencodedParser);
  app.use(bodyParser.json());

  app.get('/cartbyid/:_id',function(req, res){
    var query = {
        "selector" : {
            "user_id" : req.params._id
        },
        "fields" : [
            "user_id",
            "product_id",
            "type",
            "name",
            "price",
            "photo_url"
        ]
    };
      queryDocument('cart-database', query, function(err, data){
          if(err) res.send("Error: " + err);
          else res.send(data.docs);

      })
    //res.send("nodejs apinodejs apinodejs apinodejs apinodejs apinodejs api !!!");
});

app.get('/ordersbyid/:_id',function(req, res){
    var query = {
        "selector" : {
            "user_id" : req.params._id
        },
        "fields" : [
          "user_id",
          "product_id",
          "type",
          "name",
          "price",
          "status",
          "photo_url",
          "date_time"
        ]
    };
      queryDocument('orders-database', query, function(err, data){
          if(err) res.send("Error: " + err);
          else res.send(data.docs);

      })
    //res.send("nodejs apinodejs apinodejs apinodejs apinodejs apinodejs api !!!");
});

app.post('/addtocart',urlencodedParser, function(req, res){
  console.dir(req.body);
  createDocument( 'cart-database',
    {
      "user_id":  req.body.userID,
      "product_id": req.body.productID,
      "type": req.body.productType,
      "name": req.body.productName,
      "price": req.body.productPrice,
      "photo_url": req.body.productPhoto,
    }
    ,function(err, data){})
});

app.post('/removefromcart',urlencodedParser, function(req, res){
  console.dir(req.body);
  var query = {
    "selector" : {
        "user_id" : req.body.userID,
        "product_id": req.body.productID
    },
    "fields" : [
      "_id",
      "_rev"
    ]};
    queryDocument('cart-database', query, function(err, data){
      if(err) res.send("Error: " + err);
      else{
        console.dir('data:::::::::');
        console.dir(data);
        for(let i=0;i<data.docs.length;i++){
          deleteDocument('cart-database',{_id: data.docs[i]._id, _rev:data.docs[i]._rev },function(err,data){});
        }
      } 
  })
});

app.post('/movecarttoorders',urlencodedParser, function(req, res){
  console.dir(req.body);
  var query = {
    "selector" : {
        "user_id" : req.body.userID
    },
    "fields" : [
      "_id",
      "_rev",

      "user_id",
      "product_id",
      "type",
      "name",
      "price",
      "photo_url"
    ]};
    queryDocument('cart-database', query, function(err, data){
      if(err) res.send("Error: " + err);
      else{
        console.dir('data:::::::::');
        console.dir(data);
        for(let i=0;i<data.docs.length;i++){
          createDocument('orders-database',
            {
              user_id:  data.docs[i].user_id,
              product_id:  data.docs[i].product_id,
              type:  data.docs[i].type,
              name:  data.docs[i].name,
              price:  data.docs[i].price,
              status: "On the way",
              photo_url:  data.docs[i].photo_url,
              date_time: dateTime.create().format('Y-m-d H:M:S')
              }
           , function(err,data){});
        }for(let i=0;i<data.docs.length;i++){
           deleteDocument('cart-database',{_id: data.docs[i]._id, _rev:data.docs[i]._rev },function(err,data){});
        }
      } 
  })
});

app.listen(80);
