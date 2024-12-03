import { API_KEY, EXCLUDED_IPS } from './config';

// // Trigger when Chrome starts or the extension is loaded
// chrome.runtime.onStartup.addListener(() => {
//   // Clear logs on startup
//   chrome.storage.local.remove('logs', () => {
//     console.log('Logs cleared on startup');
//   });

//   logIpWithPrefix();
// });

// // Listen for storage changes and send updated information
// chrome.storage.onChanged.addListener((changes, namespace) => {
//   if (namespace === 'local') {
//     // If any of the relevant keys have changed, get the full data and send to the server
//     if (changes.prefixA || changes.prefixB || changes.stateB || changes.prefixC || changes.stateC) {
//       logIpWithPrefix();
//     }
//   }
// });

// // Listen for when a new tab is created or updated
// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   if (changeInfo.status === 'complete') {
//     logIpWithPrefix();
//   }
// });

// // Additionally, trigger when Chrome starts or extension is loaded
// chrome.runtime.onStartup.addListener(() => {
//   logIpWithPrefix();
// });

// Listen for messages from popup script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'logIpWithPrefix') {
    logIpWithPrefix();
    sendResponse({ status: 'success' });
  }
});

// Function to get IP and log it with the prefix
function logIpWithPrefix() {
  // Get the prefixes and states from Chrome local storage
  chrome.storage.local.get(['prefixA', 'prefixB', 'stateB', 'prefixC', 'stateC'], (data) => {
    if (data.prefixA || data.prefixB || data.prefixC) {
      // Get the IP and send it to the server along with prefixes and states
      fetch("https://api.ipify.org?format=json")
        .then(response => response.json())
        .then(ipData => {
          const excludedIps = EXCLUDED_IPS ? EXCLUDED_IPS.split(',') : [];  // Add the IPs you want to exclude here
          if (!excludedIps.includes(ipData.ip)) {
            sendToServer(data.prefixA, 
              data.prefixB, 
              data.prefixC, 
              data.stateB, 
              data.stateC,
              ipData.ip);
          } else {
            const logMessage = `IP is in the exclusion list. Data not sent.`;
            console.log(logMessage);
            saveLog(logMessage);
          }
        })
        .catch(error => {
          const logMessage = `Error fetching IP: ${error.message}`;
          console.error(logMessage);
          saveLog(logMessage);
        });
    } else {
      const logMessage = 'No prefixes found in storage.';
      console.log(logMessage);
      saveLog(logMessage);
    }
  });
}

//formating timestamp

function formatTimestamp(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth is 0-indexed, so add 1
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}


function sendToServer(prefixA: string, prefixB: string, prefixC: string, stateB: string, stateC: string, ip: string) {
  const timestamp = formatTimestamp(new Date());
  const body = {
    prefixA,
    prefixB,
    prefixC,
    stateB,
    stateC,
    ip,
    timestamp,
  };
  fetch('https://vercel-node-server-api.vercel.app/api/store-ip', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    } as HeadersInit,
    body: JSON.stringify(body)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    const logMessage = `Data sent to server: ${JSON.stringify(data)}`;
    console.log(logMessage);
    saveLog(logMessage);
  })
  .catch(error => {
    const logMessage = `Error sending data to server: ${error.message}`;
    console.error(logMessage);
    saveLog(logMessage);
  });
}

// Function to save log messages in local storage
function saveLog(message: string) {
  const timestamp = formatTimestamp(new Date()); // Use formatted timestamp here
  chrome.storage.local.get("logs", (data) => {
    const logs = data.logs || [];
    logs.unshift({ message, timestamp}); // Add new log at the beginning
    chrome.storage.local.set({ logs }, () => {
      console.log('Log saved:', message);
    });
  });
}

