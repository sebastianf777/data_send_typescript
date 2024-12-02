// Define the Log interface at the top
interface Log {
  timestamp: string;
  message: string;
}

document.addEventListener('DOMContentLoaded', () => {
  const prefixInput = document.getElementById('prefix') as HTMLInputElement;
  const saveButton = document.getElementById('savePrefix') as HTMLButtonElement;
  const errorDisplay = document.getElementById('errorDisplay') as HTMLElement;
  const ipDisplay = document.getElementById('ipDisplay') as HTMLElement;
  const logDisplay = document.getElementById('logDisplay') as HTMLElement;

  // Function to display errors in the popup
  function displayError(message: string) {
    errorDisplay.textContent = message;
  }

  // Retrieve and display the stored prefix when the popup loads
  chrome.storage.local.get('profilePrefix', (data) => {
    if (data.profilePrefix) {
      prefixInput.value = data.profilePrefix;
      console.log('Prefix retrieved:', data.profilePrefix);
    } else {
      console.log('No prefix found in storage.');
    }
  });

  // Save the prefix when the save button is clicked
  saveButton.addEventListener('click', () => {
    const prefix = prefixInput.value;
    if (prefix) {
      chrome.storage.local.set({ profilePrefix: prefix }, () => {
        console.log('Prefix saved:', prefix);
        alert('Prefix saved successfully!');
        window.close(); // Close the popup after saving
      });
    } else {
      const errorMsg = 'Please enter a prefix.';
      console.log(errorMsg);
      displayError(errorMsg);
    }
  });

  // Fetch and display the IP address in the popup
  fetch('https://api.ipify.org?format=json')
    .then((response) => response.json())
    .then((data) => {
      ipDisplay.textContent = `Your IP: ${data.ip}`;
    })
    .catch((error) => {
      const errorMsg = 'Error fetching IP address. Please try again.';
      console.error(error);
      displayError(errorMsg);
    });
    
    chrome.storage.local.get('logs', (data) => {
      // Cast the retrieved data as Log[]
      const logs: Log[] = (data.logs || []) as Log[];
    
      logDisplay.innerHTML = logs
        .map((log) => `<p>[${log.timestamp}] ${log.message}</p>`)
        .join('');
    });
    
});
