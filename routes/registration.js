var express = require('express');
var router = express.Router();

//============================================
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const url = 'mongodb://localhost:27017';                           // Connection URL
const dbName = 'test';                                            // Database Name
 



//==============================================

/* GET users listing. */
router.post('/registration', function(req, res, next) {
    var ans = "";

MongoClient.connect(url, function(err, client,res) {                  // Use connect method to connect to the server
    assert.equal(null, err);
    console.log("Connected successfully to test database");
   
    const db = client.db(dbName);
    findDocuments(db,req, function() {client.close();});
    
    
  });

console.log(req.body.password+" received from REG form");
res.send('INSERTED SUCCESSFULLY');
});



const insertDocuments = function(db,req, callback) {
    // Get the documents collection
    const collection = db.collection('rpms');
    
    // Insert some documents
    collection.insertMany([
      {"username" : req.body.name,"email":req.body.email,"password": req.body.password}
    ], function(err, result) {
      
      assert.equal(err, null);
      console.log("passed err");
      assert.equal(1, result.result.n);
      console.log("passed num of results");
      assert.equal(1, result.ops.length);
      console.log("Inserted 1 documents into the collection");
      callback(result);
    });
  }
//   insertDocuments(db,req, function() { client.close();  });     <------ 



//========== Find Documents with a Query Filter ==============
let findDocuments = function(db,req, callback) {
    user = req.body.name;
    userEmail = req.body.email;
    pwd = req.body.password;
    
    // Get the documents collection
    const collection = db.collection('rpms');
    // Find some documents
    collection.find({username : user,email : userEmail, password : pwd}).toArray(function(err, docs) {
      assert.equal(err, null);
      console.log("Found the following records");
      console.log(docs.length);
      if(docs.length > 0){console.log("USER ALREADY EXIST"); } else {insertDocuments(db,req, function() { client.close();  });}
      console.log(docs);
      console.log(ans + " is ans inside");
      callback(docs);
      
    });
    
  }

// ========= Update a document ================================ 
const updateDocument = function(db,req, callback) {
    // Get the documents collection
    const collection = db.collection('rpms');
    // Update document where a is 2, set b equal to 1
    collection.updateOne({ a : 2 }
      , { $set: { b : 1 } }, function(err, result) {
      assert.equal(err, null);
      assert.equal(1, result.result.n);
      console.log("Updated the document with the field a equal to 2");
      callback(result);
    });
  }

// ========== Remove a document ===============================
//Remove the document where the field a is equal to 3. 
const removeDocument = function(db,req, callback) {
    // Get the documents collection
    const collection = db.collection('rpms');
    // Delete document where a is 3
    collection.deleteOne({ a : 3 }, function(err, result) {
      assert.equal(err, null);
      assert.equal(1, result.result.n);
      console.log("Removed the document with the field a equal to 3");
      callback(result);
    });
  }
module.exports = router;