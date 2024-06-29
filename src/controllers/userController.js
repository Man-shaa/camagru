require('../firebase/firebase');
const admin = require("../firebase/firebaseAdmin");


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


module.exports = {
  getUsers,
	getUserByUID,
};
