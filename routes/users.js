var express = require("express");
var router = express.Router();

const User = require("../models/users");
const { checkBody } = require("../modules/checkBody");
const uid2 = require("uid2");
const bcrypt = require("bcrypt");

router.post("/signup", (req, res) => {
  if (!checkBody(req.body, ["username", "password", "email"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  User.findOne({ email: req.body.email }).then((data) => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
        email: req.body.email,
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
  if (!checkBody(req.body, ["email", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" });
    return;
  }

  User.findOne({ email: req.body.email }).then((data) => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({
        result: true,
        token: data.token,
        username: data.username,
        profilImg: data.profilImg,
      }
      )
      
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

router.post("/add", (req, res) => {
  User.updateOne({ token: req.body.token },
  {
    $push: {
      contents: 
        req.body.contents
    },
  })
  .then((user) => {
    if (!user) {
      return res.status(404).json({ result: false, error: 'User not found' });
    }
    user.save()
      .then((savedUser) => {
        res.json({ result: true, title: savedUser.contents[savedUser.contents.length - 1].title });
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
        return res.status(500).send(error);
    }
    if(result.nModified === 1) {
      return res.status(200).send({ message: "Content deleted successfully" });
    } else {
      return res.status(401).send({ message: "Error while deleting content" });
    }
}
);
})

//récupère toutes les data d'un user
router.post("/all", function (req, res, next) {
  User.find({username : req.body.username}).then((data) => res.json({ result: true, users: data }));
})

  router.post("/updateContents", function (req, res, next) {
    //console.log("tentative récupération contentesID",req.body.contentsID)
    User.updateOne(
      { "contents._id": req.body.contentsID },
      { $set: { "contents.$.title": req.body.title, "contents.$.url": req.body.url, "contents.$.tags": req.body.tags } }
    )
      .then(result => console.log(result))
      .catch(error => console.log(error));
  })

  router.post('/addTags', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username }); // trouver l'utilisateur Nooman
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur introuvable.' });
        }
        const tags = user.contents.flatMap(content => content.tags); // prendre uniquement les tags de l'utilisateur Nooman
        const uniqueTags = [...new Set(tags)];
        res.json(uniqueTags);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});


/* router.get('/myTags', async (req, res) => {
  try {
    const { username } = req.body;
const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }
    const tags = user.contents.reduce((acc, content) => [...acc, ...content.tags], []);
    res.json({ tags });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
}); */


//route pour supprimer un tag
router.delete('/deleteTag', async (req, res) => {
  const { username, contentsID, tag } = req.body;

  try {
    // Find the user with the given username and content with the given ID
    const user = await User.findOne({ username });
    const content = user.contents.id(contentsID);

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Remove the specified tag from the content's tags array
    content.tags = content.tags.filter(t => t !== tag);

    // Update the user's contents in the database
    await user.save();

    res.json({ message: 'Tag removed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

/* //route pour supprimer un tag
router.delete('/deleteTag', async (req, res) => {
  const { username, contentsID, tag } = req.body;

  try {
    // Find the user with the given username and content with the given ID
    const user = await User.findOne({ username });
    const content = user.contents.id(contentsID);

    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    // Remove the specified tag from the content's tags array
    content.tags = content.tags.filter(t => t !== tag);

    // Update the user's contents in the database
    await user.save();

    res.json({ message: 'Tag removed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}); */

module.exports = router;