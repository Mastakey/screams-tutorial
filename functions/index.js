const functions = require('firebase-functions');

const express = require("express");
const app = express();

var firebaseConfig = {
    apiKey: "AIzaSyBw3bf149FNKR_sfGy6y264EEaABvIucBw",
    authDomain: "social-ape-tutorial-960c4.firebaseapp.com",
    databaseURL: "https://social-ape-tutorial-960c4.firebaseio.com",
    projectId: "social-ape-tutorial-960c4",
    storageBucket: "social-ape-tutorial-960c4.appspot.com",
    messagingSenderId: "974351179986",
    appId: "1:974351179986:web:f350ae1ed4f38b5b"
};
const firebase = require("firebase");
firebase.initializeApp(firebaseConfig);

app.get('/screams', (req, res) => {
    db
        .collection("screams")
        .orderBy('createdAt', 'desc')
        .get()
        .then(data => {
            let screams = [];
            data.forEach(doc => {
                screams.push({
                    screamId: doc.id,
                    //...doc.data()
                    body: doc.data().body,
                    userHandle: doc.data().userHandle,
                    createdAt: doc.data().createdAt
                });
            });
            return res.json(screams);
        })
        .catch(err => console.error(err));
});

const FBAuth = (req, res, next) => {
    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){
        idToken = req.headers.authorization.split('Bearer ')[1];
    } else {
        console.error('No token found');
        return res.status(403).json({ error: 'Unauthorized' });
    }
    admin.auth().verifyIdToken(idToken)
        .then(decodedToken => {
            req.user = decodedToken;
            console.log(decodedToken);
            return db.collection('users')
                .where('userId', '==', req.user.uid)
                .limit(1)
                .get();
        })
        .then(data => {
            req.user.handle = data.docs[0].data().handle;
            return next();
        })
        .catch(err => {
            console.error('Error while verifying token ', err);
            return res.status(403).json(err);
        });
}

app.post('/screams', FBAuth, (req, res) => {
    const newScream = {
        body: req.body.body,
        userHandle: req.user.handle,
        createdAt: new Date().toISOString()
    };
    db
        .collection("screams")
        .add(newScream)
        .then(doc => {
            res.json({ message: `document ${doc.id} created successfully` });
        })
        .catch(err => {
            res.status(500).json({ error: "something went wrong" });
            console.error(err);
        });
});

const isEmpty = (string) => {
    if (string.trim() === ''){
        return true;
    }
    return false;
}

const isEmail = (email) => {
    //TODO get email regex
    return true;
}

//Sign up route
app.post("/signup", (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle
    };
    let errors = {};

    if (isEmpty(newUser.email)){
        errors.email = 'must not be empty';
    }
    else if (!isEmail(newUser.email)){
        errors.email = 'must be valid';
    }

    if (isEmpty(newUser.password)) errors.password = 'must not be empty';
    if (newUser.password !== newUser.confirmPassword) errors.confirmPassword = 'passwords must match';
    if (isEmpty(newUser.handle)) errors.handle = "must not be empty";

    if (Object.keys(errors).length > 0){
        return res.status(400).json(errors);
    }

    let token, userId;

    //Validate data
    db.doc(`/users/${newUser.handle}`).get()
        .then((doc) => {
            if (doc.exists) {
                return res.status(400).json({
                    handle: 'this handle is already taken'
                });
            }
            else {
                return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
            }
        })
        .then((data) => {
            userId = data.user.uid;
            return data.user.getIdToken(); //returns token
        })
        .then((tokenId) => {
            token = tokenId;
            const userCredentials = {
              handle: newUser.handle,
              email: newUser.email,
              createdAt: new Date().toISOString(),
              userId: userId
            };
            return db.doc(`/users/${newUser.handle}`).set(userCredentials);
            //return res.status(201).json({ token });
        })
        .then(() => {
            return res.status(201).json({token: token});
        })
        .catch((err) => {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                return res.status(400).json({ email: 'Email is already in use' });
            }
            else {
                return res.status(500).json({ error: err.code });
            }
        });
});

//Login
app.post("/login", (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    };

    let errors = {};
    if (isEmpty(user.email)) errors.email = 'must not be empty';
    if (isEmpty(user.password)) errors.password = "must not be empty";
    if (Object.keys(errors).length > 0) {
        return res.status(400).json(errors);
    }

    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(data => {
            return data.user.getIdToken();
        })
        .then(token => {
            return res.json({token});
        })
        .catch(err => {
            console.error(err);
            if (err.code === "auth/wrong-password"){
                return res.status(403).json({general: 'wrong credentials, please try again'})
            }
            return res.status(500).json({ error: err.code });
        });
});

exports.api = functions.https.onRequest(app);