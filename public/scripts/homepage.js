import { onAuthStateChanged, getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, getDocs, addDoc, deleteDoc, collection, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, deleteObject, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-storage.js";

const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

let currentUser = null;
const signinBtnContainer = document.getElementById('signin-btn-container');
const logoutBtnContainer = document.getElementById('logout-btn-container');
const uploadBtnContainer = document.getElementById('upload-container');

uploadBtnContainer.style.display = 'none';
signinBtnContainer.style.display = 'none';
logoutBtnContainer.style.display = 'none';

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
		imgElement.className = 'image';
		imgElement.alt = 'User uploaded image';

		// Append the image element to the container
		imagesContainer.appendChild(imgElement);
	});
})
.catch((error) => {
	console.log("Error getting document:", error);
});

const storageRef = ref(storage, 'images');

// add a new image ULR to the firestore database and uplaod it on firebase storage when clicking on upload button
document.getElementById('fileInput').addEventListener('change', function(event) {
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
				})
				.then((docRef) => {
					const imagesContainer = document.getElementById('imagesContainer');
				
					const imageDiv = document.createElement('div');
					imageDiv.className = 'image'; // Apply the CSS class for styling
				
					const imgElement = document.createElement('img');
					imgElement.src = url;
					imgElement.alt = 'User uploaded image';
					imgElement.className = 'uploaded-image'; // Ensure this class matches the CSS
				
					imageDiv.appendChild(imgElement);
					imagesContainer.appendChild(imageDiv);
				
					console.log("Document written with ID: ", docRef.id);
					window.location.reload();
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
    // alert('No file selected.');
  }
});

onAuthStateChanged(auth, (user) => {
	console.log("user status : ", user);
	if (user) {
    logoutBtnContainer.style.display = 'block';
		uploadBtnContainer.style.display = 'flex';
		currentUser = user;
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


document.getElementById('uploadButton').addEventListener('click', function() {
  // Programmatically click the hidden file input when the button is clicked
  document.getElementById('fileInput').click();
});
// /* prod only, delete all images in firebase storage / firestore */
// function deleteAllImages() {
// 	// delete from firestore
// 	// const imagesCollectionRef = collection(db, 'images');
// 	// // Get all documents in the collection
// 	// const querySnapshot = getDocs(imagesCollectionRef)
// 	// .then((querySnapshot) => {
// 	// 	console.log("querySnapshot : ", querySnapshot);
// 	// });

// 	// // Loop through each document and delete it
// 	// const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));

	
	
// 	// delete from storage
// 	const imageStorageRef = ref(storage, 'images/');
// 	deleteObject(imageStorageRef).then(() => {
// 		console.log("All images deleted successfully");
// 		// File deleted successfully
// 	}).catch((error) => {
// 		console.log("Error deleting file: ", error);
// 		// Uh-oh, an error occurred!
// 	});
// }

// deleteAllImages();
