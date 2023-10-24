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

app.get('/promotion', (req, res) => {
    res.render('promotion');
});

app.get('/redemption-history', (req, res) => {
    const customers = [
        {
            firstName: 'Peter',
            lastName: 'Parks',
            phoneNumber: '8321121113',
            redemptionDate: '10/10/2023',
            pointsUsed: 3,
            currentPoints: 5
        },
        {
            firstName: 'Kim',
            lastName: 'Luong',
            phoneNumber: '2819127693',
            redemptionDate: '10/20/2023',
            pointsUsed: 10,
            currentPoints: 50
        },
        {
            firstName: 'Willy',
            lastName: 'Lanka',
            phoneNumber: '2819225555',
            redemptionDate: '10/2/2023',
            pointsUsed: 4,
            currentPoints: 4
        },
    ];
    res.render('redemption-history', { customers });
});




app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
