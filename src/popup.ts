document.getElementById("savePrefix")?.addEventListener("click", () => {
  console.log("Save button clicked.");  // Added log to check if the button is working
  const prefix = (document.getElementById("prefix") as HTMLInputElement).value;
  
  if (prefix) {
    chrome.storage.local.set({ profilePrefix: prefix }, () => {
      console.log("Prefix saved:", prefix);
      // Attempt to close the popup
      window.close();
    });
  } else {
    console.log("No prefix entered.");
  }
});

  