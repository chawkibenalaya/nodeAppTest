const config = require('config');
const express = require('express');
const app = express();
const helmet = require('helmet');
const morgan = require('morgan');
const courses = require('./routes/courses');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(helmet());
app.use('/api/courses', courses);
console.log('Application Name : ' + config.get('name'));
console.log('Mail Server : ' + config.get('mail.host'));
console.log('Mail Password : ' + config.get('mail.password'));

if (app.get('env') === 'development') {
  app.use(morgan('tiny'));
  console.log('Morgan Enabled...');
}
app.get('/', (req, res) => {
  res.send('hello chawki');
});
const port = process.env.PORT || 3010;
app.listen(3010, () => console.log(`Listening on port ${port}...`));
