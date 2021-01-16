"use strict";
/* globals chrome */
// licensed under the MPL 2.0 by (github.com/serv-inc)

/** @fileinfo logs user out if mode == 0 */
const managedPolyfill = chrome.storage.managed || { get: (a, b) => b({}) };

const DELAY = 250;
let countdown = 5000;

/** @param ifZeroCallback {function} called if under18-mode */
function getYoutubeState(ifZeroCallback) {
  managedPolyfill.get(null, (result) => {
    if ("youtube" in result) {
      if (result.youtube === 0) {
        ifZeroCallback();
        return;
      }
    } else {
      chrome.storage.local.get(null, (result) => {
        if ("youtube" in result) {
          if (result.youtube === 0) {
            ifZeroCallback();
          }
        }
      });
    }
  });
}

/** runs when page has fully loaded, readystate did not work
 * @param callback {function(): void} call this
 */
function runOnLoad(callback) {
  if (document.querySelector("#avatar-btn") !== null) {
    callback();
  } else {
    if (countdown > 0) {
      countdown -= DELAY;
      setTimeout(() => runOnLoad(callback), DELAY);
    }
  }
}

/** @callback asdf - called if done waiting and #avatar-btn exists *


/** logs you out of youtube */
function logOut() {
  const script = document.createElement("script");
  script.defer = true;
  script.textContent = `var loggedin = document.querySelector("#avatar-btn");
if (loggedin !== null) {
  loggedin.click();
  var callbackId = setInterval(() => {
    document.querySelector('a[href="/logout"]').click()
    clearInterval(callbackId);
  }, 100);
}`;
  (document.head || document.documentElement).appendChild(script);
  script.remove();
}

getYoutubeState(() => runOnLoad(logOut));
