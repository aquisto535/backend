//mysql
// const mysql = require("mysql");
// const conn = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "123456",
//   database: "node_dbs",
// });

// conn.connect();

const express = require("express");

const app = express(); //함수 포인터. 객체로 받음. express의 모든 기능을 담게 됨.
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/write", (req, res) => {
  res.sendFile(__dirname + "/write.html");
});

app.get("/game", (req, res) => {
  res.send("게임 페이지입니다.");
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

//post를 받을 때 사용
app.post("/add", (req, res) => {
  console.log(req.body.title);
  console.log(req.body.date);

  // conn.query(
  //   `insert into todo_bk(title, created) values("${req.body.title}", "${req.body.date}")`,

  //   // [req.body.title, req.body.date],
  //   function (err, rows, fields) {
  //     if (err) throw err;
  //   }
  // );

  //파일 입출력, 엑셀, DB

  res.send("전송 완료");
});

app.listen(8080, () => {
  console.log("listening on 8080");
});

//nodemon: 코드에 변화가 있을 때마다 서버를 재시작시켜줌.

app.get("/list", (req, res) => {});
