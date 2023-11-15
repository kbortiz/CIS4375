// auth.js

// Function to handle user login
function loginUser() {
    // Fetch data from your login form
    const formData = new FormData(document.getElementById('loginForm'));

    fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        mode: "cors",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        localStorage.setItem('authToken', data.token); // Store the token
        // Redirect to protected pages or perform further actions
        window.location.href = 'http://localhost:3000/rewards';
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function handleLogin(un, pw) {
    try {
        const formData = new FormData(document.getElementById('loginForm'));

      let response = fetch('http://127.0.0.1:5000/login', {
          method: "POST", // POST
          mode: "cors",
          body: formData,
          cache: "no-cache",
          headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'Access-Control-Allow-Origin': '*',
              'Accept': 'application/json'    
          },
          redirect: "follow",
          referrer: "no-referrer"
      })
      response = response.json();
      window.localStorage.setItem('token', response.data.token)
      .then(response => {
        // Handle the response
        if (response.ok) {
            window.location.href = '/customer-information';
        } else {
            // Handle other cases
        }
    })
    } catch(e) {
      console.log('error while logging in', e)
    }
  }

// Function to check authentication and access protected routes
function checkAuthentication() {
    return new Promise((resolve, reject) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            reject('No token available');
        }

        // Send the token in the header for verification
        fetch('http://127.0.0.1:5000/protected', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        })
        .then(response => {
            if (response.ok) {
                resolve('Authenticated');
            } else {
                reject('Access denied');
            }
        })
        .catch(error => {
            reject(error);
        });
    });
}

