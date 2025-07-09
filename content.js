(async function () {
  try {
    const iframes = document.getElementsByTagName("iframe");
    let iframeCount = iframes.length;

    let hasLoginForm = 0;
    let windowRatio = 0;

    if (iframeCount > 0) {
      const iframe = iframes[0];
      const rect = iframe.getBoundingClientRect();
      windowRatio = (rect.width * rect.height) / (window.innerWidth * window.innerHeight);

      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const inputs = iframeDoc.getElementsByTagName("input");
        for (let i = 0; i < inputs.length; i++) {
          if (inputs[i].type.toLowerCase() === "password") {
            hasLoginForm = 1;
            break;
          }
        }
      } catch (e) {
        // cross-origin access blocked
        console.warn("Iframe analysis skipped (CORS).");
      }
    }

    const features = [windowRatio, iframeCount, hasLoginForm];

    const response = await fetch("http://localhost:8080/api/bitb/detect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ features: features })
    });

    const result = await response.json();

    if (result.prediction === 1) {
      alert("⚠️ BitB Phishing Detected!\n" + result.message);
    } else {
      console.log("✅ Page looks clean: ", result.message);
    }

  } catch (err) {
    console.error("BitB detection failed:", err);
  }
})();
