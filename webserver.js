const express = require("express");

const app = express(); //함수 포인터. 객체로 받음. express의 모든 기능을 담게 됨.

app.get("/webtoon", (req, res) => {
  res.send("웹툰을 서비스하는 페이지입니다.");
});

app.get("/game", (req, res) => {
  res.send("게임 페이지입니다.");
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.listen(8080, () => {
  console.log("listening on 8080");
});

//nodemon: 코드에 변화가 있을 때마다 서버를 재시작시켜줌.
