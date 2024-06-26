document.getElementById('signin-form').addEventListener('submit', async (event) => {

  event.preventDefault(); // Prevent the form from submitting the default way

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const formData = new FormData(event.target);
  try {
    const response = await fetch('/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: new URLSearchParams(formData),
      // body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      window.location.href = '/homepage'; // Redirect to homepage
    }
  }
  catch (error)
  {
  }
});





const togglePassword = document.getElementById('togglePassword');
  togglePassword.addEventListener('click', () => {
    // Toggle the type attribute using getAttribute() and setAttribute()
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
    
    // Toggle the eye / eye slash icon
    togglePassword.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
  });