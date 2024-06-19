function showAlert(message, type = 'info')
{
	alert(`[${type.toUpperCase()}] ${message}`);
}

async function fetchData(url, options = {})
{
	try
	{
	  const response = await fetch(url, options);
	  if (!response.ok)
		throw new Error(`Error: ${response.statusText}`);
	  return await response.json();
	}
	catch (error)
	{
	  console.error('Fetch error:', error);
	  showAlert(error.message, 'error');
	}
}