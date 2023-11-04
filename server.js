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

// Get Redemption History Page
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


// Update the Current Points
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

// Update promotions
app.put('/promotion/updatePromotion/:promoId', (req, res) => {
    const promoId = req.params.promoId;
    const updatedPromotion = req.body;

    const promotion = promotions.find((p) => p.promo_id === promoId);
    if (promotion) {
        promotion.promo_name = updatedPromotion.promo_name;
        promotion.promo_description = updatedPromotion.promo_description;
        promotion.expiration_date = updatedPromotion.expiration_date;
        promotion.promo_cost = updatedPromotion.promo_cost;

        // Update the promo_status here as well
        promotion.promo_status = updatedPromotion.promo_status;

        res.json({ success: true, promo_status: updatedPromotion.promo_status }); // Send back the updated status
    } else {
        console.error('Promotion not found for promoId: ' + promoId);
        res.status(404).json({ error: 'Promotion not found' });
    }
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
