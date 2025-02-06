require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16'  // Use the latest API version
});

// Check required environment variables
const requiredEnvVars = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'FRONTEND_URL'
];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`Missing required environment variable: ${envVar}`);
    }
}

const app = express();

// CORS configuration
app.use(cors({
    origin: function(origin, callback) {
        // Update this section in server.js
const allowedOrigins = [
    'http://localhost:3000', 
    'https://smartcostseg.com',
    'https://smart-onboarding-8cbf3cd91007.herokuapp.com'
];
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'X-Requested-With',
        'Accept',
        'Origin',
        'stripe-signature'
    ],
    credentials: true,
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Additional headers - simplified
app.use((req, res, next) => {
    // Only set the Vary header
    res.header('Vary', 'Origin');
    next();
});

// Regular body parser for most routes
app.use(bodyParser.json());

// Test route
app.get('/', (req, res) => {
    res.send('Server is running');
});

// Stripe webhook route with special configuration
app.post('/webhook', 
    cors({origin: false}), // Disable CORS for Stripe webhook
    bodyParser.raw({ type: 'application/json' }), 
    async (req, res) => {
        const sig = req.headers['stripe-signature'];
        let event;

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            console.error('Webhook Error:', err.message);
            res.status(400).send(`Webhook Error: ${err.message}`);
            return;
        }

        // Handle specific events
        switch (event.type) {
            case 'account.updated':
                const account = event.data.object;
                console.log('Account was updated:', account.id);
                break;
                
            case 'account.application.authorized':
                console.log('Account was authorized:', event.data.object.id);
                break;
                
            case 'account.application.deauthorized':
                console.log('Account was deauthorized:', event.data.object.id);
                break;
        }

        res.json({ received: true });
    }
);

// Error handling for CORS
app.use((err, req, res, next) => {
    if (err.message === 'Not allowed by CORS') {
        console.error('CORS Error:', {
            origin: req.get('origin'),
            method: req.method,
            path: req.path
        });
        res.status(403).json({
            error: 'CORS error: Origin not allowed',
            allowedOrigins: ['http://localhost:3000', 'https://smartcostseg.com']
        });
    } else {
        next(err);
    }
});

// Stripe Connect account creation
app.post('/api/create-connect-account', async (req, res) => {
    // Force HTTPS redirect if needed
    if (!req.secure && req.headers['x-forwarded-proto'] !== 'https') {
        const secureUrl = `https://${req.headers.host}${req.url}`;
        return res.redirect(307, secureUrl);
    }

    console.log('Received create-connect-account request:', {
        origin: req.get('origin'),
        method: req.method,
        protocol: req.protocol,
        secure: req.secure,
        forwardedProto: req.headers['x-forwarded-proto']
    });

    try {
        const { email, name, company, returnUrl, refreshUrl, mode } = req.body;
        
        console.log('Creating Stripe account with:', {
            email,
            name,
            company,
            environment: process.env.NODE_ENV,
            mode: mode
        });

        // Check for HTTPS using Heroku's forwarded protocol
        const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
        
        if (process.env.NODE_ENV === 'production' && !isSecure) {
            throw new Error('HTTPS is required for Stripe connections in production');
        }

        const account = await stripe.accounts.create({
            type: 'express',
            country: 'US',
            email: email,
            business_type: 'company',
            company: {
                name: company
            },
            capabilities: {
                card_payments: {requested: true},
                transfers: {requested: true}
            },
            settings: {
                payments: {
                    statement_descriptor: 'SMART COST SEG'
                }
            }
        });

        console.log('Stripe account created:', account.id);

        // Use the actual protocol from the request
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const host = req.get('host');

        const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: refreshUrl || `${protocol}://${host}/onboarding?step=3`,
            return_url: returnUrl || `${protocol}://${host}/onboarding?step=4`,
            type: 'account_onboarding',
            collect: 'eventually_due'
        });

        console.log('Account link created');

        res.json({ 
            accountLink: accountLink.url,
            accountId: account.id 
        });
    } catch (error) {
        console.error('Error creating connect account:', {
            message: error.message,
            stack: error.stack,
            headers: req.headers,
            protocol: req.protocol,
            secure: req.secure,
            forwardedProto: req.headers['x-forwarded-proto']
        });
        res.status(500).json({ 
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});