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
 * Create a new user
*/
const createUser = async (req, res) =>
{
	console.log('Creating user...', req.body);
  try {
    const userRecord = await admin.auth().createUser({
      email: req.body.email,
      password: req.body.password,
      // Add any other user properties you want to set
    });

    const userData = {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      // Add any other user properties you want to return
    };
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

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Signing in user...', email);

    const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
    const user = userCredential.user;

    console.log('Successfully signed in user:', user.uid);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ uid: user.uid, email: user.email }));

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
