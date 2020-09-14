const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const express = require('express');
const app = express();

app.get('/screams', (req, res) => {
  admin
    .firestore()
    .collection('screams')
    .orderBy('createdAt', 'desc')
    .get()
    .then((data) => {
      let screams = [];
      data.forEach((doc) => {
        screams.push({
          screamId: doc.id,
          ...doc.data(),
        });
      });
      return res.json(screams);
    })
    .catch((e) => console.error(e));
});

app.post('/scream', (req, res) => {
  if (req.method !== 'POST') {
    return res.status(400).json({
      error: 'Method not allowed',
    });
  }
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString(),
  };

  admin
    .firestore()
    .collection('screams')
    .add(newScream)
    .then((doc) => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch((e) => {
      res.status(500).json({ error: 'something went wrong' });
      console.error(e);
    });
});

exports.api = functions.region('asia-northeast3').https.onRequest(app);
