var express = require('express');
var router = express.Router();

/* GET MQTT page. */
router.get('/login', function(req, res, next) {
    if(req.session.name){
        // cannot access session here
        console.log("Already logged in");

        res.render('mqtt');
      }
      else{return res.render('login');}
    
//   res.send('responded');
});

module.exports = router;