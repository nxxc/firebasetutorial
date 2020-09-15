const functions = require('firebase-functions');

const app = require('express')();

const { getAllScreams, postOneScream } = require('./handlers/scream');
const { signup, login } = require('./handlers/user');
const FBAuth = require('./util/fbAuth');

app.get('/screams', getAllScreams);
app.post('/scream', FBAuth, postOneScream);

// Signup route
app.post('/signup', signup);
app.post('/login', login);

exports.api = functions.region('asia-northeast3').https.onRequest(app);
