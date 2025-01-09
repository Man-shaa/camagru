import { getFirestore, addDoc, collection } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-storage.js";

import { createImageElement } from "./galerie.js";

// global variables
const db = getFirestore();
const storage = getStorage();

export function uploadImage(currentUserId, file) {
	const uniqueFileName = `${currentUserId}_${Date.now()}_${file.name}`;
	const imageStorageRef = ref(storage, 'images/' + uniqueFileName);
	const metadata = {
		customMetadata: {
			userId: currentUserId,
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
				userId: currentUserId,
				createdAt: new Date()
			})
			.then((docRef) => {
				createImageElement(url, file.name, docRef.id);
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
};
