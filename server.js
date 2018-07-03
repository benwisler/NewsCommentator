// Dependencies
var express = require("express");
var mongojs = require("mongojs");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var cheerio = require("cheerio");
var request = require("request");

var app = express();
var db = require("./models");

const PORT = process.env.PORT || process.argv[2] || 8080;

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);


app.get("/", function (req, res) {
  db.Article.find({}, null, { sort: { '_id': -1 } }, function (error, data) {
    if (error) throw error;
    res.render("landing", { articleData: data })
  });
});
app.get("/a", function (req, res) {
  db.Article.find({})
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});
app.get("/notes/:id", function(req, res) { 
  console.log(req.params.id);
  db.Article.find({ _id: req.params.id })
  .populate({
    path: "note",
    model: "Note"
  }) 
  .then(function(dbArticle) {
      res.json(dbArticle)
  })
  .catch(function(err){
    res.json(err)
  })
      
});
app.get("/save/:id", function (req, res) {
  db.Article.findOneAndUpdate({
    _id: req.params.id},
    {$set: {saved: true}},
    function(error, results) {
      if(error) {
        res.json(error)
      }
      else {
        console.log(results)
        res.redirect("/saved")
      }
    }
  )
});
app.post("/notes/:id", function (req, res) {
  console.log(req.body.body +"!!!")
  db.Note.create(req.body)
  .then(function(dbNote) {
    return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { note: dbNote._id } }, { new : true }
    );

  })
  .then(function(dbArticle) {
    res.json(dbArticle)
    console.log(dbArticle)
  })
  .catch(function(err){
    res.json(err)
  })



});
app.get("/remove/:id", function (req, res) {
  db.Article.findOneAndUpdate({
    _id: req.params.id},
    {$set: {saved: false}},
    function(error, results) {
      if(error) {
        res.json(error)
      }
      else {
        console.log(results)
        res.redirect("/saved")
      }
    }
  )
});

app.get("/saved", function(req, res) {
  db.Article.find({saved: true}, function(error, data) {
    if(error) {
      res.json(error)
    }
    else {
      res.render("saved", {articleData: data})

    }
  })
})

app.get("/s", function (req, res) {
  db.Article.find({}, function (err, scrapedArticles) {
    if (err) throw err;
    var currentTitles = [];
    for (var i = 0; i < scrapedArticles.length; i++) {
      currentTitles.push(scrapedArticles[i].title);
    }

    request("https://www.bbc.com", function (error, response, html) {
      var $ = cheerio.load(html);
      $("div.media__content").each(function (i, element) {
        var result = {};
        if (currentTitles.indexOf($(element).find("h3.media__title > a").text()) === -1) {
        result.title = $(element)
          .find("h3.media__title > a")
          .text()
        result.summary = $(element)
          .find("p.media__summary")
          .text();
        result.link = $(element)
          .find("a.media__link")
          .attr("href")
        db.Article.create(result)
          .then(function (dbArticle) {
            console.log(dbArticle);
          })
          .catch(function (err) {
            return res.json(err);
          });
        }
      });
      res.redirect("/");
    });
  });
});


app.listen(PORT, function () {
  console.log("Server listening on: http://localhost:" + PORT);
});
