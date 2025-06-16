const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

// Set your JWT secret directly
const JWT_SECRET = 'lionel_barca'; // Replace with your actual secret

app.use(express.json());

app.use("/customer", session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
}));

app.use("/customer/auth/*", function auth(req, res, next) {
    // Check if the session has a token
    const token = req.session.token; // Access token stored in the session

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No access token provided' });
    }

    try {
        // Verify the JWT token using the secret key
        const decoded = jwt.verify(token, JWT_SECRET);
        // Attach the decoded user information to the request object
        req.user = decoded;
        next(); // Proceed to the next middleware/route handler
    } catch (err) {
        // If token verification fails, return a 403 Forbidden error
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
