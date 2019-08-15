const functions = require('firebase-functions');

const express = require("express");
const app = express();

const FBAuth = require('./util/fbAuth');

const { getAllScreams, postOneScream } = require('./handlers/screams');
const { signUp, login } = require('./handlers/users');

//Scream routes
app.get('/screams', getAllScreams);
app.post('/screams', FBAuth, postOneScream);

//User routes
app.post("/signup", signUp);
app.post("/login", login);

exports.api = functions.https.onRequest(app);