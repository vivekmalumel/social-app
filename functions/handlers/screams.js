const {db}=require('../util/admin');
exports.getAllScreams=(req,res)=>{
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
};

    exports.postOneScream=(req,res)=>{
        // if(req.method!=='POST')
        //     return res.status(400).json({error:"Method Not Allowed"});
        let newScream={
            body:req.body.body,
            userHandle:req.user.handle, //req.body.userHandle
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
    }