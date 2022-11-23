const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true })); // req.body 사용하기 위해 설치.
app.set("view engine", "ejs");
const methodOverride = require("method-override");

app.use("/public", express.static("public"));
app.use(methodOverride("_method")); // put 쓰기 위한 패키지.
//const FileStore = require("session-file-store");
const session = require("express-session"); //세션 정보 이용하기 위한 패키지.
const MySQLStore = require("express-mysql-session");

//session: file store. 세션 정보를 파일에 저장하는 방법
// app.use(
//   session({
//     secret: "secret key",
//     resave: false,
//     saveUninitialized: true,
//     store: new FileStore(),
//   })
// );

//session: mysql store.  세션 정보를 db에 저장하는 방법.
app.use(
  session({
    secret: "secret key",
    resave: false,
    saveUninitialized: true,
    store: new MySQLStore({
      host: "localhost",
      port: 3306,
      user: "root",
      password: "123456",
      database: "node_dbs",
    }),
  })
);

//보안 기능 : md5 + salt
let md5 = require("md5");
let salt = "asibgljg65654gfwqw3235";

//보안 기능 : sha256
let sha256 = require("sha256");

//보안 기능 : hasher
let bkpw = require("pbkdf2-password");
let hasher = bkpw();

var db;
const MongoClient = require("mongodb").MongoClient;
MongoClient.connect(
  "mongodb+srv://wjdxoals:1111@cluster0.q1ou0.mongodb.net/?retryWrites=true&w=majority",
  function (err, client) {
    if (err) return console.log(err);

    db = client.db("todo_app");

    // db.collection('post').insertOne({이름 : 'john', 나이 : 20}, function(err, result){
    //     console.log('저장완료');
    // })
  }
);

// mysql 연동

const mysql = require("mysql");

const conn = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "123456",
  database: "node_dbs",
});

conn.connect();

console.log("mysql 접속 성공!!");

app.listen(8080, function () {
  console.log("listening on 8080");
});

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
  res.render("write.ejs");
});

// /list로 GET요청을 접속, 실제 mysql에 저장된 데이터를 읽어와서 HTML을 보여줌
app.get("/list", (req, res) => {
  let sql = "select * from todo_bk";
  let list = "";

  conn.query(sql, function (err, rows, fields) {
    if (err) {
      console.log(err);
    } else {
      // for (let i = 0; i < rows.length; i++) {
      //   list += rows[i].title + " : " + rows[i].created + "<br/>";
      // }
      // res.send(list);

      res.render("list_mysql.ejs", { posts: rows });
    }
  });
});

app.post("/add", function (req, res) {
  console.log(req.body.title);
  console.log(req.body.created);

  let sql = `insert todo_bk (title, created) values(
    "${req.body.title}", "${req.body.created}"
    )`;

  conn.query(sql, function (err, rows, fields) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/list");
    }
  });
});

// 쿠키
// app.get("/count", (req, res) => {
//   if (req.cookies.count) {
//     var count = parseInt(req.cookies.count);
//   } else {
//     var count = 0;
//   }
// });

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
      res.render("detail.ejs", { data: result });
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

// /list로 GET요청을 접속, 실제 몽고DB에 저장된 데이터를 읽어와서 HTML을 보여줌
app.get("/list", (req, res) => {
  // DB 에 저장된 post라는 컬렉션에 있는 데이터 두개를 꺼내서 넘겨주자.
  db.collection("post")
    .find()
    .toArray(function (err, result) {
      console.log(result);
      res.render("list", { posts: result });
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

//세션

app.get("/count", function (req, res) {
  if (req.session.count) {
    req.session.count++;
  } else {
    req.session.count = 1;
  }

  res.send("count : " + req.session.count);
});

app.get("/temp", function (req, res) {
  res.send("result : " + req.session.userid);
});

//로그아웃
app.get("/logout", (req, res) => {
  delete req.session.count;
  res.redirect("/");
});

// 로그인 라우터
app.get("/login", (req, res) => {
  res.render("login_mysql");
});

app.post("/login", (req, res) => {
  let userid = req.body.id;
  let userpw = req.body.pw;

  console.log(userid);
  console.log(userpw);

  let sql = `select * from login`;

  conn.query(sql, function (err, rows, fields) {
    if (err) {
      return console.log(err);
    } else {
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].userid == userid) {
          return hasher(
            { password: userpw, salt: rows[i].mobile },
            function (err, pass, salt, hash) {
              console.log(pass);
              console.log(salt);
              console.log(hash);
              if (hash == rows[i].userpw) {
                req.session.userid = userid;
                res.redirect("/");
              }
            }
          );

          if (sha256(rows[i].userpw + salt) == sha256(userpw + salt)) {
            // 둘 다 해싱시켜 동일한 비번인지 확인. 보안과 일치 여부 동시 충족.
            console.log(sha256(rows[i].userpw + salt));
            console.log(sha256(userpw + salt));
            req.session.userid = userid;
            res.redirect("/");
          } else {
            res.send("비밀번호가 틀렸습니다.");
          }
        }
      }
    }
  });
});

//회원가입 라우터
app.get("/signup", (req, res) => {
  res.render("signup_mysql.ejs");
});

app.post("/signup", (req, res) => {
  console.log(req.body.id);
  console.log(req.body.pw);
  console.log(req.body.ph);
  console.log(req.body.co);

  hasher({ password: req.body.pw }, function (err, pass, salt, hash) {
    console.log(pass);
    console.log(salt);
    console.log(hash);

    let sql = `insert login (userid, userpw, mobile, country) values(
    "${req.body.id}", 
    "${hash}",
    "${salt}",
    "${req.body.co}"
    )`;

    conn.query(sql, function (err, rows, fields) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/login");
      }
    });
  });
});
