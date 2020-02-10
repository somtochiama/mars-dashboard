require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

const appRouter = require('./route');
const { notFoundController, errorController } = require('./controller');
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/', express.static(path.join(__dirname, '../public')));

app.use('/', appRouter);
app.use(notFoundController);
app.use(errorController);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
