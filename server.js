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

let nextPromoId = (promotions.length + 1).toString(); // Track the next available promotion ID


// Define a middleware to set the currentUrl for all routes
app.use((req, res, next) => {
    res.locals.currentUrl = req.originalUrl;
    next();
});


app.get('/', (req, res) => {
    res.render('check-in');
});


app.get('/reward', (req, res) => {
    const currentPage = 1; // Set the current page here
    const totalItems = customers.length;
    const itemsPerPage = 25; // Define itemsPerPage
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    res.render('reward', { customers, currentPage, totalPages, itemsPerPage }); // Pass itemsPerPage to the view
});


app.get('/promotion', (req, res) => {
    res.render('promotion',{ promotions });
});


// Add a new promotion
app.post('/promotion', (req, res) => {
    // Extract promotion data from the request body
    const { promotionName, promotionDescription, expirationDate, status, pointsCost } = req.body;

    // Create a new promotion object
    const newPromotion = {
        promo_id: nextPromoId,
        promo_name: promotionName,
        promo_description: promotionDescription,
        expiration_date: expirationDate,
        promo_status: status,
        promo_cost: pointsCost,
    };

    // Add the new promotion to the promotions array
    promotions.push(newPromotion);

    // Increment the next promotion ID
    nextPromoId = (parseInt(nextPromoId) + 1).toString();

    // Return a success response or handle errors as needed
    res.json({ success: true, promo_id: newPromotion.promo_id });
});

// Get the next promotion ID in the sequence
app.get('/getNextPromoID', (req, res) => {
    res.json({ nextPromoID: nextPromoId });
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
