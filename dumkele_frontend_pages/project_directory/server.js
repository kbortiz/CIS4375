const express = require('express');
const session = require('express-session');
const { body, validationResult } = require('express-validator');
const ejs = require('ejs');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('customers.db');

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS customers (id INTEGER PRIMARY KEY AUTOINCREMENT, phone TEXT, birthday TEXT)");
});

db.close();




const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: false }));
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.static(__dirname));

// Define a middleware to set the currentUrl for all routes
app.use((req, res, next) => {
    res.locals.currentUrl = req.originalUrl;
    next();
    });

app.get('/', (req, res) => {
    res.render('checkin', { isNewCustomer: req.session.isNewCustomer });
    });

app.post('/checkin', [
    body('phone').notEmpty().withMessage('Phone number is required'),
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('checkin', { isNewCustomer: req.session.isNewCustomer, errors: errors.array() });
    }
  
    const phone = req.body.phone;
  
    db.get('SELECT * FROM customers WHERE phone = ?', phone, (err, row) => {
      if (err) {
        return res.render('checkin', { isNewCustomer: req.session.isNewCustomer, error: 'An error occurred' });
      }
  
      if (row) {
        // Customer exists in the database
        req.session.isNewCustomer = false;
        res.redirect('/checkedin');
      } else {
        // Customer is new; prompt for their birthday
        req.session.isNewCustomer = true;
        res.redirect('/birthday');
      }
    });
    });


  
app.get('/birthday', (req, res) => {
    if (req.session.isNewCustomer) {
      res.render('birthday');
    } else {
      res.redirect('/');
    }
    });


app.post('/birthday', [
    body('birthday').notEmpty().withMessage('Birthday is required'),
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('birthday', { errors: errors.array() });
    }
  
    const birthday = req.body.birthday;
    const phone = req.body.phone;
  
    db.run('INSERT INTO customers (phone, birthday) VALUES (?, ?)', [phone, birthday], (err) => {
      if (err) {
        return res.render('birthday', { error: 'An error occurred' });
      }
  
      req.session.isNewCustomer = false;
      res.redirect('/checkedin');
    });
    });


app.get('/checkedin', (req, res) => {
    if (req.session.isNewCustomer === false) {
      res.send('You are checked in. Welcome!');
    } else {
      res.redirect('/');
    }
  });



app.get('/login', (req, res) => {
    res.render('login');
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
    // You can implement your authentication logic here.
  
    // For simplicity, we'll check if the username is "user" and the password is "password".
    if (username === 'user' && password === 'password') {
      req.session.authenticated = true;
      res.redirect('/reward');
    } else {
      res.render('login', { error: 'Invalid username or password' });
    }
  });




//sample data
const customers = [
    { phone: '123-456-7890', birthday: '1990-01-15' },
    { phone: '987-654-3210', birthday: '1985-06-22' },
    { phone: '281-912-7693', birthday: '1999-07-12'}
  ];


app.get('/reward', (req, res) => {
    const customers = [
        {
            firstName: 'Kim',
            lastName: 'Luong',
            phoneNumber: '281-912-7693',
            currentPoints: 10,
            lifetimePoints: 50
        },
    ];
    res.render('reward', { customers });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
