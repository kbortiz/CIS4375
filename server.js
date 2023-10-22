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
            firstName: 'Peter',
            lastName: 'Parks',
            phoneNumber: '8321121113',
            lastVisit: '10/10/2023',
            currentPoints: 2,
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
    res.render('reward', { customers });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
