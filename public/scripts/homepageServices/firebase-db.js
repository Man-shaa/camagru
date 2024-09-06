import { getStorage, ref, deleteObject } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-storage.js";

// global variables
const storage = getStorage();

// delete an image from Firebase Storage using the image unique name
function deleteFirebaseImage(uniqueImageName) {
	const imageRef = ref(storage, 'images/' + uniqueImageName);
	if (!imageRef) {
		console.log("Image reference not found");
		return;
	}
	deleteObject(imageRef)
	.then(() => {
		console.log("Image successfully deleted!");
	})
	.catch((error) => {
		console.error("Error removing image: ", error);
	});
}

export { deleteFirebaseImage };