const functions = require('firebase-functions');
const admin=require('firebase-admin')
const firebase=require('firebase')

admin.initializeApp();

const express=require('express');
const app=express();

const config = {
    apiKey: "AIzaSyBnsT7dSkYVCzOQofTE7EJDbM3zqZ1i0kU",
    authDomain: "social-api-3bbea.firebaseapp.com",
    databaseURL: "https://social-api-3bbea.firebaseio.com",
    projectId: "social-api-3bbea",
    storageBucket: "social-api-3bbea.appspot.com",
    messagingSenderId: "600533108533",
    appId: "1:600533108533:web:a60a209ac3df07b2"
  };

firebase.initializeApp(config);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

app.get('/screams',(req,res)=>{
    let screams=[];
   admin.firestore().collection('scream').orderBy('createdAt', 'desc').get()
    .then(data=>{
            data.forEach(doc=>{
                screams.push({
                    screamId:doc.id,
                    body:doc.data().body,
                    userHandle:doc.data().userHandle,
                    createdAt:doc.data().createdAt
                });
            })
           return res.json(screams);
    })
    .catch(err=>{
        res.status(500).json({error:"something went wrong"});
        console.error(err);
    })
})

app.post('/scream',(req,res)=>{
    // if(req.method!=='POST')
    //     return res.status(400).json({error:"Method Not Allowed"});
    let newScream={
        body:req.body.body,
        userHandle:req.body.userHandle,
        createdAt: new Date().toISOString()
        // createdAt:admin.firestore.Timestamp.fromDate(new Date())
    }
    admin.firestore().collection('scream').add(newScream)
    .then(doc=>{
        res.json({message:`Document ${doc.id} added successfully`})
    })
    .catch(err=>{
        res.status(500).json({error:"something went wrong"});
        console.log(err);
    })
})

//https://baseurl.api

exports.api=functions.https.onRequest(app);