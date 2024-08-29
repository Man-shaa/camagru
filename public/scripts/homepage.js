import { onAuthStateChanged, getAuth } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore();

onAuthStateChanged(auth, (user) => {
	const loggedUser = localStorage.getItem('loggedUser');
	if (loggedUser) {
		const docRef = doc(db, 'users', loggedUser);
		getDoc(docRef)
		.then((docSnap) => {
			if (docSnap.exists()) {
				const userData = docSnap.data();
				console.log('Document data:', userData);
				document.getElementById('loggedUserEmail').innerHTML = userData.email;
				document.getElementById('loggedUserUid').innerHTML = userData.uid;
			}
			else
			{
				console.log('No such document');
			}
		})
		.catch((error) => {
			console.log('Error fetching document:', error);
		});
	}
	else
	{
		console.log('user Id not found in local storage');
	}
});