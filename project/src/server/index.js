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
// your API calls

// example API call
// app.get('/apod', async (req, res) => {
// 	try {
// 		let image = await fetch(
// 			`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`,
// 		).then(res => res.json());
// 		res.send({ image });
// 	} catch (err) {
// 		console.log('error:', err);
// 	}
// });

app.use(notFoundController);
app.use(errorController);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
