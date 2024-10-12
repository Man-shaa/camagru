import { getFirestore, getDoc, updateDoc, arrayUnion, arrayRemove, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { getCurrentUser } from "../auth.js";
import { deleteFirebaseImage } from "./firebase-db.js";
import { deleteFirestoreImage } from "./firestore-db.js";

const db = getFirestore();
const likeCountElement = document.getElementById('like-count');

// Close popup image listener using event delegation
document.querySelector('.popup-image span').onclick = () => {
		document.querySelector('.popup-image').style.display = 'none';
};

// Display popup image listener using event delegation
document.querySelector('.images-container').addEventListener('click', (event) => {
	if (event.target.tagName === 'IMG') {
		const clickedImage = event.target;
		const fileName = clickedImage.dataset.fileName;

		const popupImageContainer = document.querySelector('.popup-image');
		popupImageContainer.style.display = 'block';
		popupImageContainer.querySelector('img').src = clickedImage.src;
		popupImageContainer.querySelector('.image-title').textContent = fileName;

		const deleteBtn = document.getElementById('delete-button');
		deleteBtn.style.display = 'none';

		const docId = clickedImage.getAttribute('data-doc-id');
		const imagePopupRef = doc(db, 'images', docId);

		getDoc(imagePopupRef).then((docSnap) => {
			if (docSnap.exists()) {
				const userId = docSnap.data().userId;
				const currentUser = getCurrentUser();
				if (currentUser && currentUser.uid === userId) {
					deleteBtn.style.display = 'block';
					deleteBtn.onclick = () => {
						const uniqueFileName = docSnap.data().uniqueImageName;
						deleteFirestoreImage(imagePopupRef, userId, uniqueFileName);
						deleteFirebaseImage(uniqueFileName);
					};
				}
				updateLikeCount(docSnap);
				handleLikeClick(docId);
				displayComments(docId);

				document.getElementById('comment-button').onclick = () => {
					addComment(docId);
				};
			} else {
				console.log("Document does not exist");
			}
		});
	}
});


function updateLikeCount(docSnap) {
	const currentLikes = docSnap.data().likes || 0;
	likeCountElement.textContent = `${currentLikes} Likes`;
}

function handleLikeClick(docId) {
	const likeButton = document.getElementById('like-button');

	// Add event listener
	likeButton.onclick = () => {
			const currentUser = getCurrentUser();
			if (!currentUser) {
					console.log('User not logged in');
					return;
			}
	
			const imageDocRef = doc(db, 'images', docId);

			// Fetch the latest data from Firestore
			getDoc(imageDocRef).then((docSnap) => {
					if (docSnap.exists()) {
							const likedBy = docSnap.data().likedBy || [];
							const currentLikes = docSnap.data().likes || 0;
	
							// not liked state
							if (likedBy.includes(currentUser.uid)) {
									likeCountElement.textContent = `${currentLikes - 1} Likes`;
									updateLikes(docId, currentLikes - 1, arrayRemove(currentUser.uid));
	
									// Update button state
									likeButton.classList.remove('liked');
									likeButton.classList.add('unliked');

								}
								// liked state
								else {
									likeCountElement.textContent = `${currentLikes + 1} Likes`;
									updateLikes(docId, currentLikes + 1, arrayUnion(currentUser.uid));
									
									// Update button state
									likeButton.classList.remove('unliked');
									likeButton.classList.add('liked');

									// send mail
									const imageName = docSnap.data().fileName || "";
									sendEmail(currentUser.email, imageName, "liked");
								}
						}
				});
			};

	function updateLikes(docId, newLikes, likeAction) {
		const imageDocRef = doc(db, 'images', docId);
		const validLikes = newLikes >= 0 ? newLikes : 0;

		updateDoc(imageDocRef, {
			likes: validLikes,
			likedBy: likeAction
		}).catch((error) => {
			console.error("Error updating likes:", error);
		});
	}
}

function sendEmail(userEmail, imageName, action, commentText) {
	const subject = `Image ${action} !`;
	let message = `A user has ${action} your image \"${imageName}\".`;
	if (arguments.length === 4)
		message += `\n\nComment : ${commentText}`;

	fetch(`/send_email/${userEmail}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			subject: subject,
			message: message
		})
	})
	.then(response => {
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		return response.text();
	})
	.catch(error => {
		console.error('Error sending email:', error);
	});
}

// Function to display comments for a specific image
function displayComments(docId) {
	const imageDocRef = doc(db, 'images', docId);
	const commentsListElement = document.getElementById('comments-list');

	getDoc(imageDocRef).then((docSnap) => {
		if (docSnap.exists()) {
			const comments = docSnap.data().comments || [];
			commentsListElement.innerHTML = ''; // Clear previous comments

			comments.forEach(comment => {
				const commentElement = document.createElement('div');
				commentElement.classList.add('comment');
				const userDocRef = doc(db, 'users', comment.userId);
				getDoc(userDocRef).then((userDocSnap) => {
					if (userDocSnap.exists()) {
						const username = userDocSnap.data().username;
						commentElement.textContent = `${username}: ${comment.commentText}`;
					}
					else {
						console.error("Couldn't find username for user:", comment.userId);
					}
					commentsListElement.appendChild(commentElement);
				}).catch(error => {
					console.error('Error fetching user data:', error);
					commentElement.textContent = `${comment.userId}: ${comment.commentText}`;
					commentsListElement.appendChild(commentElement);
				});
			});
		}
		else
			commentsListElement.innerHTML = '<p>No comments yet.</p>';
	}).catch(error => {
		console.error('Error fetching comments:', error);
	});
}

// Function to add a new comment
function addComment(docId) {
	const currentUser = getCurrentUser();
	if (!currentUser) {
		console.log('User not logged in');
		return;
	}

	const commentInput = document.getElementById('comment-input');
	const commentText = commentInput.value.trim();

	if (commentText === '') {
		console.log('Comment cannot be empty');
		return;
	}

	const imageDocRef = doc(db, 'images', docId);

	// Update Firestore with the new comment
	updateDoc(imageDocRef, {
		comments: arrayUnion({
			userId: currentUser.uid,
			commentText: commentText,
			timestamp: new Date().toISOString()
		})
	}).then((docData) => {
		// Clear the input field after submitting the comment
		commentInput.value = '';
		// Refresh comments to display the new one
		displayComments(docId);

		getDoc(imageDocRef)
		.then((docSnap) => {
			const imageName = docSnap.data().fileName || "";
			sendEmail(currentUser.email, imageName, "commented", commentText);
		});
	}).catch(error => {
		console.error('Error adding comment:', error);
	});
}
