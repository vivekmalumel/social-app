const {db}=require('../util/admin');
const config=require('../util/config')
const firebase=require('firebase');
const Joi = require('@hapi/joi');

firebase.initializeApp(config);

exports.signup=(req,res)=>{
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
    const result = Joi.validate(newUser, schema,{abortEarly: false}); //{abortEarly: false} to display all errors
    if(result.error){
        let errors={}
        result.error.details.forEach((err)=>{
            errors[err.context.label]=err.message;
        })
        return res.status(400).json(errors);
    }
            //return res.status(400).json({error:result.error}); //when only single error need to display
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

};


exports.login=(req,res)=>{
    const user={
        email:req.body.email,
        password:req.body.password
    }

    const schema=Joi.object().keys({
        email:Joi.string().email({ minDomainSegments: 2 }).required(),
        password:Joi.string().required()
    })

    const result = Joi.validate(user, schema,{abortEarly: false}); //{abortEarly: false} to display all errors
    if(result.error){
        let errors={}
        result.error.details.forEach((err)=>{
            errors[err.context.label]=err.message;
        })
        return res.status(400).json(errors);
    }

    firebase.auth().signInWithEmailAndPassword(user.email,user.password)
    .then(data=>{
        return data.user.getIdToken();
    })
    .then(token=>{
        return res.status(200).json({token});
    })
    .catch(err=>{
        console.log(err);
        if(err.code==="auth/user-not-found"|| err.code==="auth/wrong-password")
            return res.status(403).json({error:"Invalid Email or Password"})
        else 
            return res.status(500).json({error:err.code});
    })
}