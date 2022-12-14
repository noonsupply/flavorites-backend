var express = require("express");
var router = express.Router();

const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");

router.post("/signup", (req, res) => {
  if (!checkBody(req.body, ["username", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  User.findOne({ username: req.body.username }).then((data) => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
        user: req.body.user,
        username: req.body.username,
        password: hash,
        token: uid2(32),
        profilImg: req.body.profilImg,
        contents : []
      });

      newUser.save().then((newDoc) => {
        res.json({ result: true, token: newDoc.token });
      });
    } else {
      res.json({ result: false, error: "User already exists" });
    }
  });
});

router.post("/signin", (req, res) => {
  if (!checkBody(req.body, ["username", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  User.findOne({ username: req.body.username }).then((data) => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({
        result: true,
        token: data.token,
        user: data.user,
        profilImg: data.profilImg,
      });
    } else {
      res.json({ result: false, error: "User not found or wrong password" });
    }
  });
});

router.put("/profilUpdate", (req, res) => {
  User.findOneAndUpdate(
    { username: req.body.username },
    { profilImg: req.body.profilImg, user: req.body.newUser }
  ).then((data) => {
    res.json({ result: true, user: data });
  });
});

router.post("/userData", (req, res) => {
  User.findOne({ username: req.body.username }).then((data) => {
    res.json({ result: true, user: data });
  });
});

/* router.post("/", (req, res) => {
  User.updateOne({ token: req.body.token },
  {
    $push: {
      contents: req.body.contents,
    },
  })
  
  .then((user) => {
      const newContent = new contents({
        user: user._id,
        title: req.body.title,
        url: req.body.url,
        logo: req.body.logo,
        description: req.body.description,
      });

      contents
      .save()
      .then((newDoc) => {
        res.json({ result: true, title: newDoc.title });
        res.send({ _id: req.query.contentsID });
      });
  });
}); */

router.post("/", (req, res) => {
  User.updateOne({ token: req.body.token },
  {
    $push: {
      contents: req.body.contents,
    },
  })
  .then((user) => {
      const newContent = new Contents({
        user: user._id,
        title: req.body.title,
        url: req.body.url,
        logo: req.body.logo,
        description: req.body.description,
      });

      contents
      .save()
      .then((newDoc) => {
        res.json({ result: true, title: newDoc.title });
        res.send({ _id: req.query.contentsID });
      })
      .catch((error) => {
        console.error(error);
        res.json({ result: false, error: error.message });
      });
  })
  .catch((error) => {
    console.error(error);
    res.json({ result: false, error: error.message });
  });
});


router.delete("/deleteContent", (req, res) => {

User.updateOne(
  { username: req.body.username }, // filter to find the right document
  { $pull: { contents: { title: req.body.title } } }, // update using the $pull operator to remove the subdocument
  function(error, result) {
    if (error) {
      console.log(error);
    } else {
      console.log(result);
    }
  }
);
})

router.post("/all", function (req, res, next) {
  User.find({username : req.body.username}).then((data) => res.json({ result: true, users: data }));
})

/* router.post("/updateContents", function (req, res, next) {
    
    User.findOneAndUpdate(
      { username: req.body.username }, // filter to find the right document
      { $push: { contents: { title: req.body.title, url: req.body.url, description: req.body.description } } }, // update using the $pull operator to remove the subdocument
      function(error, result) {
        if (error) {
          console.log(error);
        } else {
          console.log(result);
        }
      }
    );
  }); */

  router.post("/updateContents", function (req, res, next) {
    //console.log("tentative r??cup??ration contentesID",req.body.contentsID)
    User.updateOne(
      { "contents._id": req.body.contentsID },
      { $set: { "contents.$.title": req.body.title, "contents.$.url": req.body.url, "contents.$.description": req.body.description } }
    )
      .then(result => console.log(result))
      .catch(error => console.log(error));
  })

module.exports = router;