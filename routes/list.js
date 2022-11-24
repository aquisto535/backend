var router = require("express").Router();

var db;
const MongoClient = require("mongodb").MongoClient;
MongoClient.connect(process.env.DB_URL, function (err, client) {
  if (err) return console.log(err);

  db = client.db("todo_app");
});

// /list로 GET요청을 접속, 실제 몽고DB에 저장된 데이터를 읽어와서 HTML을 보여줌
router.get("/list", (req, res) => {
  // DB 에 저장된 post라는 컬렉션에 있는 데이터 두개를 꺼내서 넘겨주자.
  db.collection("post")
    .find()
    .toArray(function (err, result) {
      res.render("list.ejs", { posts: result });
    });
});

module.exports = router;
