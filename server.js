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
            
    axios.get(`http://127.0.0.1:5000/allpromos`)
    .then((rewardresponse) => {
    var promotions = rewardresponse.data;
    res.render('promotion', { promotions:promotions});
    });
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
    axios.get(`http://127.0.0.1:5000/allreviews`)
    .then((rewardresponse) => {
    var reviews = rewardresponse.data;
    res.render('reviews', { reviews:reviews});
    });
});

app.get('/delete-reviews', (req, res) => {
    res.render('delete-reviews');
});

app.get('/customer-information', (req, res) => {
    axios.get(`http://127.0.0.1:5000/customerinfo`)
    .then((rewardresponse) => {
     var customers = rewardresponse.data;
     res.render('customer-information', { customers:customers});
     });
});

app.put('/reward/updateCurrentPoints/:phoneNumber', (req, res) => {
    const phoneNumber = req.params.phoneNumber;
    const newPoints = req.body.newPoints;

    // Find and update the customer in the 'customers' array
    const customer = customers.find((c) => c.phoneNumber === phoneNumber);
    if (customer) {
        customer.currentPoints = newPoints;
        res.json({ success: true });
    } else {
        console.error('Customer not found for phone number: ' + phoneNumber);
        res.status(404).json({ error: 'Customer not found' });
    }
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
