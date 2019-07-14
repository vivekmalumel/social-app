const functions = require('firebase-functions');
const admin=require('firebase-admin')
const firebase=require('firebase')

admin.initializeApp();

const express=require('express');
const app=express();

const Joi = require('@hapi/joi');

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

const db=admin.firestore();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

app.get('/screams',(req,res)=>{
    let screams=[];
   db.collection('scream').orderBy('createdAt', 'desc').get()
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
    db.collection('scream').add(newScream)
    .then(doc=>{
        res.json({message:`Document ${doc.id} added successfully`})
    })
    .catch(err=>{
        res.status(500).json({error:"something went wrong"});
        console.log(err);
    })
})


//Signup Path

app.post('/signup',(req,res)=>{
    const newUser={
        email:req.body.email,
        password:req.body.password,
        confirmPassword:req.body.confirmPassword,
        handle:req.body.handle
    }
    const schema = Joi.object().keys({
        email: Joi.string().email({ minDomainSegments: 2 }).required(),
        password: Joi.string().required(),
        confirmPassword:Joi.string().required(),
        handle:Joi.string().required()

    })
    const result = Joi.validate(newUser, schema);
    if(result.error)
            return res.status(400).json({error:result.error.details[0].message});
    //validate data
    let token,userId;
    db.doc((`/users/${newUser.handle}`)).get()
        .then(doc=>{
            if(doc.exists){
                return res.status(400).json({handle:'This handle already taken'});
            }
            else{
                return firebase.auth().createUserWithEmailAndPassword(newUser.email,newUser.password);
            }
        })
        .then(data=>{
            userId=data.user.uid;
            return data.user.getIdToken();
        })
        .then(idToken=>{
            token=idToken;
            const userCredentials={
                handle:newUser.handle,
                email:newUser.email,
                createdAt:new Date().toISOString(),
                userId
            }
            return db.doc(`/users/${newUser.handle}`).set(userCredentials);
        })
        .then(()=>{
            return res.status(201).json({token});
        })
        .catch(err=>{
                console.log(err);
                if(err.code==='auth/email-already-in-use')
                    return res.status(400).json({email:'Email is already in use'})
                return res.status(500).json({error:err.code});
        })

})

//https://baseurl.api

exports.api=functions.https.onRequest(app);