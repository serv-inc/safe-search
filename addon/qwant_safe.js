/** @fileinfo clicks safe search button as a fallback */
function setSafe() {
  var script = document.createElement('script');
  script.textContent = `applicationState.user.userSetting.safeSearch = 2;
delete siteConfiguration.safeSearchModes[0];
delete siteConfiguration.safeSearchModes[1];`;
  (document.head||document.documentElement).appendChild(script);
  script.remove();
}

setSafe();
