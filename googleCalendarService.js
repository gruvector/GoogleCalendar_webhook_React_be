const { google } = require('googleapis');

// Replace with your actual Google API credentials
const CLIENT_ID = '85221468614-9cc79trecs6po84kqdncegsq200q6i2t.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:4000';
const CALENDAR_ID = 'primary'; // Use 'primary' for the primary calendar

// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

// Function to set up a watch on Google Calendar
async function setupCalendarWatch(webhookUrl) {
    try {
        const response = await calendar.events.watch({
            calendarId: CALENDAR_ID,
            requestBody: {
                id: 'unique-channel-id', // Unique ID for the notification channel
                type: 'web_hook',
                address: webhookUrl,
            },
        });
        console.log('Calendar watch setup:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error setting up calendar watch:', error);
    }
}

// Function to handle webhook notifications
function handleCalendarWebhook(req, res) {
    const calendarEventData = req.body;
    console.log('Received Google Calendar webhook:', calendarEventData);

    // Here, you'd typically update your database or perform some processing
    // You can then pass the event data to your React app or store it for retrieval

    res.sendStatus(200);
}

module.exports = {
    setupCalendarWatch,
    handleCalendarWebhook,
};
