const express = require('express');
const { google } = require('googleapis');
const session = require('express-session');
const cors = require('cors');

const app = express();
const oauth2Client = new google.auth.OAuth2(
  'YOUR_CLIENT_ID', // Replace with your Google Client ID
  'YOUR_CLIENT_SECRET', // Replace with your Google Client Secret
  'http://localhost:3000/oauth2callback' // This must match the redirect URI in your Google Cloud Console
);

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

app.use(cors({
  origin: 'http://localhost:3000', // Allow React app to communicate with this backend
  credentials: true, // Allow cookies for sessions
}));

app.use(session({
  secret: 'your-secret-key',  // Secret key for the session
  resave: false,
  saveUninitialized: true,
}));

// Step 1: Redirect to Google OAuth2
app.get('/auth', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.readonly'], // You can modify the scope as needed
  });
  res.redirect(authUrl);  // Redirect the user to the Google login page
});

// Step 2: Handle OAuth2 callback
app.get('/oauth2callback', (req, res) => {
  const code = req.query.code;  // Get the authorization code from the query parameter
  oauth2Client.getToken(code, (err, tokens) => {
    if (err) {
      return res.status(400).send('Error getting tokens');
    }
    oauth2Client.setCredentials(tokens);  // Set the credentials for OAuth2 client
    req.session.tokens = tokens;  // Store the tokens in the session
    res.redirect('/calendar');  // Redirect to the calendar endpoint
  });
});

// Step 3: Fetch Google Calendar events
app.get('/calendar', (req, res) => {
  if (!req.session.tokens) {
    return res.status(401).send('User not authenticated');  // If no tokens found, the user is not authenticated
  }

  oauth2Client.setCredentials(req.session.tokens);  // Set the credentials for OAuth2 client using the stored tokens
  
  calendar.events.list({
    calendarId: 'primary',  // Use the primary calendar
    timeMin: (new Date()).toISOString(),  // Fetch events from now onwards
    maxResults: 10,  // Limit to 10 events
    singleEvents: true,  // Ensure recurring events are expanded
    orderBy: 'startTime',  // Order events by their start time
  })
    .then(response => {
      res.json(response.data.items);  // Send the events as JSON
    })
    .catch(error => {
      console.error('Error fetching calendar events:', error);
      res.status(500).send('Error fetching calendar events');
    });
});

// Start the Express server
app.listen(3000, () => {
  console.log('Backend server running on http://localhost:3000');
});
