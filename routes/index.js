const express = require('express');

const router = express.Router();
const Story = require('../model/story');
router.get('/', require('../middleware/auth').ensureGuest, (req, res) => {
  res.render('login', {
    layout: 'login',
  });
});

router.get(
  '/dashboard',
  require('../middleware/auth').ensureAuth,
  async (req, res) => {
    console.log(req.user);
    try {
      const stories = await Story.find({ user: req.user.id }).lean();
      res.render('dashboard', {
        name: req.user.firstName,
        stories,
      });
    } catch (err) {
      console.error(err);
      res.render('error/500');
    }
  }
);

module.exports = router;
