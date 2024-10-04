import { deleteDoc, getFirestore, getDocs, collection } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

const db = getFirestore();

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

// get all files's uniqueImageName uploaded from user [userId]
async function getUserFiles(userId) {
  try {
		console.log("userId : ", userId);
    const userUploadsRef = collection(db, `users/${userId}/uploads`);

    const querySnapshot = await getDocs(userUploadsRef);
    
    const uniqueImageNames = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data && data.uniqueImageName)
        uniqueImageNames.push(data.uniqueImageName);
    });
		
    // Return an array of all uniqueImageNames
    return (uniqueImageNames);
  }
	catch (error) {
    console.error("Error retrieving user files: ", error);
    throw error;
  }
}

export { deleteFirestoreImage, getUserFiles };