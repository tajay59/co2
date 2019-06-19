var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/mqtt', function(req, res, next) {
  console.log("mqtt session id is "+ req.session.name );
  if(!req.session.name){
    
    res.render('login');
    
  }
  else{res.render('mqtt');}
});

module.exports = router;