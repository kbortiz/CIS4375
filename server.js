const express = require('express');
const app = express();
const port = 3000;
const { body, validationResult } = require('express-validator');
const session = require('express-session');
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

app.use(session({
    secret: 'secretkey',
    resave: true,
    saveUninitialized: true,
  }));

app.get('/', (req, res) => {
    res.render('check-in');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/checkedin', (req, res) => {

    axios.get(`http://127.0.0.1:5000/checkedin`,{
     withCredentials: true  // Include cookies for authentication
 })
    .then((rewardresponse) => {
     var customers = rewardresponse.data;
     res.render('checkedin', { customers:customers});
     })
     .catch((error) => {
         console.error('Axios error:', error);
         // Handle the error, e.g., by displaying an error message to the user
     });
 });

 app.get('/newcheckin', (req, res) => {
    axios.get(`http://127.0.0.1:5000/newcheckin`,{
     withCredentials: true  // Include cookies for authentication
 })
    .then((rewardresponse) => {
     var customers = rewardresponse.data;
     res.render('newcheckin', { customers:customers});
     })
     .catch((error) => {
         console.error('Axios error:', error);
         // Handle the error, e.g., by displaying an error message to the user
     });
});

app.get('/thankyou', (req, res) => {
    res.render('thank-you');
});

app.post('/login', [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('login', { errors: errors.array() });
    }
  
    const { username, password } = req.body;
  
    if (username === 'user' && password === 'password') {
      req.session.authenticated = true;
      res.redirect('/reward');
    } else {
      return res.render('login', { error: 'Invalid username or password' });
    }
});

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

    res.render('thank-you'); // You should create a "thank-you.ejs" template
});

app.get('/reward', (req, res) => {

   axios.get(`http://127.0.0.1:5000/customerpoints`,{
    withCredentials: true  // Include cookies for authentication
})
   .then((rewardresponse) => {
    var customers = rewardresponse.data;
    res.render('reward', { customers:customers});
    })
    .catch((error) => {
        console.error('Axios error:', error);
        // Handle the error, e.g., by displaying an error message to the user
    });
});

app.get('/promotion', (req, res) => {
            
    axios.get(`http://127.0.0.1:5000/allpromos`)
    .then((rewardresponse) => {
    var promotions = rewardresponse.data;
    res.render('promotion', { promotions:promotions});
    })
    .catch((error) => {
        console.error('Axios error:', error);
        // Handle the error, e.g., by displaying an error message to the user
    });
});

// Get Redemption History Page
app.get('/redemption-history', (req, res) => {
    axios.get(`http://127.0.0.1:5000/redemptionhistory`)
    .then((response) => {
    var customers = response.data;
    res.render('redemption-history', { customers:customers});
    })
    .catch((error) => {
        console.error('Axios error:', error);
        // Handle the error, e.g., by displaying an error message to the user
    });
});


app.get('/reviews', (req, res) => {
    axios.get(`http://127.0.0.1:5000/allreviews`)
    .then((rewardresponse) => {
    var reviews = rewardresponse.data;
    const averageRating = calculateAverageRating(reviews);
    res.render('reviews', { reviews:reviews, averageRating});
    })
    .catch((error) => {
        console.error('Axios error:', error);
        // Handle the error, e.g., by displaying an error message to the user
    });
});

app.get('/delete-reviews', (req, res) => {
    axios.get(`http://127.0.0.1:5000/allreviews`)
    .then((rewardresponse) => {
    var reviews = rewardresponse.data;
    const averageRating = calculateAverageRating(reviews);
    res.render('delete-reviews', { reviews:reviews, averageRating});
    })
    .catch((error) => {
        console.error('Axios error:', error);
        // Handle the error, e.g., by displaying an error message to the user
    });
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

function calculateAverageRating(reviews) {
    if (reviews.length === 0) {
        return 0; // If there are no reviews, return 0 as the average rating
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rev_rating, 0);
    const averageRating = totalRating / reviews.length;
    return averageRating.toFixed(2); // Round the average to two decimal places
}

// Custom middleware to check user authentication
function isAuthenticated(req, res, next) {
    if (req.session.logged_in) {
        // User is authenticated, allow access to the route
        next();
    } else {
        // User is not authenticated, redirect to the login page or return an error
        res.redirect('/login'); // You can specify your login route
    }
}

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
