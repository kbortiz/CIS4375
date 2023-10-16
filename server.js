const express = require('express');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

// Define a middleware to set the currentUrl for all routes
app.use((req, res, next) => {
    res.locals.currentUrl = req.originalUrl;
    next();
});

app.get('/', (req, res) => {
    res.render('check-in');
});

app.get('/reward', (req, res) => {
    res.render('reward');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});