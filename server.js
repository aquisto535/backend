const express = require("express");
const app = express();

//소켓 세팅

const http = require("http").createServer(app);
const { Server } = require("socket.io");
const io = new Server(http);

require("dotenv").config();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
const methodOverride = require("method-override");

app.use("/public", express.static("public"));
app.use(methodOverride("_method"));
// const session = require("express-session"); //세션 정보 이용하기 위한 패키지.
// const FileStore = require("session-file-store");

// app.use(
//   session({
//     secret: "secret key",
//     resave: false,
//     saveUninitialized: true,
//     store: new FileStore(),
//   })
// );

// 패스포트
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

//세션
const session = require("express-session");
app.use(
  session({
    secret: "1111",
    resave: false,
    saveUninitialized: true,
  })
);

//패스포트 미들웨어 설정
app.use(passport.initialize());
app.use(passport.session());

//라우터 미들웨어 설정
app.use("/webtoon", require("./routes/webtoon.js"));
app.use("/", require("./routes/shop.js"));
app.use("/", require("./routes/list.js"));

var db;
const MongoClient = require("mongodb").MongoClient;
MongoClient.connect(process.env.DB_URL, function (err, client) {
  if (err) return console.log(err);

  db = client.db("todo_app");
  app.db = db;
});

http.listen(process.env.PORT, function () {
  console.log("listening on 8080");
});

app.get("/", function (req, res) {
  res.render("index");
});

app.get("/write", (req, res) => {
  res.render("write");
});

//시맨틱 url
app.get("/detail/:id", (req, res) => {
  console.log("상세페이지 : ", req.params.id);
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
  console.log(req.params.id);

  db.collection("post").findOne(
    { _id: parseInt(req.params.id) },
    function (err, result) {
      if (err) return console.log(err);
      console.log(result);
      res.render("edit.ejs", { post: result });
    }
  );
});

app.put("/edit", function (req, res) {
  //폼에 담긴 todo 데이터, date 데이터를 가지고 db.collection(post)를 업데이트 시킴
  console.log("업데이트가 됩니다.");
  db.collection("post").updateOne(
    { _id: parseInt(req.body.id) },
    { $set: { todo: req.body.title, date: req.body.date } },
    function (err, result) {
      if (err) return console.log(err);
      console.log("수정 완료");
      res.redirect("/list");
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
  res.send("count :" + req.session.count);
});

app.get("/temp", function (req, res) {
  res.send("result : " + req.session.count);
});

//회원가입 라우터 만들기. mysql로 만든 버전 있음.
app.get("/signup", (req, res) => {
  res.render("signup.ejs");
});

app.post("/signup", (req, res) => {
  console.log(req.body.id);
  console.log(req.body.pw);
  console.log(req.body.ph);
  console.log(req.body.co);

  db.collection("login").insertOne(
    {
      id: req.body.id,
      pw: req.body.pw,
      phone: req.body.ph,
      country: req.body.co,
    },
    (err, result) => {
      if (err) return console.log(err);
      console.log("수정 완료");
      res.redirect("/login");
    }
  );
});

app.get("/login", (req, res) => {
  res.render("login");
});

// app.post("/login", (req, res) => {
//   let userid = req.body.id;
//   let userpw = req.body.pw;

//   console.log(userid);
//   console.log(userpw);

//   db.collection("login").findOne({ id: userid }, function (err, result) {
//     if (err) return console.log(err);
//     if (!result) {
//       res.send("존재하지 않는 아이디입니다.");
//     } else {
//       console.log(result);
//       if (result.pw == userpw) {
//          res.send('로그인 되었습니다.');
//         res.redirect("/");
//       } else {
//         res.redirect("/login");
//       }
//     }
//   });
// });

//패스포트를 이용한 인증 방식
app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/fail",
  }),
  (req, res) => {
    res.redirect("/");
  }
);

passport.use(
  new LocalStrategy(
    {
      usernameField: "id",
      passwordField: "pw",
      session: true,
      passReqToCallback: false,
    },
    function (inputid, inputpw, done) {
      console.log(inputid);
      console.log(inputpw);

      db.collection("login").findOne(
        { id: inputid },
        { pw: inputpw },
        function (err, result) {
          if (err) return done(err);
          if (!result) {
            return done(null, false, {
              message: "존재하지 않는 아이디입니다.",
            });
          }
          if (result.pw == inputpw) {
            return done(null, result);
          } else {
            return done(null, false, { message: "비밀번호가 틀렸습니다" });
          }
        }
      );
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (userid, done) {
  db.collection("login").findOne({ id: userid }, function (err, result) {
    done(null, result);
    console.log(result);
  });
});

app.get("/fail", (req, res) => {
  res.send("로그인해주세요");
});

app.get("/mypage", islogin, (req, res) => {
  res.render("mypage.ejs", { 사용자: req.user });
});

function islogin(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.send("로그인해주세요");
  }
}

app.get("/search", (req, res) => {
  console.log(req.query.value);
  // 일반적인 순차검색
  // db.collection("post")
  //   .find({ todo: req.query.value })
  //   .toArray((err, result) => {
  //     console.log(result);
  //     res.render("search.ejs", { posts: result });
  //   });

  //바이너리 검색
  db.collection("post")
    .find({ $text: { $search: req.query.value } }) //컬렉션 안에 todo로만 새로운 index를 생성한 후 그 index에 맞는 포맷으로 검색.
    .toArray((err, result) => {
      console.log(result);
      res.render("search.ejs", { posts: result });
    });
});

app.post("/add", function (req, res) {
  res.redirect("/list"); // 앞에서 res.send, res.redirect 등을 사용하면 뒤에서는 사용하지 못한다!! 오류 : "Cannot set headers after they are sent to the client"
  console.log(req.body.title);
  console.log(req.body.date);

  //어떤 사람이 /add라는 경로로 post 요청을 하면
  // 데이터 2개를 보내주는데 post라는 컬렉션에 두 개의 데이터를 저장한다.
  db.collection("counter").findOne({ name: "postcnt" }, function (err, result) {
    var totalcount = result.totalPost;

    db.collection("post").insertOne(
      {
        _id: totalcount + 1,
        writer: req.user._id,
        todo: req.body.title,
        date: req.body.date,
      },
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

//프로그램의 진행순서대로 코드 배치! 이 경우엔 로그인 후 글 쓰고 삭제.
app.delete("/delete", function (req, res) {
  console.log(req.body);
  req.body._id = parseInt(req.body._id);

  let deleteData = { _id: req.body._id, writer: req.user._id };

  db.collection("post").deleteOne(deleteData, function (err, result) {
    if (err) return console.log(err);
    console.log("삭제완료");
    console.log(result.deleteCount);
    res.status(200).send({ message: "성공했습니다." });
  });
});

// multer 설정
let multer = require("multer");
//const { Server } = require("http");
let storage = multer.diskStorage({
  destination: function (req, res, cb) {
    cb(null, "./public/image");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

let upload = multer({ storage: storage });

app.get("/upload", function (req, res) {
  res.render("upload.ejs");
});

app.post("/upload", upload.single("profile"), function (req, res) {
  res.send("업로드 완료");
});

app.get("/image/:imgname", function (req, res) {
  res.sendFile(__dirname + "/public/image/" + req.params.imgname);
});

//socket

app.get("/socket", function (req, res) {
  res.render("socket.ejs");
});

//서버 수신부(socket.ejs 요청에 응답)
io.on("connection", function (socket) {
  console.log("유저 접속됨");

  socket.on("room1-send", function (data) {
    io.to("room1").emit("broadcast", data);
  });

  socket.on("joinroom", function (data) {
    console.log(data);

    socket.join("room1");
  });

  socket.on("user-send", function (data) {
    console.log(data);
    //io.emit("broadcast", data); //에코 서버(서버 테스트 시 사용, 다수 동시 통신 중)
    io.to(socket.id).emit("broadcast", data); //클라이언트들이 따로 따로 서버와 교신
  });
});
