const functions = require('firebase-functions');
const express=require('express');
const app=express();
const {getAllScreams,postOneScream}=require('./handlers/screams');
const {signup,login,uploadImage}=require('./handlers/users');
const fbAuth=require('./util/fbAuth');





//firebase.initializeApp(config);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

//scream Routes
app.get('/screams',getAllScreams);
app.post('/scream',fbAuth,postOneScream);

//Users Routes
app.post('/signup',signup);
app.post('/login',login);
app.post('/user/image',fbAuth,uploadImage);

//https://baseurl.api

exports.api=functions.https.onRequest(app);