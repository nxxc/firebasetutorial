const { db } = require('../util/admin');

const firebase = require('firebase');
const config = require('../util/config');
const {
  validateSignUpData,
  validateLogInUpData,
} = require('../util/validator');

firebase.initializeApp(config);

exports.signup = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  const { errors, valid } = validateSignUpData(newUser);

  if (!valid) return res.status(400).json(errors);

  //todo validate data
  let token;
  let userId;
  db.doc(`/users/${newUser.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.status(400).json({ handle: 'this handle is already taken' });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((idToken) => {
      token = idToken;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId,
      };

      return db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then((data) => {
      return res.status(201).json({ token });
    })
    .catch((e) => {
      if (e.code === 'auth/email-already-in-use') {
        return res.status(400).json({ email: 'Email is already is use' });
      }

      return res.status(500).json({ error: e.code });
    });
};

exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };

  const { errors, valid } = validateLogInUpData(user);

  if (!valid) return res.status(400).json(errors);

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return res.json({ token });
    })
    .catch((e) => {
      console.error(e);
      if (e.code === 'auth/wrong-password') {
        return res.status(403).json({
          general: 'Wrong credential, please try again',
        });
      }
      return res.status(500).json({ error: e.code });
    });
};
