import { onAuthStateChanged, getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, addDoc, collection, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-storage.js";

const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

let currentUser = null;
const signinBtnContainer = document.getElementById('signin-btn-container');
const logoutBtnContainer = document.getElementById('logout-btn-container');
signinBtnContainer.style.display = 'none';
logoutBtnContainer.style.display = 'none';

const storageRef = ref(storage, 'images');

document.getElementById('uploadButton').addEventListener('click', async () => {
	if (!currentUser) {
		// No user is logged in, show the signin button or redirect to signin page
		console.log("user must be logged to upload an image");
		return;
	}

	const file = document.getElementById('fileInput').files[0];
	if (file) {
		const uniqueFileName = `${currentUser.uid}_${Date.now()}_${file.name}`;
		const imageStorageRef = ref(storage, 'images/' + uniqueFileName);
		const metadata = {
			customMetadata: {
				userId: currentUser.uid,
				fileName: file.name
			}
		};

		uploadBytes(imageStorageRef, file, metadata)
		.then((snapshot) => {
			console.log(`Uploaded ${file.name}!`);

			addDoc(collection(db, 'users', currentUser.uid, 'images'), {
				imageUrl: uniqueFileName,
				fileName: file.name,
		});
		})
		.catch((error) => {
			console.log("Error uploading file: ", error);
		});
	}
	else {
		// change this to a message on the page instead of an alert
    alert('No file selected.');
  }
});


// getDownloadURL(ref(storage, 'images/Chapsounette.png'))
// .then((url) => {
// 	console.log("url : ", url);
// 	// `url` is the download URL for 'images/stars.jpg'

// 	// Or inserted into an <img> element
// 	const img = document.getElementById('myimg');
// 	img.setAttribute('src', url);
// })
// .catch((error) => {
// 	// Handle any errors
// });

onAuthStateChanged(auth, (user) => {
	console.log("user status : ", user);
	if (user) {
    logoutBtnContainer.style.display = 'block';
		currentUser = user;

		// const docRef = doc(db, "users", user.uid);
		// getDoc(docRef)
		// .then((docSnap) => {

		// 	if (docSnap.exists()) {
		// 		console.log("Document data:", docSnap.data());
		// 	} else {
		// 		// docSnap.data() will be undefined in this case
		// 		console.log("No user found matching Uid");
		// 	}
		// })
		// .catch((error) => {
		// 	console.log("Error getting document:", error);
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
		currentUser = null;
		window.location.href = '/signin';
	})
	.catch((error) => {
		console.log('Error signing out:', error);
	});
});
