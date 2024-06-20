export const showAlert = (message, type) => {
  const alertBox = document.createElement('div');
  alertBox.className = `alert ${type}`;
  alertBox.textContent = message;
  document.body.appendChild(alertBox);

  setTimeout(() => {
    alertBox.remove();
  }, 3000);
};

export const fetchData = async (url, options) => {
  console.log('Fetching data...')

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch error: ', error);
    throw error;
  }
};
