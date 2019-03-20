var express = require('express');
var router = express.Router();
var mongo = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;
var assert = require('assert');
var crypto = require('crypto');

var url = 'mongodb://localhost:27017/test';


/* GET home page. */
router.get('/get-data', function(req, res, next) {
  res.render('index');
});
// Root ruta
router.get('/', function(req, res, next) {
  var resultArray = [];
  mongo.connect(url, async function(err, db) {
    if (err) throw err;
    assert.equal(null, err);
    // Kolekcija korisnika
    let users = db.collection('users');
    // Napravi dummy korisnika ako ne postoji
    if (await users.findOne({ author: '@minisstryofprogramming'}) === null) {
      users.insertOne({
        _id: crypto.createHash('sha256').digest('hex'),
        author: '@ministryofprogramming',
        image: 'https://media.licdn.com/dms/image/C510BAQHuByWuDvP-hA/company-logo_400_400/0?e=1560988800&v=beta&t=CiUnL65rbBy1sMkSfg7_eNXONfJmICaM6tejAKTCTqM'
      }, (err, res) => {}); 
    }
    // Kolekcija tweetova
    let tweets = db.collection('tweets');
    // Pronađi korisnika sa "author:id" query-em
    let user = await users.findOne({ author: '@ministryofprogramming' });
    // Svi tweetovi
    var cursor = tweets.find().sort({time: -1});
    cursor.forEach(function(doc, err) {
      assert.equal(null, err);
      resultArray.push(doc);
    }, function() {
      db.close();
      // Renderuj na template
      res.render('index', {user, items: resultArray});
    });
  });
});

router.post('/insert', function(req, res, next) {
  var item = {
    title: req.body.title,
    content: req.body.content,
    author: "@ministryofprogramming",
    time: new Date()
  };

  mongo.connect(url, function(err, db) {
    assert.equal(null, err);
    db.collection('tweets').insertOne(item, function(err, result) {
      assert.equal(null, err);
      console.log('Item inserted');
      db.close();
    });
  });

  res.redirect('/');
});

module.exports = router;
