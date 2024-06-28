document.getElementById('reset-password-form').addEventListener('submit', function(event) {
  event.preventDefault();
  const email = document.getElementById('email').value;

  fetch('/reset_password_request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `email=${encodeURIComponent(email)}`,
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Redirect to the reset password form page
      window.location.href = '/reset_password_request';
    } else {
      alert('Error: ' + data.error);
    }
  })
  .catch(error => console.error('Error:', error));
});