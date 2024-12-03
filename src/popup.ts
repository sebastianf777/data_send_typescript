// Define the Log interface at the top
interface Log {
  timestamp: string;
  message: string;
}

document.addEventListener('DOMContentLoaded', () => {
  // const prefixInput = document.getElementById('prefix') as HTMLInputElement;
  // const saveButton = document.getElementById('savePrefix') as HTMLButtonElement;
  const errorDisplay = document.getElementById('errorDisplay') as HTMLElement;
  const ipDisplay = document.getElementById('ipDisplay') as HTMLElement;
  const logDisplay = document.getElementById('logDisplay') as HTMLElement;


  const sendButton = document.getElementById('sendButton');

  if (sendButton) {
    sendButton.addEventListener('click', () => {
      // Call function to log IP with the stored prefixes and states
      chrome.runtime.sendMessage({ action: 'logIpWithPrefix' }, (response) => {
        if (response && response.status === 'success') {
          console.log('Request to log IP was successful.');
          displayLogs();
        } else {
          console.error('Failed to request log IP.');
        }
      });
    });
  }

  // Set default values for Prefix B and Prefix C
  chrome.storage.local.get(['prefixB', 'prefixC'], (data) => {
    if (!data.prefixB) {
      chrome.storage.local.set({ prefixB: 'noc' });
    }
    if (!data.prefixC) {
      chrome.storage.local.set({ prefixC: 'aur' });
    }
  });

  // Function to display errors in the popup
  function displayError(message: string) {
    errorDisplay.textContent = message;
  }

  // Elements for Prefix A
  const prefixAInput = document.getElementById('prefixA') as HTMLInputElement;
  const savePrefixAButton = document.getElementById('savePrefixA');

  // Elements for Prefix B
  const prefixBInput = document.getElementById('prefixB') as HTMLInputElement;
  const toggleStateBButton = document.getElementById('toggleStateB');
  const stateBDisplay = document.getElementById('stateBDisplay');

  // Elements for Prefix C
  const prefixCInput = document.getElementById('prefixC') as HTMLInputElement;
  const toggleStateCButton = document.getElementById('toggleStateC');
  const stateCDisplay = document.getElementById('stateCDisplay');

  // Load stored values on startup
  chrome.storage.local.get(['prefixA', 'prefixB', 'stateB', 'prefixC', 'stateC'], (data) => {
    prefixAInput.value = data.prefixA || '';
    prefixBInput.value = data.prefixB || '';
    prefixCInput.value = data.prefixC || '';
    if (stateBDisplay) {
      stateBDisplay.innerText = `State: ${data.stateB || 'F'}`;
    }
    if (stateCDisplay) {
      stateCDisplay.innerText = `State: ${data.stateC || 'F'}`;
    }
  });

  // Save Prefix A
  savePrefixAButton?.addEventListener('click', () => {
    const prefixA = prefixAInput.value;
    chrome.storage.local.set({ prefixA }, () => {
      console.log('Prefix A saved:', prefixA);
    });
  });

  // Toggle State B
  toggleStateBButton?.addEventListener('click', () => {
    chrome.storage.local.get('stateB', (data) => {
      const newStateB = data.stateB === 'B' ? 'F' : 'B';
      chrome.storage.local.set({ stateB: newStateB }, () => {
        if (stateBDisplay) {
          stateBDisplay.innerText = `State: ${newStateB}`;
        }
        console.log('State B toggled to:', newStateB);
      });
    });
  });

  // Toggle State C
  toggleStateCButton?.addEventListener('click', () => {
    chrome.storage.local.get('stateC', (data) => {
      const newStateC = data.stateC === 'B' ? 'F' : 'B';
      chrome.storage.local.set({ stateC: newStateC }, () => {
        if (stateCDisplay) {
          stateCDisplay.innerText = `State: ${newStateC}`;
        }
        console.log('State C toggled to:', newStateC);
      });
    });
  });

  // Save Prefix B and C inputs as well
  prefixBInput.addEventListener('change', () => {
    const prefixB = prefixBInput.value;
    chrome.storage.local.set({ prefixB }, () => {
      console.log('Prefix B saved:', prefixB);
    });
  });

  prefixCInput.addEventListener('change', () => {
    const prefixC = prefixCInput.value;
    chrome.storage.local.set({ prefixC }, () => {
      console.log('Prefix C saved:', prefixC);
    });
  });

  // // Retrieve and display the stored prefix when the popup loads
  // chrome.storage.local.get('profilePrefix', (data) => {
  //   if (data.profilePrefix) {
  //     prefixInput.value = data.profilePrefix;
  //     console.log('Prefix retrieved:', data.profilePrefix);
  //   } else {
  //     console.log('No prefix found in storage.');
  //   }
  // });

  // // Save the prefix when the save button is clicked
  // saveButton.addEventListener('click', () => {
  //   const prefix = prefixInput.value;
  //   if (prefix) {
  //     chrome.storage.local.set({ profilePrefix: prefix }, () => {
  //       console.log('Prefix saved:', prefix);
  //       alert('Prefix saved successfully!');
  //       window.close(); // Close the popup after saving
  //     });
  //   } else {
  //     const errorMsg = 'Please enter a prefix.';
  //     console.log(errorMsg);
  //     displayError(errorMsg);
  //   }
  // });

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

    // Function to fetch and display logs
  function displayLogs() {
    chrome.storage.local.get('logs', (data) => {
      const logs: Log[] = (data.logs || []) as Log[];
      logDisplay.innerHTML = logs
        .map((log) => `<p>[${log.timestamp}] ${log.message}</p>`)
        .join('');
    });
  }

  // Initial display of logs
  displayLogs();
});
