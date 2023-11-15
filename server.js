const passport=require('passport');
const LocalStrategy=require('passport-local').Strategy;
const express = require('express');
const app = express();
const { body, validationResult } = require('express-validator');
const bodyParser = require("body-parser");
const mysql = require('mysql');
const crypto=require('crypto');
const axios = require('axios');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
const port = 80;


/*Mysql Express Session*/

app.use(session({
	key: 'session_cookie_name',
	secret: 'session_cookie_secret',
	store: new MySQLStore({
        host: "cis4375project.cpbp75z8fnop.us-east-2.rds.amazonaws.com",
        port: 3306,
        user: "admin",
        password: "password",
        database: "Davi_Nails"
    }),
	resave: false,
    saveUninitialized: false,
    cookie:{
        maxAge:1000*60*60*24,
       
    }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static('public'));
app.use(express.static(__dirname));
app.set("view engine", "ejs");


/*Mysql Connection*/

var connection = mysql.createConnection({
    host: "cis4375project.cpbp75z8fnop.us-east-2.rds.amazonaws.com",
    user: "admin",
    password: "password",
    database: "Davi_Nails",
    multipleStatements: true
  });
  connection.connect((err) => {
    if (err) {
      console.log("Connection failed");
    } else {
      console.log("Conected");
    }
  });

  const customFields={
    usernameField:'uname',
    passwordField:'pw',
};


/*Passport JS*/
const verifyCallback=(username,password,done)=>{
   
     connection.query('SELECT * FROM users WHERE username = ? ', [username], function(error, results, fields) {
        if (error) 
            return done(error);

        if(results.length==0)
        {
            return done(null,false);
        }
        const isValid=validPassword(password,results[0].hash,results[0].salt);
        user={id:results[0].id,username:results[0].username,hash:results[0].hash,salt:results[0].salt};
        if(isValid)
        {
            return done(null,user);
        }
        else{
            return done(null,false);
        }
    });
}

const strategy=new LocalStrategy(customFields,verifyCallback);
passport.use(strategy);


passport.serializeUser((user,done)=>{
    console.log("inside serialize");
    done(null,user.id)
});

passport.deserializeUser(function(userId,done){
    console.log('deserializeUser'+ userId);
    connection.query('SELECT * FROM users where id = ?',[userId], function(error, results) {
            done(null, results[0]);    
    });
});



/*middleware*/
function validPassword(password,hash,salt)
{
    var hashVerify=crypto.pbkdf2Sync(password,salt,10000,60,'sha512').toString('hex');
    return hash === hashVerify;
}

function genPassword(password)
{
    var salt=crypto.randomBytes(32).toString('hex');
    var genhash=crypto.pbkdf2Sync(password,salt,10000,60,'sha512').toString('hex');
    return {salt:salt,hash:genhash};
}


 function isAuth(req,res,next)
{
    if(req.isAuthenticated())
    {
        next();
    }
    else
    {
        res.redirect('/login');
    }
}


function userExists(req,res,next)
{
    connection.query('Select * from users where username=? ', [req.body.uname], function(error, results, fields) {
        if (error) 
            {
                console.log("Error");
            }
       else if(results.length>0)
         {
            res.redirect('/userAlreadyExists')
        }
        else
        {
            next();
        }
       
    });
}


app.use((req,res,next)=>{
    console.log(req.session);
    console.log(req.user);
    res.locals.currentUrl = req.originalUrl;
    next();
});

/*routes*/

app.get('/login', (req, res, next) => {
    res.render('login')
});

app.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});


app.get('/register', (req, res, next) => {
    console.log("Inside get");
    res.render('register')
    
});

app.post('/register',userExists,(req,res,next)=>{
    console.log("Inside post");
    console.log(req.body.pw);
    const saltHash=genPassword(req.body.pw);
    console.log(saltHash);
    const salt=saltHash.salt;
    const hash=saltHash.hash;

    connection.query('Insert into users(username,hash,salt) values(?,?,?) ', [req.body.uname,hash,salt], function(error, results, fields) {
        if (error) 
            {
                console.log("Error adding user");
            }
        else
        {
            console.log("Successfully Entered");
        }
       
    });

    res.redirect('/login');
});

app.post('/login',passport.authenticate('local',{failureRedirect:'/login',successRedirect:'/reward'}));

app.get('/userAlreadyExists', (req, res, next) => {
    console.log("Inside get");
    res.send('<h1>Sorry This username is taken </h1><p><a href="/register">Register with different username</a></p>');
    
});

app.get('/', (req, res) => {
    axios.get(`http://ec2-18-116-39-255.us-east-2.compute.amazonaws.com:8000/checkinpromo`,{
        withCredentials: true  // Include cookies for authentication
    })
       .then((rewardresponse) => {
        var customers = rewardresponse.data;
        res.render('check-in', { customers:customers});
        })
        .catch((error) => {
            console.error('Axios error:', error);
            // Handle the error, e.g., by displaying an error message to the user
        });
});


app.get('/checkedin', (req, res) => {

    axios.get(`http://ec2-18-116-39-255.us-east-2.compute.amazonaws.com:8000/checkedin`,{
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
    axios.get(`http://ec2-18-116-39-255.us-east-2.compute.amazonaws.com:8000/newcheckin`,{
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


app.get('/reward',isAuth, (req, res) => {

   axios.get(`http://ec2-18-116-39-255.us-east-2.compute.amazonaws.com:8000/customerpoints`,{
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

app.get('/promotion',isAuth, (req, res) => {
            
    axios.get(`http://ec2-18-116-39-255.us-east-2.compute.amazonaws.com:8000/allpromos`)
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
app.get('/redemption-history',isAuth, (req, res) => {
    axios.get(`http://ec2-18-116-39-255.us-east-2.compute.amazonaws.com:8000/redemptionhistory`)
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
    axios.get(`http://ec2-18-116-39-255.us-east-2.compute.amazonaws.com:8000/allreviews`)
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

app.get('/delete-reviews',isAuth, (req, res) => {
    axios.get(`http://ec2-18-116-39-255.us-east-2.compute.amazonaws.com:8000/allreviews`)
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

app.get('/customer-information',isAuth, (req, res) => {
    axios.get('http://ec2-18-116-39-255.us-east-2.compute.amazonaws.com:8000/customerinfo', {
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

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
