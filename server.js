const express = require('express');
const app = express();
const port = 3000;

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
