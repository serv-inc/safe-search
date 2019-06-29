/** @fileinfo clicks safe search button as a fallback */
var script = document.createElement('script');
script.textContent = 'document.querySelector("#ss-bimodal-strict").click(); console.log("SAFER")';
(document.head||document.documentElement).appendChild(script);
script.remove();

