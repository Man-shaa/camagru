document.addEventListener('DOMContentLoaded', () => {
  console.log('Register page loaded')
  const registerForm = document.getElementById('register-form');

  registerForm.addEventListener('submit', async (event) => {
    console.log('Form submitted');
    event.preventDefault(); // Prevent the form from submitting the default way

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const requestBody = { email, password };
    console.log('Request body:', requestBody);

    try {
      const response = await fetch('/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('User created:', result);
      } else {
        const error = await response.json();
        console.error('Failed to create user:', error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });
});