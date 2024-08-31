import { onAuthStateChanged, getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, getDocs, addDoc, collection, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
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

		// upload on firebase storage
		uploadBytes(imageStorageRef, file, metadata)
		.then((snapshot) => {
			console.log(`Uploaded ${file.name}!`);

			getDownloadURL(snapshot.ref)
			.then((url) => {;
            console.log('File available at', url);

			// add image data to firestore database
				addDoc(collection(db, 'images'), {
					UniqueImageName: uniqueFileName,
					imageUrl : url,
					fileName: file.name,
					userId: currentUser.uid
				});
			})
			.catch((error) => {
				console.log("Error getting download URL: ", error);
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

onAuthStateChanged(auth, (user) => {
	console.log("user status : ", user);
	if (user) {
    logoutBtnContainer.style.display = 'block';
		currentUser = user;

		const imagesCollectionRef = collection(db, 'images');

		getDocs(imagesCollectionRef)
		.then((querySnapshot) => {

			const imagesContainer = document.getElementById('imagesContainer');
			imagesContainer.innerHTML = '';

			querySnapshot.forEach((doc) => {
				const imageUrl = doc.data().imageUrl; // Get image URL from Firestore
	
				// Create an img element and set its src to the image URL
				const imgElement = document.createElement('img');
				imgElement.src = imageUrl;
				imgElement.alt = 'User uploaded image';
				imgElement.className = 'uploaded-image';
	
				// Append the image element to the container
				imagesContainer.appendChild(imgElement);
			});

		})
		.catch((error) => {
			console.log("Error getting document:", error);
		});
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
