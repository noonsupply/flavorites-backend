var express = require("express");
var router = express.Router();
const { checkBody } = require("../modules/checkBody");

const Contents = require("../models/contents");

router.post("/", (req, res) => {
  if (!checkBody(req.body, ["title", "url"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  Contents.findOne({ title: req.body.title }).then((data) => {
    if (data === null) {
      const newContent = new Contents({
        title: req.body.title,
        url: req.body.url,
        logo: req.body.logo,
        description: req.body.description,
      });

      newContent.save().then((newDoc) => {
        res.json({ result: true, title: newDoc.title });
      });
    } else {
      res.json({ result: false, error: "Content already exists" });
    }
  });
});

router.delete("/delete", (req, res) => {
  Contents.deleteOne({ contentname: req.body.title }).then((data) => {
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
