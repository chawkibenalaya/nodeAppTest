const express = require('express');
const router = express.Router();
const Joi = require('joi');

const courses = [
  { id: 1, name: 'kalila w demna' },
  { id: 2, name: 'hakika ghayba' },
  { id: 3, name: 'game of thrones' }
];
router.get('/:id', (req, res) => {
  const course = courses.find(c => c.id == req.params.id);
  if (!course) {
    res.status(404).send('the courses with the given id does not found');
  } else {
    res.send(course);
  }
});
router.post('/', (req, res) => {
  const schema = {
    name: Joi.string()
      .min(3)
      .required()
  };
  const result = Joi.validate(req.body, schema);
  console.log(result);
  if (result.error) {
    res.status(400).send(result.error.message);
  } else {
    res.status(201).send(result);
  }
  const course = {
    id: courses.length + 1,
    name: req.body.name
  };
  courses.push(course);
  console.log(courses);
});

module.exports = router;
