const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
const methodOverride = require("method-override");

app.use("/public", express.static("public"));
app.use(methodOverride("_method"));

var db;
const MongoClient = require("mongodb").MongoClient;
MongoClient.connect(
  "mongodb+srv://wjdxoals:1111@cluster0.q1ou0.mongodb.net/?retryWrites=true&w=majority",
  function (err, client) {
    if (err) return console.log(err);

    db = client.db("todo_app");

    // db.collection("post").insertOne(
    //   { 이름: "john", 나이: 20 },
    //   function (err, result) {
    //     console.log("저장완료");
    //   }
    // );

    app.listen(8080, function () {
      console.log("listening on 8080");
    });
  }
);

app.get("/pet", function (req, res) {
  res.send("펫용품을 쇼핑할 수 있는 페이지입니다.");
});

app.get("/beauty", function (req, res) {
  res.send("뷰티용품을 쇼핑할 수 있는 페이지입니다.");
});

app.get("/", function (req, res) {
  res.render("index");
});

app.get("/write", (req, res) => {
  res.render("write");
});

app.post("/add", function (req, res) {
  res.send("전송완료");
  console.log(req.body.title);
  console.log(req.body.date);

  //어떤 사람이 /add라는 경로로 post 요청을 하면
  // 데이터 2개를 보내주는데 post라는 컬렉션에 두 개의 데이터를 저장한다.
  db.collection("counter").findOne({ name: "postcnt" }, function (err, result) {
    var totalcount = result.totalPost;

    db.collection("post").insertOne(
      { _id: totalcount + 1, todo: req.body.title, date: req.body.date },
      function (err, result) {
        console.log("저장완료");
        //counter라는 컬렉션에 있는 totalPost 1증가시켜주어야 함.
        db.collection("counter").updateOne(
          { name: "postcnt" },
          { $inc: { totalPost: 1 } },
          function (err, result) {
            if (err) return console.log(err);
          }
        );
      }
    );
  });
});

// /list로 GET요청을 접속, 실제 몽고DB에 저장된 데이터를 읽어와서 HTML을 보여줌
app.get("/list", (req, res) => {
  // DB 에 저장된 post라는 컬렉션에 있는 데이터 두개를 꺼내서 넘겨주자.
  db.collection("post")
    .find()
    .toArray(function (err, result) {
      res.render("list.ejs", { posts: result });
    });
});

app.delete("/delete", (req, res) => {
  console.log(req.body);
  req.body._id = parseInt(req.body._id);
  db.collection("post").deleteOne(req.body, function (err, result) {
    if (err) return console.log(err);
    console.log("삭제 완료");
    res.status(200).send({ message: "성공" });
  });
});

app.get("/detail/:id", (req, res) => {
  console.log();
  db.collection("post").findOne(
    { _id: parseInt(req.params.id) },
    function (err, result) {
      if (err) return console.log(err);
      console.log(result);
      res.render("detail", { data: result });
    }
  );
});

app.get("/edit/:id", (req, res) => {
  db.collection("post").findOne({ _id: req.params.id }, function (err, result) {
    if (err) return console.log(err);
    console.log(result);
    res.render("edit.ejs", { post: result });
  });
});

//update
app.put("/edit", function (req, res) {
  //폼에 담긴 todo데이터,  data 데이터를 가지고 db.collection(post)를 업데이트 시킴.
  console.log("업데이트가 됩니다.");
  db.collection("post").updateOne(
    { _id: parseInt(req.body.id) },
    { $set: { todo: req.body.title, date: req.body.date } },
    function (err, result) {
      if (err) return console.log(err);
      console.log("수정 완료");
    }
  );
});
