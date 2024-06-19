import { showAlert, fetchData } from './common.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log("register.js loaded")
  const registerForm = document.getElementById('register-form');

  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the form from submitting the default way

    console.log('Form submitted!'); // Check if form submission is intercepted

    const formData = new FormData(registerForm);
    const data = {
      email: formData.get('email'),
      password: formData.get('password')
    };

    console.log('Form data:', data); // Check if form data is correctly extracted

    try
    {
      const result = await fetchData('/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (result)
        showAlert(result.message, 'success');
    }
    catch (error)
    {
      console.error('Error:', error); // Log any errors that occur
      showAlert('An error occurred. Please try again.', 'error');
    }
  });
});