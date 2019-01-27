"use strict";
/* jshint esversion: 6, strict: global */
/* globals chrome, console, document, window */
// licensed under the MPL 2.0 by (github.com/serv-inc)
let initError = false;

function saveOptions(e) {
  e.preventDefault();
  if ( initError ) {
    console.error("did not save erroneous options");
    return;
  }
  let $set = chrome.extension.getBackgroundPage().getSettings();
  if ( ! $set.isManaged("youtube") ) {
    $set.youtube = document.querySelector("#youtube").selectedIndex;
  }
  $set.save();
  window.close();
}


function restoreOptions() {
  if ( ! chrome ) {
    console.error("error on option initialization");
    initError = true;
    return;
  }
  initError = false;
  let $set = chrome.extension.getBackgroundPage().getSettings();
  document.querySelector("#youtube").selectedIndex = $set.youtube;
  _disableIfManaged($set, "youtube");
}

/** sets element to readonly if in managedStorage */
function _disableIfManaged($set, element, place=null) {
  place = place || element;
  if ( $set.isManaged(element) ) {
    document.querySelector("#" + place).disabled = true; // readOnly
  }
}


document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
