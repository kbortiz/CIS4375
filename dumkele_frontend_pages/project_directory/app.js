const express = require('express');
const session = require('express-session');
const app = express();
const port = 3000;

app.use(
    session({
        secret: 'secretkey',
        resave: true,
        saveUnitialized: true
    })
);

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: 'secretkey',
        resave: true,
        saveUnitialized: false,
    })
);

const users = [
    { username: 'manager', password: 'pass1' },
    { username: 'user2', password: 'password2' },
];

app.get('/', (req, res) => {
    res.render('login'); 
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
  
    // Check if the user exists (in a real application, validate against a database)
    const user = users.find(user => user.username === username && user.password === password);
  
    if (user) {
      req.session.user = user;
      res.redirect('/dashboard');
    } else {
      res.send('Invalid username or password. <a href="/login">Try again</a>');
    }
  });

app.get('/dashboard', (req, res) => {
    if (req.session.user) {
        res.render('dashboard', { user: req.session.user });
    } else {
        res.redirect('/login');
    }
});


app.get('/checkin', (req, res) => {
    res.render('checkin');
  });
  
  // Define a POST request handler for customer check-ins
  app.post('/checkin', (req, res) => {
    const { name, birthday } = req.body;
  
    // Process customer check-in here
    // You can save customer data to a database or perform other actions
    const message = `
        <div class="card blue-grey darken-1">
        <div class="card-content white-text">
            <span class="card-title">Thank you, ${name}!</span>
            <p>For checking in!</p>
        </div>
        </div>
    `;
    res.send(message);
  });

app.get('/logout', (req, res) => {
  // Clear the user's session data
  req.session.destroy();

  // Redirect to the login page
  res.redirect('/');
});

app.listen(port, () => {
    console.log('Server is running on http://localhost:3000');
});
