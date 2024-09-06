import { deleteDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// delete an image from Firestore using the image reference
function deleteFirestoreImage(imageRef) {
	if (!imageRef) {
		console.log("Image reference not found");
		return;
	}
	deleteDoc(imageRef)
	.then(() => {
		console.log("Document successfully deleted!");
		window.location.reload();
	})
	.catch((error) => {
		console.error("Error removing document: ", error);
	});
}

export { deleteFirestoreImage };