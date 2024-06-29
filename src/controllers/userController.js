require('../firebase/firebase');
const admin = require("../firebase/firebaseAdmin");
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } = require("firebase/auth");


const auth = getAuth();


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
const signUp = async (body, res) =>
{
  const { email, password } = body;

  await createUserWithEmailAndPassword(auth, email, password)
  .then(async (userCredential) => {
    const user = userCredential.user;

    console.log("send email verification to user: ", user.email);
    await sendEmailVerification(user)

    console.log("Email verification sent!")

    res.writeHead(302, { 'Location': '/verify_email' });
    res.end();
  })
  .catch((error) => {
    console.error('Error creating user:', error.message);
  });
};

const checkVerification = async (req, res) => {
  try {
    const user = auth.currentUser;

    if (user) {
      console.log("user's email status :", user.emailVerified);
      await user.reload();
      if (user.emailVerified === true) {
        res.writeHead(302, { 'Location': '/signin' });
      }
      else {
        res.writeHead(302, { 'Location': '/verify_email' });
      }
    } else {
      res.writeHead(302, { 'Location': '/signin' });
    }
    res.end();
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to check verification status', details: error.message }));
  }
};

/**
 * Sign in a user when signing in at /signin
 * @param {Object} body - {email, password}
*/
const signIn = async (body, res) => {
  try
  {
    const email = body.email;
    const password = body.password;
    const auth = getAuth();
    let user = signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(user));
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
	signUp,
  signIn,
  checkVerification
};
