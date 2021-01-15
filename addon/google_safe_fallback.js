/** @fileinfo clicks safe search button as a fallback */
const scr = document.createElement('script');
scr.textContent = ```document.querySelector('a[href*="safeui=on"')?.click();```;
(document.head||document.documentElement).appendChild(script);
scr.remove();
