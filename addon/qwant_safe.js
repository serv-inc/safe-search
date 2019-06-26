/** @fileinfo clicks safe search button as a fallback */
var script = document.createElement('script');
script.textContent = 'applicationState.user.userSetting.safeSearch = 2; console.log("SAFER")';
(document.head||document.documentElement).appendChild(script);
script.remove();

