var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/regtr', function(req, res, next) {
  res.render('registration', { title: 'Express' });
});

module.exports = router;