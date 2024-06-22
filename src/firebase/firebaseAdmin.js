const admin = require("firebase-admin");
var serviceAccount = require("../../config/camagru-private-key.json");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://camagru-d216b-default-rtdb.europe-west1.firebasedatabase.app"
});

module.exports = admin;
