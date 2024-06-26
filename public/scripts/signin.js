document.addEventListener('DOMContentLoaded', () => {
  const signinForm = document.getElementById('signin-form');

  signinForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the form from submitting the default way

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        window.location.href = '/homepage'; // Redirect to homepage
      } else {
        displayError(result.error);
      }
    } catch (error) {
      displayError('An error occurred during sign in.');
    }
  });

  function displayError(message) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';

    // Clear any previous error classes
    document.getElementById('email').classList.remove('error');
    document.getElementById('password').classList.remove('error');
    document.getElementById('email-error').style.display = 'none';
    document.getElementById('password-error').style.display = 'none';

    // Display specific error messages
    if (message.includes('email')) {
      document.getElementById('email').classList.add('error');
      document.getElementById('email-error').style.display = 'block';
    }

    if (message.includes('password')) {
      document.getElementById('password').classList.add('error');
      document.getElementById('password-error').style.display = 'block';
    }
  }
});