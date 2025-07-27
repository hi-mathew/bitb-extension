function extractBitBFeatures() {
  const features = [];

  // Feature 1: hasIframe
  const iframes = document.getElementsByTagName("iframe");
  const hasIframe = iframes.length > 0 ? 1.0 : 0.0;
  features.push(hasIframe);

  // Feature 2: windowSizeRatio (window area / screen area)
  const screenArea = window.screen.width * window.screen.height;
  const windowArea = window.innerWidth * window.innerHeight;
  const windowSizeRatio = screenArea > 0 ? windowArea / screenArea : 0.0;
  features.push(Number(windowSizeRatio.toFixed(2)));

  // Feature 3: hasOverlayLoginUI
  const suspiciousSelectors = ["#login", ".login-popup", "#fake-login", ".modal-login"];
  const hasOverlayLoginUI = suspiciousSelectors.some(sel => document.querySelector(sel)) ? 1.0 : 0.0;
  features.push(hasOverlayLoginUI);

  // Feature 4: iframeDepth (nested iframes)
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

  // Feature 5: hasInputFields
  const inputFields = document.querySelectorAll("input[type='text'], input[type='password']");
  const hasInputFields = inputFields.length > 0 ? 1.0 : 0.0;
  features.push(hasInputFields);

  // Feature 6: hasLoginKeywords in body text
  const loginKeywords = ["login", "sign in", "user", "username", "password"];
  const pageText = document.body.innerText.toLowerCase();
  const hasLoginKeywords = loginKeywords.some(keyword => pageText.includes(keyword)) ? 1.0 : 0.0;
  features.push(hasLoginKeywords);

  // Feature 7: urlMismatch (login form posts to different domain)
  let urlMismatch = 0.0;
  const forms = document.querySelectorAll("form");
  forms.forEach(form => {
    const action = form.getAttribute("action");
    if (action && !action.startsWith(window.location.origin)) {
      urlMismatch = 1.0;
    }
  });
  features.push(urlMismatch);

  // Feature 8: hostnameEntropy (how random or unusual the domain is)
  const hostname = window.location.hostname;
  const entropy = hostname.length > 0 ? uniqueChars(hostname) / hostname.length : 0.0;
  features.push(Number(entropy.toFixed(2)));

  // Feature 9: suspiciousKeywordScore in URL (e.g., "login", "secure", "bank")
  const suspiciousUrlKeywords = ["login", "secure", "bank", "signin", "verify"];
  const currentUrl = window.location.href.toLowerCase();
  const suspiciousCount = suspiciousUrlKeywords.filter(k => currentUrl.includes(k)).length;
  const suspiciousKeywordScore = suspiciousCount > 0 ? 1.0 : 0.0;
  features.push(suspiciousKeywordScore);

  // Feature 10: isPopularSite (matches against a whitelist of popular domains)
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

  // Feature 11: loginFormActionMismatch (login form action points to external domain)
  let loginFormMismatch = 0.0;
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
