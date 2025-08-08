// Listen for message from popup or background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractAndDetectBitB") {
    try {
      const features = extractBitBFeatures();
      console.log("✅ Extracted Features:", features);
      console.log("✅ Feature Length:", features.length); 
      sendFeaturesToBackend(features)
        .then(result => {
          displayDetectionBanner(result.prediction, result.score);
          sendResponse({ success: true, result });
        })
        .catch(err => {
          console.error("BitB detection failed:", err);
          sendResponse({ success: false, error: err.message });
        });
    } catch (err) {
      console.error("Feature extraction failed:", err);
      sendResponse({ success: false, error: err.message });
    }

    return true; // keep sendResponse alive for async
  }
});

// Send features to Spring Boot backend for ONNX prediction
function sendFeaturesToBackend(features) {
  return fetch("http://localhost:8080/api/bitb/detect", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ features })
  })
    .then(res => {
      if (!res.ok) throw new Error("Server error");
      return res.json();
    });
}

// Show a banner at the top of the page with detection result
function displayDetectionBanner(prediction, score) {
  const banner = document.createElement("div");
  banner.style.position = "fixed";
  banner.style.top = "0";
  banner.style.left = "0";
  banner.style.right = "0";
  banner.style.padding = "12px";
  banner.style.zIndex = "9999";
  banner.style.fontSize = "16px";
  banner.style.fontWeight = "bold";
  banner.style.textAlign = "center";
  banner.style.color = "#fff";
  banner.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
  banner.style.fontFamily = "sans-serif";

  const percentage = (score * 100).toFixed(1);
  let message = "";

  // ✅ Use predicted class from model
  if (prediction === 2) {
    banner.style.backgroundColor = "#d32f2f"; // red
    message = `🚨 BitB Attack Detected`;
  } else if (prediction === 1) {
    banner.style.backgroundColor = "#f57c00"; // orange
    message = `⚠️ Suspicious Behavior Detected`;
  } else {
    banner.style.backgroundColor = "#388e3c"; // green
    message = `✅ Page Verified as Safe`;
  }

  banner.textContent = message;
  document.body.appendChild(banner);

  setTimeout(() => {
    banner.remove();
  }, 5000);
}


