require('../firebase/firebase');
const admin = require("../firebase/firebaseAdmin");
const { getAuth, signInWithEmailAndPassword } = require("firebase/auth");

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
  try
  {
    const {email, password} = body;
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      // Add any other user properties you want to set
    });

    const userData = {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      // Add any other user properties you want to return
    };
    // redirect to /homepage
    res.writeHead(302, { 'Location': '/homepage' });
    res.end();
  }
	catch (error)
  {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to create user', details: error.message }));
  }
};

/**
 * Sign in a user when signing in at /signin
 * @param {Object} body - {email, password}
*/
const signin = async (body, res) => {
  try
  {
    const {email, password} = body;
    const auth = getAuth();
    let user = signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 
        console.log('Successfully signed in user:', userCredential.user.uid);

        // redirect to /homepage
        res.writeHead(302, { 'Location': '/homepage' });
        res.end();
      })

      .catch((error) => {
        console.error('Error signing in user:', error.message);

        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: error.message }));
      });

  }
  catch (error)
  {
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
