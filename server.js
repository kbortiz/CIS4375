const express = require('express');
const app = express();
const port = 3000;

const axios = require('axios');
const { response } = require('express');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.static(__dirname));

// Define a middleware to set the currentUrl for all routes
app.use((req, res, next) => {
    res.locals.currentUrl = req.originalUrl;
    next();
});

app.get('/', (req, res) => {
    res.render('check-in');
});

app.get('/reward', (req, res) => {

   axios.get(`http://127.0.0.1:5000/customerpoints`)
   .then((rewardresponse) => {
    var customers = rewardresponse.data;
    res.render('reward', { customers:customers});
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
