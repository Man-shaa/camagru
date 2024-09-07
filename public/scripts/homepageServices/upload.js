import { getFirestore, addDoc, collection } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-storage.js";

import { getCurrentUser } from "./auth.js";
import { createImageElement } from "./galerie.js";

// global variables
const db = getFirestore();
const storage = getStorage();

// Upload and add a new image to Firestore when clicking on upload button
document.getElementById('fileInput').addEventListener('change', function(event) {
	const currentUser = getCurrentUser();

	if (!currentUser) {
		console.log("user must be logged to upload an image");
		return;
	}

	const file = event.target.files[0];
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
			getDownloadURL(snapshot.ref)
			.then((url) => {
				addDoc(collection(db, 'images'), {
					uniqueImageName: uniqueFileName,
					imageUrl: url,
					fileName: file.name,
					userId: currentUser.uid,
					createdAt: new Date()
				})
				.then((docRef) => {
					createImageElement(url);
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
});

// Trigger file input when the upload button is clicked
document.getElementById('uploadButton').addEventListener('click', function() {
	document.getElementById('fileInput').click();
});
