const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

var db;
const MongoClient = require('mongodb').MongoClient;
MongoClient.connect('mongodb+srv://admin:1111@cluster0.s7iwyel.mongodb.net/?retryWrites=true&w=majority', function(err, client){
    if(err) return console.log(err);

    db = client.db('TodoApp');

    // db.collection('post').insertOne({이름 : 'john', 나이 : 20}, function(err, result){
    //     console.log('저장완료');
    // })

    app.listen(8080, function () {
        console.log("listening on 8080");
        });
})



app.get("/pet", function (req, res) {
  res.send("펫용품을 쇼핑할 수 있는 페이지입니다.");
});

app.get("/beauty", function (req, res) {
  res.send("뷰티용품을 쇼핑할 수 있는 페이지입니다.");
});

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/write", (req, res) => {
  res.sendFile(__dirname + "/write.html");
});

app.post("/add", function (req, res) {
  res.send("전송완료");
  console.log(req.body.title);
  console.log(req.body.date);

  //어떤 사람이 /add라는 경로로 post 요청을 하면
  // 데이터 2개를 보내주는데 post라는 컬렉션에 두 개의 데이터를 저장한다.
  db.collection('counter').findOne({name : 'postcnt'}, function(err, result){
    console.log(result.totalPost);

    var totalcount = result.totalPost;

    db.collection('post').insertOne({_id : totalcount + 1, todo : req.body.title, date : req.body.date}, function(err, result){
        console.log('저장완료');
        //counter라는 컬렉션에 있는 totalPost 1증가시켜주어야 함.
        db.collection('counter').updateOne({name:'postcnt'}, { $inc : {totalPost:1}}, function(err, result){
            if(err) return console.log(err);
        })
    })

    
  });



});

// /list로 GET요청을 접속, 실제 몽고DB에 저장된 데이터를 읽어와서 HTML을 보여줌
app.get("/list", (req, res) => {
  // DB 에 저장된 post라는 컬렉션에 있는 데이터 두개를 꺼내서 넘겨주자.
  db.collection('post').find().toArray(function(err, result){
    console.log(result);
    res.render('list.ejs', {posts : result});
  })
});