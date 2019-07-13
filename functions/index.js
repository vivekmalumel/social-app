const functions = require('firebase-functions');
const admin=require('firebase-admin')


admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});

exports.getSreams=functions.https.onRequest((request,response)=>{
    let screams=[];
   admin.firestore().collection('scream').get()
    .then(data=>{
            data.forEach(doc=>{
                screams.push(doc.data());
            })
           return response.json(screams);
    })
    .catch(err=>{
        console.error(err);
    })
})

exports.createScream=functions.https.onRequest((req,res)=>{
    if(req.method!=='POST')
        return res.status(400).json({error:"Method Not Allowed"});
    let newScream={
        body:req.body.body,
        userHandle:req.body.userHandle,
        cretaedAt:admin.firestore.Timestamp.fromDate(new Date())
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