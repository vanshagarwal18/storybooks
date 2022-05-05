const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const Story = require('../model/story');

router.get('/', ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ status: 'public' })
      .populate('user')
      .sort({ createdAt: 'desc' })
      .lean();
    res.render('stories/index', {
      stories,
    });
  } catch (err) {
    res.render('error/500');
  }
});
router.get('/add', ensureAuth, async (req, res) => {
  console.log(req.url);
  res.render('stories/add');
});
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).populate('user').lean();
    if (!story) {
      res.render('error/404');
    }
    res.render('stories/show', {
      story,
    });
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const stories = await Story.find({
      user: req.params.userId,
      status: 'public',
    })
      .populate('user')
      .lean();
    res.render('stories/index', {
      stories,
    });
  } catch (err) {
    console.log(err);
    res.render('error/500');
  }
});
router.get('/edit/:id', ensureAuth, async (req, res) => {
  const story = await Story.findById(req.params.id).lean();
  if (!story) {
    res.render('error/404');
  }
  if (story.user != req.user.id) {
    res.redirect('/stories');
  }
  res.render('stories/edit', {
    story: JSON.stringify(story),
    story,
  });
});

router.post('/', async (req, res) => {
  try {
    req.body.user = req.user.id;
    await Story.create(req.body);
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('error/500');
  }
});
router.put('/:id', async (req, res) => {
  try {
    let story = await Story.findById(req.params.id);
    if (!story) {
      res.render('error/404');
    }
    if (story.user != req.user.id) {
      res.redirect('/stories');
    } else {
      story = await Story.findOneAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      //   await story.save();
      res.redirect('/dashboard');
    }
  } catch (err) {
    console.error(err);
    return res.render('error/500');
  }
});
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    await Story.findByIdAndDelete(req.params.id);
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    return res.render('error/500');
  }
});
module.exports = router;
