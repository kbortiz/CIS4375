const express = require('express');
const app = express();
const port = 3000;
const { body, validationResult } = require('express-validator');
const session = require('express-session');
const ejs = require('ejs');
const axios = require('axios');
const { response } = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const users = [{ username: 'user', password: 'password' }];

passport.use(new LocalStrategy(
    (username, password, done) => {
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            return done(null, user);
        }
        return done(null, false, { message: 'Incorrect username or password' });
    }
));

passport.serializeUser((user, done) => {
    done(null, user.username);
});

passport.deserializeUser((username, done) => {
    const user = users.find(u => u.username === username);
    if (user) {
        done(null, user);
    } else {
        done(null, false);
    }
});



app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
}));



app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.static(__dirname));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use(passport.initialize());
app.use(passport.session());

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

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next(); // User is authenticated, proceed
    }
    res.redirect('/login'); // User is not authenticated, redirect to login page
}


// Define a middleware to set the currentUrl for all routes
app.use((req, res, next) => {
    res.locals.currentUrl = req.originalUrl;
    next();
});


app.get('/', (req, res) => {
    const menuItems = [
        { url: '/', label: 'Check-In', icon: 'fas fa-home' },
        { url: '/reward', label: 'Reward', icon: 'fas fa-gift' },
        { url: '/reviews', label: 'Reviews', icon: 'fas fa-quote-right' },
        { url: '/login', label: 'Log-In', icon: 'fas fa-user' }
    ];
    res.render('check-in', { authenticated: req.isAuthenticated() });
});



app.get('/login', (req, res) => {
    res.render('login');
  });
  

app.post('/login', passport.authenticate('local', {
    successRedirect: '/reward', // Redirect upon successful login
    failureRedirect: '/login',  // Redirect upon failed login
    failureFlash: true          // Enable flash messages for failed authentication
}));
  



app.post('/check-in', (req, res) => {
    const phoneNumber = req.body.phoneNumber;

    // Check if the phone number exists in the customers database
    const customer = customers.find((c) => c.phoneNumber === phoneNumber);

    if (customer) {
        // Phone number exists, redirect to checkedin.ejs
        res.render('checkedin', { customer });
    } else {
        // Phone number doesn't exist, show a new form to collect first and last name
        res.render('newcheckin', { phoneNumber });
    }
});

app.get('/newcheckin', (req, res) => {
    const menuItems = [
        { url: '/', label: 'Check-In', icon: 'fas fa-home' },
        { url: '/reward', label: 'Reward', icon: 'fas fa-gift' },
        { url: '/reviews', label: 'Reviews', icon: 'fas fa-quote-right' },
        { url: '/login', label: 'Log-In', icon: 'fas fa-user' }
    ];

    const currentUrl = '/newcheckin';

    const phoneNumber = '';

    res.render('newcheckin', { menuItems, currentUrl, phoneNumber });
});

app.get('/checkedin', (req, res) => {
    const menuItems = [
        { url: '/', label: 'Check-In', icon: 'fas fa-home' },
        { url: '/reward', label: 'Reward', icon: 'fas fa-gift' },
        { url: '/reviews', label: 'Reviews', icon: 'fas fa-quote-right' },
        { url: '/login', label: 'Log-In', icon: 'fas fa-user' }
    ];

    const currentUrl = '/checkedin'; // Replace with the current URL if needed

    res.render('checkedin', { menuItems, currentUrl });
});


// Handle the form submission for new customer registration
app.post('/register-customer', (req, res) => {
    const phoneNumber = req.body.phoneNumber;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;

    // Save the new customer to the customers database
    customers.push({ phoneNumber, firstName, lastName });

    // Define customerName
    const customerName = `${firstName} ${lastName}`;

    // You can set the initial value of currentPoints here or fetch it from your database.
    const currentPoints = 0; // Change this to the appropriate initial value

    // Redirect to checkedin.ejs and pass customerName and currentPoints
    res.render('checkedin', { customerName, currentPoints });
});



app.post('/rate-visit', (req, res) => {
    const { rating, comment } = req.body;

    res.render('thank-you'); // to render a page asking for a review
});




app.get('/reward', isLoggedIn, (req, res) => {
    const currentPage = 1; // Set the current page here
    const totalItems = customers.length;
    const itemsPerPage = 25; // Define itemsPerPage
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    res.render('reward', { customers, currentPage, totalPages, itemsPerPage }); // Pass itemsPerPage to the view
});


app.get('/promotion', isLoggedIn, (req, res) => {
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
app.get('/redemption-history', isLoggedIn, (req, res) => {
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
  


app.get('/customer-information', (req, res) => {
    axios.get('http://127.0.0.1:5000/customerinfo', {
        withCredentials: true  // Include cookies for authentication
    })
    .then((rewardresponse) => {
    var customers = rewardresponse.data;
    res.render('customer-information', { customers:customers});
    })
    .catch((error) => {
        console.error('Axios error:', error);
        // Handle the error, e.g., by displaying an error message to the user
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
