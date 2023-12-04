const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

// listen to a specific route with app.use
app.use('/login', (req, res) => {
	res.send({
		token: 'test123'
	});
});

// run the server on port 8080 using app.listen
app.listen(8080, () => console.log('API is running on http://localhost:8080/login'));