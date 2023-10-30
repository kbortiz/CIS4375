const express = require('express');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.static(__dirname));

app.use(express.json());

const customers = [
    {
        firstName: 'Peter',
        lastName: 'Parks',
        phoneNumber: '8321121113',
        lastVisit: '10/10/2023',
        currentPoints: 3,
        lifetimePoints: 5
    },
    {
        firstName: 'Kim',
        lastName: 'Luong',
        phoneNumber: '2819127693',
        lastVisit: '10/20/2023',
        currentPoints: 10,
        lifetimePoints: 50
    },
    {
        firstName: 'Willy',
        lastName: 'Lanka',
        phoneNumber: '2819225555',
        lastVisit: '10/2/2023',
        currentPoints: 4,
        lifetimePoints: 4
    },
];



// Define a middleware to set the currentUrl for all routes
app.use((req, res, next) => {
    res.locals.currentUrl = req.originalUrl;
    next();
});


app.get('/', (req, res) => {
    res.render('check-in');
});


app.get('/reward', (req, res) => {
    res.render('reward', { customers });
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
