var express = require("express");
var router = express.Router();
const { checkBody } = require("../modules/checkBody");

const Contents = require("../models/contents");
const User = require("../models/users");

router.post("/", (req, res) => {
  User.findOne({ token: req.body.token }).then((user) => {
      const newContent = new Contents({
        user: user._id,
        title: req.body.title,
        url: req.body.url,
        logo: req.body.logo,
        description: req.body.description,
      });

      newContent
      .save()
      .then((newDoc) => {
        res.json({ result: true, title: newDoc.title });
      });

  });
});

router.delete("/delete", (req, res) => {
  Contents.deleteOne({ title: req.body.title }).then((data) => {
    if (data) {
      res.json({ result: true, contentDeleted: data });
    } else {
      res.json({ result: false, error: "Didn't found the content to delete" });
    }
  });
});

router.get("/all", (req, res) => {
  Contents.find({})
    
    .then((data) => res.json({ allContents: data }));
});


module.exports = router;
