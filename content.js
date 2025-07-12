chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractAndDetectBitB") {
    console.log("[BitB Extension] Message received: extractAndDetectBitB");

    try {
      const features = extractBitBFeatures(); // Make sure featureExtractor.js is loaded
      console.log("[BitB Extension] Extracted features:", features);

      fetch("http://localhost:8080/api/bitb/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features })
      })
        .then(res => res.json())
        .then(result => {
          console.log("[BitB Extension] Detection result:", result);
          alert(`🛡️ Prediction: ${result.message} (Score: ${result.score})`);
        })
        .catch(err => {
          console.error("[BitB Extension] Detection failed:", err);
        });

    } catch (err) {
      console.error("[BitB Extension] Feature extraction failed:", err);
    }
  }
});
