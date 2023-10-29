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
    const promotions = [
        {
            promo_id: '1',
            promo_name: 'BOGO 50%',
            promo_description: 'Buy one Mani/Pedi get another 50% off',
            expiration_date: '10/10/2023',
            promo_status: 'INACTIVE',
            promo_cost: '10'
        },
        {
            promo_id: '2',
            promo_name: '10% Off',
            promo_description: '10% off one appointment',
            expiration_date: '10/20/2023',
            promo_status: 'INACTIVE',
            promo_cost: '5'
        },
        {
            promo_id: '3',
            promo_name: '20% Off',
            promo_description: '20% off one appointment',
            expiration_date: '10/30/2023',
            promo_status: 'ACTIVE',
            promo_cost: '10'
        },]
    res.render('promotion',{ promotions });
});

app.get('/redemption-history', (req, res) => {
    const customers = [
        {
            firstName: 'Peter',
            lastName: 'Parks',
            phoneNumber: '8321121113',
            redemptionDate: '10/10/2023',
            promo_name: '10% Off',
            pointsUsed: 5,
            currentPoints: 5
        },
        {
            firstName: 'Kim',
            lastName: 'Luong',
            phoneNumber: '2819127693',
            redemptionDate: '10/20/2023',
            promo_name: 'BOGO 50%',
            pointsUsed: 10,
            currentPoints: 50
        },
        {
            firstName: 'Willy',
            lastName: 'Lanka',
            phoneNumber: '2819225555',
            redemptionDate: '10/2/2023',
            promo_name: '20% Off',
            pointsUsed: 10,
            currentPoints: 4
        },
    ];
    res.render('redemption-history', { customers });
});

app.get('/reviews', (req, res) => {
    res.render('reviews');
});

app.get('/delete-reviews', (req, res) => {
    res.render('delete-reviews');
});

app.get('/customer-information', (req, res) => {
    const customers = [
        {
            firstName: 'Peter',
            lastName: 'Parks',
            phoneNumber: '8321121113',
            emailAddress: 'peterpark@gmail.com',
            birthday: '1/1/2000',
            lastVisit: '10/10/2023'
        },
        {
            firstName: 'Kim',
            lastName: 'Luong',
            phoneNumber: '2819127693',
            emailAddress: 'kimluong@gmail.com',
            birthday: '2/14/1999',
            lastVisit: '10/20/2023'
        },
        {
            firstName: 'Willy',
            lastName: 'Lanka',
            phoneNumber: '2819225555',
            emailAddress: 'willylanka@gmail.com',
            birthday: '7/22/2002',
            lastVisit: '10/2/2023'
        },
    ];
    res.render('customer-information', { customers });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
