/** @fileinfo logs user out if mode == 0 */
let managedPolyfill = (chrome.storage.managed || { get: (a, b) => b({}) });

let DELAY = 250;
var countdown = 5000;

/** runs ifZeroCallback if settings.youtube is 0 (under18-mode) */
function getYoutubeState(ifZeroCallback) {
  managedPolyfill.get(null, result => {
    if ("youtube" in result) {
      if (result.youtube === 0) {
        ifZeroCallback();
        return;
      }
    } else {
      chrome.storage.local.get(null, result => {
        if ("youtube" in result) {
          if ( result.youtube === 0) {
            ifZeroCallback();
          }
        }
      });
    }
  });
}

/** runs when page has fully loaded, readystate did not work */
function runOnLoad(callback) {
  if (document.querySelector("#avatar-btn") !== null) {
    callback();
  } else {
    if ( countdown > 0 ) {
      countdown -= DELAY;
      setTimeout(() => runOnLoad(callback), DELAY);
    }
  }
}

/** logs you out of youtube */
function logOut() {
  var script = document.createElement('script');
  script.defer = true;
  script.textContent = `var loggedin = document.querySelector("#avatar-btn");
if (loggedin !== null) {
  loggedin.click();
  var callbackId = setInterval(() => {
    document.querySelector('a[href="/logout"]').click()
    clearInterval(callbackId);
  }, 100);
}`;
  (document.head||document.documentElement).appendChild(script);
  script.remove();
}

getYoutubeState(() => runOnLoad(logOut));
