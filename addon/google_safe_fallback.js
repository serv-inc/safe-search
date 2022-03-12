/** @fileinfo clicks safe search button as a fallback */
document
  .querySelector('a[href*="/safesearch"]')
  ?.parentNode?.parentNode?.parentNode?.querySelector("input")
  ?.click();

const script = document.createElement("script");
script.textContent = `document.querySelector('a[href*="/safesearch"]')?.parentNode?.parentNode?.parentNode?.querySelector("input")?.click();`;
(document.head || document.documentElement).appendChild(script);
script.remove();
