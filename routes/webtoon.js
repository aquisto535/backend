var router = require("express").Router();

router.use("/drama", islogin);

router.get("/drama", (req, res) => {
  res.send("웹툰의 드라마 페이지입니다");
});

router.get("/action", (req, res) => {
  res.send("웹툰의 액션 페이지입니다");
});

function islogin(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.send("로그인해주세요");
  }
}

module.exports = router;
