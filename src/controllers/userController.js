const firebase = require('../firebase');
const admin = require("firebase-admin");

/**
 * Return all users in the database
*/
const getUsers = async () =>
{
	try {
	const listUsers = await admin.auth().listUsers();
	const users = listUsers.users.map(userRecord => ({
		uid: userRecord.uid,
		email: userRecord.email,
		displayName: userRecord.displayName,
		// Add any other user properties you want to return
	}));
	console.log('Successfully fetched users:', users);
	return (users)
	}
	catch (error)
	{
		console.error('Error listing users:', error);
	}
};

/**
 * Get a user by UID
*/
const getUserByUID = async (uid) =>
{
  try
	{
    const userRecord = await admin.auth().getUser(uid);
    return {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      // Add any other user properties you want to return
    };
  }
	catch (error)
	{
    console.error('Error fetching user:', error);
    throw new Error('Failed to fetch user');
  }
};

/**
 * Create a new user when signing up at /signup
*  @param {Object} body - {email, password}
*/ 
const createUser = async (body, res) =>
{
	console.log('Creating user...', body);
  try {
    const userRecord = await admin.auth().createUser({
      email: body.email,
      password: body.password,
      // Add any other user properties you want to set
    });

    const userData = {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      // Add any other user properties you want to return
    };
    // redirect to /homepage
    // res.writeHead(302, { 'Location': '/homepage' });
    // res.end();

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(userData));
  }
	catch (error)
  {
    // console.error('Error creating user:', error.message, error.stack);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to create user', details: error.message }));
  }
};

/**
 * Sign in a user when signing in at /signin
 * @param {Object} body - {email, password}
*/
const signin = async (body, res) => {
  try {
    const {email, password} = body;
    const auth = firebase.auth();
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    // const userCredential = auth.signInWithEmailAndPassword(email, password);
    console.log('Successfully signed in user:', userCredential);
    // .then((userCredential) => {
    //   // Signed in 
    //   const user = userCredential.user;
    //   console.log('Successfully signed in user:', user);
    //   // ...
    // })
    // .catch((error) => {
    //   const errorCode = error.code;
    //   const errorMessage = error.message;
    // });


  //   console.log('Signing in user...', email, password);

  //   const userCredential = await admin.auth().signInWithEmailAndPassword(email, password);
  //   const user = userCredential.user;

  //   console.log('Successfully signed in user:', user.uid);

  //   res.writeHead(200, { 'Content-Type': 'application/json' });
  //   res.end(JSON.stringify({ uid: user.uid, email: user.email }));

  } catch (error) {
    console.error('Error signing in user:', error.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to sign in user', details: error.message }));
  }
};

module.exports = {
  getUsers,
	getUserByUID,
	createUser,
  signin,
};
