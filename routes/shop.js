var router = require("express").Router();

router.get("/pet", function (req, res) {
  res.send("펫용품을 쇼핑할 수 있는 페이지입니다.");
});

router.get("/beauty", function (req, res) {
  res.send("뷰티용품을 쇼핑할 수 있는 페이지입니다.");
});

module.exports = router;
