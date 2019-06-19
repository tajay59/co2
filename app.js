var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mqtt = require('mqtt')
var client  = mqtt.connect('http://localhost:1883')  // mqtt://test.mosquitto.org
var csv =  require('fast-csv');
var fs = require('fs');

var bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login');
var postRouter = require('./routes/try');
var regRouter = require('./routes/regtr');
var regCheckRouter = require('./routes/registration');
var mqttRouter = require('./routes/mqtt');
var logoutRouter = require('./routes/logout');

var app = express();
var jsonParser = bodyParser.json();                                 // create application/json parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });  // create application/x-www-form-urlencoded parser

//================== Setup MongoDB Database ==========================
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const url = 'mongodb://localhost:27017';                           // Connection URL
const dbName = 'test';   

//================== Connect to MongoDB Database ==========================
MongoClient.connect(url, function(err, client) {                  // Use connect method to connect to the server
  assert.equal(null, err);
  console.log("Connected successfully to test database");
 
  const db = client.db(dbName);

  findDocuments(db, function() { client.close(); });

});

//========== Insert Documents with a Query Filter ==============
const insertDocuments = function(db, callback) {
  // Get the documents collection
  const collection = db.collection('rpms');
  
  // Insert some documents
  collection.insertMany([
    {"username" : "req.body.username","password": "req.body.password"}
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

//========== Find Documents with a Query Filter ==============
const findDocuments = function(db, callback) {
  
  // Get the documents collection
  const collection = db.collection('rpms');
  // Find some documents
  collection.find({username : "user",password : "pwd"}).toArray(function(err, docs) {
  assert.equal(err, null);
  console.log("Found the following records");
  console.log(docs.length);

  if(docs.length > 0){req.session.name = "user"; console.log("FOUND and session id is "+ req.session.name ); "res.redirect('/mqtt');"} else {console.log("USER DOESN'T EXIST");"res.redirect('/login')"}
  console.log(docs);
  
  callback(docs);
    
  });
  
}

// ========= Update a document ================================ 
const updateDocument = function(db, callback) {
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
const removeDocument = function(db, callback) {
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

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: false, store: new MongoStore({url: 'mongodb://localhost/test'})}));
app.use(function(req, res, next) { res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0'); next(); });
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/', loginRouter);
app.use('/',postRouter);
app.use('/',regRouter); 
app.use('/',regCheckRouter);
app.use('/',mqttRouter);
app.use('/',logoutRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
// set locals, only providing error in development
res.locals.message = err.message;
res.locals.error = req.app.get('env') === 'development' ? err : {};

// render the error page
res.status(err.status || 500);
res.render('error');
});

function checkForCSV(){
// ======================== Check if CSV file exist, if not, create file ========================================
fs.open('datalog.csv','wx',(err)=> {
if(err){
if(err.code === 'EEXIST'){
console.log('Abort creating CSV file => already exist');
return; } }

fs.appendFile("datalog.csv","\n"+[ ["CO2 (ppm)","Temperature (*C)","Humidity (%)","","Date and Time"] ],(err)=> {
if (!err)
console.log("File Created");});  });  }

app.get("/", function(req,res){
res.sendFile('mqtt.php',{root: path.join(__dirname,"./")})    //  websockets-3.htm'    'elet.html' login.html
} ); 

client.on('connect', function () {
checkForCSV();
client.subscribe('sensor1', function (err,granted) {
console.log(granted[0]);
if (!err) {client.publish('sensor2', 'Hello again mqtt') } }) });

//================ Publishing Test ==================================
app.get('/pub', function(req, res){
client.publish('sensor1', 'running mqtt');
//rpm.findById({_id:"5c990ab58bab1c1ed859dc98"},function(err,docs){   res.json(docs);}); //res.send('new hello world');
}); 


// ================== Topics arrays ======================================
var topics = [];
function checkArray(array){ return topics}
//================ On receiving a MQTT message ==========================
client.on('message', function (topic, message) {


// message is Buffer
var mssg = message.toString();
console.log(mssg);
var array = mssg.split(",");
if(topics.find(checkArray) == undefined){ topics.push(array[0]);}
console.log(topics);

fs.appendFile("datalog.csv","\n"+[array[1],array[2],array[3]," ",new Date().toISOString()],(err)=> {if (err) throw err; console.log("Data appended");});
//csv.writeToPath("datalog.csv",[ ["Temperature","Heart Rate","Orientaion"] ],{headers:true}).on("Finish", res => { console.log("Finish updating");});
//client.end()
});

function espPost(req,res){
console.log(req.body.name+" "+req.body.password);
// res.json("got it");
pw.findOne({name:req.body.name},function(err,docs){ if(docs == null){console.log("Not found");res.json(false)}else{console.log(docs); res.json(true) ;}}); //}); )

}

app.post("/espPost",espPost);

module.exports = app;
