import { onAuthStateChanged, getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore();

const signinBtnContainer = document.getElementById('signin-btn-container');
const logoutBtnContainer = document.getElementById('logout-btn-container');

signinBtnContainer.style.display = 'none';
logoutBtnContainer.style.display = 'none';

onAuthStateChanged(auth, (user) => {
	console.log("user status : ", user);
	if (user) {
    logoutBtnContainer.style.display = 'block';

		// const docRef = doc(db, 'users', user.uid);
		// getDoc(docRef)
		// .then((docSnap) => {
		// 	if (docSnap.exists()) {
		// 		const userData = docSnap.data();
		// 		console.log('Document data:', userData);
		// 		document.getElementById('userEmail').innerHTML = userData.email;
		// 		document.getElementById('userUid').innerHTML = userData.uid;
		// 	}
		// 	else
		// 	{
		// 		console.log('No such document');
		// 	}
		// })
		// .catch((error) => {
		// 	console.log('Error fetching document:', error);
		// });
	}
	else
	{
		// No user is logged in, show the signin button
    signinBtnContainer.style.display = 'block';
	}
});

const logoutButton = document.getElementById('logout');

logoutButton.addEventListener('click', () => {

	signOut(auth)
	.then(() => {
		window.location.href = '/signin';
	})
	.catch((error) => {
		console.log('Error signing out:', error);
	});
});
