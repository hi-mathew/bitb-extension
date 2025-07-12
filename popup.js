document.getElementById("analyzeBtn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  console.log("[BitB Extension] Sending message to content.js");
  chrome.tabs.sendMessage(tab.id, { action: "extractAndDetectBitB" }, async (response) => {
    console.log("[BitB Extension] Response from content.js:", response);

    if (!response || !response.success) {
      document.getElementById("result").innerText = "⚠️ Feature extraction failed.";
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/api/bitb/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features: response.features })
      });

      const data = await res.json();
      console.log("[BitB Extension] Server response:", data);
      document.getElementById("result").innerText = `✅ ${data.message} (Score: ${data.score})`;
    } catch (err) {
      console.error("BitB detection failed:", err);
      document.getElementById("result").innerText = "⚠️ Could not contact server.";
    }
  });
});
