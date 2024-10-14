import { deleteDoc, getFirestore, getDocs, query, where, collection, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

const db = getFirestore();

// delete an image from Firestore using the image reference
async function deleteFirestoreImage(imageRef, userId, uniqueFileName) {
  if (!imageRef) {
      console.log("Image reference not found");
      return;
  }

  // Delete the image from the /images collection
  await deleteDoc(imageRef);
  console.log("Document successfully deleted from /images collection!");

  // Now search for the document in the /users/userId/uploads collection
  const uploadsRef = collection(db, `users/${userId}/uploads`);
  const q = query(uploadsRef, where('uniqueImageName', '==', uniqueFileName));
  
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
      // Assuming uniqueFileName is unique, we can safely get the first document
      const uploadDocRef = querySnapshot.docs[0].ref;
      await deleteDoc(uploadDocRef);
      console.log("Upload document successfully deleted from /users/${userId}/uploads collection!");
  }
  else {
      console.log("No matching upload document found.");
  }
  window.location.reload();
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

// Recursively delete all documents and subcollections in a collection [collectionPath]
async function deleteCollection(db, collectionPath) {
  try {
    const collectionRef = collection(db, collectionPath);
    const querySnapshot = await getDocs(collectionRef);

    // Iterate through the documents in the collection
    for (const docSnap of querySnapshot.docs) {
      const docRef = doc(db, collectionPath, docSnap.id);

      // Call deleteCollection recursively if there are known subcollections
      // You can add new subcollection names here when needed
      const knownSubcollections = ["uploads"]; // Add new subcollection names to this array as needed
      for (const subcollectionName of knownSubcollections) {
        await deleteCollection(db, `${collectionPath}/${docSnap.id}/${subcollectionName}`);
      }

      // Delete the document itself
      await deleteDoc(docRef);
      console.log(`Deleted document at ${collectionPath}/${docSnap.id}`);
    }
  }
  catch (error) {
    console.error(`Error deleting collection at ${collectionPath}:`, error);
    throw error;
  }
}

// Main function to delete all user-related data
async function deleteUserFirestore(user) {
  const userDocPath = `users/${user.uid}`;
  const userDocRef = doc(db, userDocPath);

  try {
    const knownSubcollections = ["uploads"];
    for (const subcollectionName of knownSubcollections) {
      await deleteCollection(db, `${userDocPath}/${subcollectionName}`);
    }

    // Now delete the user document itself after all subcollections are deleted
    await deleteDoc(userDocRef);
    console.log(`User document deleted successfully: ${userDocPath}`);
  }
  catch (error) {
    console.error(`Error deleting user document and subcollections:`, error);
    throw error;
  }
}

export { deleteFirestoreImage, getUserFiles, deleteUserFirestore };