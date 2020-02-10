const fetch = require('node-fetch');

const fetchData = async url => {
	const data = await fetch(url).then(res => res.json());
	return data;
};

const apodController = async (req, res) => {
	const apodUrl = `https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`;
	//api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=1000&api_key=DEMO_KEY

	try {
		let image = await fetchData(apodUrl);
		return res.status(200).json({ image });
	} catch (err) {
		console.log('error:', err);
		next(err);
	}
};

const roverController = async (req, res, next) => {
	const rover = req.query.rover;
	console.log(rover);
	const roverUrl = `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?sol=900&api_key=${process.env.API_KEY}`;
	try {
		let data = await fetchData(roverUrl);
		return res.status(200).json({ data });
	} catch (err) {
		console.log('error:', err);
		next(err);
	}
};

const notFoundController = (req, res, next) => {
	const err = new Error('Not Found');
	err.status = 404;
	next(err);
};

const errorController = (err, req, res, next) => {
	let error = null;
	const message = err.message;
	if (
		process.env.NODE_ENV == 'development' ||
		process.env.NODE_ENV !== 'test'
	) {
		error = err;
	}

	res.status(err.status || 500).json({ message, error });
};

module.exports = {
	apodController,
	roverController,
	errorController,
	notFoundController,
};
