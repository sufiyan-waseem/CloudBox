const express = require('express');

const router = express.Router();



router.get('/home', (req, res) => {
    res.render('home');
})

router.get("/", (req, res) => {
  res.render("home"); // home.ejs render karega
});

module.exports = router;