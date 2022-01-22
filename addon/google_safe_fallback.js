/** @fileinfo clicks safe search button as a fallback */
const script = document.createElement("script");
script.textContent = `document.querySelector('a[href*="safeui=on"')?.click();`;
(document.head || document.documentElement).appendChild(script);
script.remove();
