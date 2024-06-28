document.addEventListener('DOMContentLoaded', () => {
  const resetPasswordForm = document.getElementById('reset-password-form');

  resetPasswordForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const token = document.getElementById('token').value;

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

      fetch('/reset_password', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: `token=${encodeURIComponent(token)}&password=${encodeURIComponent(password)}`,
			})
				.then(response => response.json())
				.then(data => {
					if (data.success) {
						alert('Password reset successful. You can now log in with your new password.');
						window.location.href = '/signin';
					} else {
						alert('Error: ' + data.error);
					}
				})
				.catch(error => console.error('Error:', error));
  });

  // Select all elements with the class password-toggle
  const toggleIcons = document.querySelectorAll('.password-toggle');
  
  toggleIcons.forEach(toggleIcon => {
    toggleIcon.addEventListener('click', () => {
      // Find the associated password input
      const input = toggleIcon.previousElementSibling;
      const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
      input.setAttribute('type', type);
      
      // Toggle the eye / eye-slash icon
      toggleIcon.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    });
  });
});
