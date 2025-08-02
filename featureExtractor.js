function extractBitBFeatures() {
  const features = [];

  // Feature 1: has_iframe
  const iframes = document.getElementsByTagName("iframe");
  const hasIframe = iframes.length > 0 ? 1.0 : 0.0;
  features.push(hasIframe);

  // Feature 2: dom_similarity (windowSizeRatio)
  const screenArea = window.screen.width * window.screen.height;
  const windowArea = window.innerWidth * window.innerHeight;
  const windowSizeRatio = screenArea > 0 ? windowArea / screenArea : 0.0;
  features.push(Number(windowSizeRatio.toFixed(2)));

  // Feature 3: has_dark_pattern (overlay login UI)
  const suspiciousSelectors = ["#login", ".login-popup", "#fake-login", ".modal-login"];
  const hasOverlayLoginUI = suspiciousSelectors.some(sel => document.querySelector(sel)) ? 1.0 : 0.0;
  features.push(hasOverlayLoginUI);

  // Feature 4: num_login_forms (iframe depth)
  let maxDepth = 0;
  function checkIframeDepth(doc, depth = 0) {
    const frames = doc.getElementsByTagName("iframe");
    for (let i = 0; i < frames.length; i++) {
      try {
        const childDoc = frames[i].contentDocument;
        if (childDoc) {
          maxDepth = Math.max(maxDepth, depth + 1);
          checkIframeDepth(childDoc, depth + 1);
        }
      } catch (e) {
        // Ignore cross-origin
      }
    }
  }
  checkIframeDepth(document);
  features.push(maxDepth);

  // Feature 5: has_invisible_input
  const inputFields = document.querySelectorAll("input[type='text'], input[type='password']");
  const hasInputFields = inputFields.length > 0 ? 1.0 : 0.0;
  features.push(hasInputFields);

  // Feature 6: has_brand_logo (login keywords)
  const loginKeywords = ["login", "sign in", "user", "username", "password"];
  const pageText = document.body.innerText.toLowerCase();
  const hasLoginKeywords = loginKeywords.some(keyword => pageText.includes(keyword)) ? 1.0 : 0.0;
  features.push(hasLoginKeywords);

  // Feature 7: has_keyboard_traps (keydown event listener detection)
  let hasKeyboardTraps = 0.0;
  function detectKeyboardTrap() {
    let trapped = false;
    const handler = () => {
      trapped = true;
    };
    document.body.addEventListener("keydown", handler);
    const keyboardEvent = new KeyboardEvent("keydown", { key: "Tab" });
    document.body.dispatchEvent(keyboardEvent);
    document.body.removeEventListener("keydown", handler);
    return trapped ? 1.0 : 0.0;
  }
  hasKeyboardTraps = detectKeyboardTrap();
  features.push(hasKeyboardTraps);

  // Feature 8: page_text_similarity (hostname entropy)
  const hostname = window.location.hostname;
  const entropy = hostname.length > 0 ? uniqueChars(hostname) / hostname.length : 0.0;
  features.push(Number(entropy.toFixed(2)));

  // Feature 9: has_suspicious_js (suspicious keywords in URL)
  const suspiciousUrlKeywords = ["login", "secure", "bank", "signin", "verify"];
  const currentUrl = window.location.href.toLowerCase();
  const suspiciousCount = suspiciousUrlKeywords.filter(k => currentUrl.includes(k)).length;
  const suspiciousKeywordScore = suspiciousCount > 0 ? 1.0 : 0.0;
  features.push(suspiciousKeywordScore);

  // Feature 10: domain_whitelisted (popular site match)
  const knownPopularSites = [
    "google.com",
    "accounts.google.com",
    "mail.google.com",
    "facebook.com",
    "www.facebook.com",
    "linkedin.com",
    "www.linkedin.com",
    "apple.com",
    "amazon.com",
    "microsoft.com",
    "live.com"
  ];
  function isPopularDomain(url) {
    try {
      const hostname = new URL(url).hostname;
      return knownPopularSites.some(domain => hostname.endsWith(domain));
    } catch {
      return false;
    }
  }
  features.push(isPopularDomain(window.location.href) ? 1.0 : 0.0);

  // Feature 11: accesses_window_top (login form action mismatch)
  let loginFormMismatch = 0.0;
  const forms = document.querySelectorAll("form");
  const loginForm = Array.from(forms).find(form => {
    const inputs = form.querySelectorAll("input[type='password']");
    return inputs.length > 0;
  });
  if (loginForm) {
    const action = loginForm.getAttribute("action");
    if (action && !action.includes(window.location.hostname)) {
      loginFormMismatch = 1.0;
    }
  }
  features.push(loginFormMismatch);

  return features;
}

function uniqueChars(str) {
  return new Set(str).size;
}
