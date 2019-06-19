var express = require('express');
var router = express.Router();

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const url = 'mongodb://localhost:27017';                           // Connection URL
const dbName = 'test';  

/* GET MQTT page. */
router.post('/logout', function(req, res, next) {
    console.log("before sessionID deleted  " + req.sessionID);
    
    MongoClient.connect(url, function(err, client) {                  // Use connect method to connect to the server
        assert.equal(null, err);
        console.log("Connected successfully to test database");
       
        const db = client.db(dbName);
    
        removeDocument(db,req, function() {
            client.close();
          });
          
      
       
      });

    
    
    console.log("after sessionID deleted " + req.sessionID);
    req.session.destroy(function(err) {
        // cannot access session here
        console.log("Come Back Agin");
        
        return res.redirect('/mqtt');
        
      });
    
   //res.send('responded');
});

const removeDocument = function(db,req, callback) {
    // Get the documents collection
    const collection = db.collection('sessions');
    // Delete document where a is 3
    collection.drop();
  }
module.exports = router;