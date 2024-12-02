import { API_KEY } from './config';

// Listen for when a new tab is created or updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    logIpWithPrefix();
  }
});

// Additionally, trigger when Chrome starts or extension is loaded
chrome.runtime.onStartup.addListener(() => {
  logIpWithPrefix();
});

// Function to get IP and log it with the prefix
function logIpWithPrefix() {
  // Get the prefix from Chrome local storage
  chrome.storage.local.get("profilePrefix", (data) => {
    if (data.profilePrefix) {
      // Get the IP and send it to the server if it is not an excluded IP
      fetch("https://api.ipify.org?format=json")
        .then(response => response.json())
        .then(ipData => {
          const excludedIps = ["192.168.0.1", "127.0.0.1"];  // Add the IPs you want to exclude here
          if (!excludedIps.includes(ipData.ip)) {
            sendToServer(data.profilePrefix, ipData.ip);
          } else {
            const logMessage = `IP ${ipData.ip} is in the exclusion list. Data not sent.`;
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
      const logMessage = 'No prefix found in storage.';
      console.log(logMessage);
      saveLog(logMessage);
    }
  });
}

function sendToServer(prefix: string, ip: string) {
  const timestamp = new Date().toISOString();
  fetch('https://vercel-node-server-api.vercel.app/api/store-ip', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify({ prefix, ip, timestamp })
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
  chrome.storage.local.get("logs", (data) => {
    const logs = data.logs || [];
    logs.push({ message, timestamp: new Date().toISOString() });
    chrome.storage.local.set({ logs }, () => {
      console.log('Log saved:', message);
    });
  });
}
