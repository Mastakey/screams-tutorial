const functions = require('firebase-functions');

const express = require("express");
const app = express();

const FBAuth = require('./util/fbAuth');

const { getAllScreams, postOneScream } = require('./handlers/screams');
const { signUp, login, uploadImage, addUserDetails, getAuthenicatedUser } = require('./handlers/users');

//Scream routes
app.get('/screams', getAllScreams);
app.post('/screams', FBAuth, postOneScream);

//User routes
app.post("/signup", signUp);
app.post("/login", login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenicatedUser);

exports.api = functions.https.onRequest(app);