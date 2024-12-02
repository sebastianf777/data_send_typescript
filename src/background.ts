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
              console.log(`IP ${ipData.ip} is in the exclusion list. Data not sent.`);
            }
          });
      }
    });
  }
  
  function sendToServer(prefix: string, ip: string) {
    const timestamp = new Date().toISOString();
    fetch('http://localhost:3000/api/store-ip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prefix, ip, timestamp })
    })
      .then(response => response.json())
      .then(data => {
        console.log('Data sent to server:', data);
      })
      .catch(error => {
        console.error('Error sending data to server:', error);
      });
  }
  