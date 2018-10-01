"use strict";
/* jshint esversion: 6, strict: global, laxbreak: true */
/* globals chrome */
/* globals $set */
// licensed under the MPL 2.0 by (github.com/serv-inc)

/**
 * @fileoverview alters URLs, sends headers, and deletes cookies to
 *   enforce safe search
 */

// =========== URLS ==================
/** redirects all GET urls to safe search variants */
chrome.webRequest.onBeforeRequest.addListener(
  redirect,
  {urls: ["<all_urls>"], types: ["main_frame", "sub_frame", "xmlhttprequest"]},
  ["blocking"]
);
/** redirects google chrome's omnibox that does not reload the page */
chrome.webNavigation.onReferenceFragmentUpdated.addListener(function(details) {
  if ( /webhp.*q=/.test(details.url) ) {
    let new_url = _add_if_necessary(details.url, "safe=active&ssui=on");
    if ( new_url ) {
      chrome.tabs.update(details.tabId, {'url': new_url});
    }
  }
});

function redirect(requestDetails) {
  let redir_url = _alter(requestDetails.url);
  if ( redir_url ) {
    return { redirectUrl: redir_url };
  }
}


/** alters url if needs to for safe search */
function _alter(uri) {
  if ( uri.includes("google.")
       && ! uri.includes("docs.google.")
       && ! uri.includes("maps.google.") && ! uri.includes("/maps/")
       && ! uri.includes("play.google.") ) {
    if (/q=/.test(uri)) {
      return _add_if_necessary(uri, "safe=active&ssui=on");
    }
  } else if ( uri.includes("search.yahoo.") ) {
    if (/(\/search)/.test(uri)) {
      return _add_if_necessary(uri, "vm=r");
    }
  } else if ( uri.includes("bing.") ) {
    if (/(\/search|\/videos|\/images|\/news)/.test(uri)) {
      return _add_if_necessary(uri, "adlt=strict");
    }
  } else if ( uri.includes("duckduckgo.") ) {
    if ( uri.includes("q=") ) {
      return _add_if_necessary(uri, "kp=1");
    }
  } else if ( uri.includes("yandex.") ) {
    if ( uri.includes("/search") ) {
      return _add_if_necessary(uri, "fyandex=1");
    }
  } else if ( uri.includes("qwant.") ) {
    if ( uri.includes("q=") || uri.includes("/search/") ) {
      return _add_if_necessary(_add_if_necessary(uri, "s=2"), "safesearch=2");
    }
  }
  return false;
}


// todo: should also remove same param, (and maybe add & *or* ? depending)
/** @return url with parameter added if it does not already exist, else false */
function _add_if_necessary(uri, needed_part) {
  if ( ! uri.includes(needed_part) ) {
    return uri + "&" + needed_part;
  } else {
    return false;
  }
}

// =========== HEADERS ==================
// copied and adjusted from chrome.webRequest docs
/** adds youtube restricted header to youtube requests */
chrome.webRequest.onBeforeSendHeaders.addListener(
  function(details) {
    if ( $set.youtube > 0 ) {
      for (let i = 0; i < details.requestHeaders.length; ++i) {
        if (details.requestHeaders[i].name === 'YouTube-Restrict') {
          details.requestHeaders.splice(i, 1);
          break;
        }
      }
    }
    if ( $set.youtube === 1 ) {
      details.requestHeaders.push({"name": "YouTube-Restrict",
                                   "value": "Moderate"});
    } else if ( $set.youtube === 2 ) {
      details.requestHeaders.push({"name": "YouTube-Restrict",
                                   "value": "Strict"});
    }
    return {requestHeaders: details.requestHeaders};
  },
  {urls: ["*://*.youtube.com/*"], types: ["main_frame", "sub_frame"]},
  ["blocking", "requestHeaders"]
);


// =========== COOKIES ==================
// todo: document, target specific setting if someone complains
/** REMOVES COOKIES: main cookie from ixquick/startpage, dogpile's
 * search prefs, reddit's over18
 */
chrome.cookies.onChanged.addListener(function(changeInfo) {
  if ( changeInfo.removed ) {
    return;
  }

  if ( changeInfo.cookie.name === "ff" &&
       ( changeInfo.cookie.domain === ".dailymotion.com" ) ) {
    _removeCookie(changeInfo.cookie);
  }

  if ( changeInfo.cookie.name === "ws_prefs" &&
       ( changeInfo.cookie.domain === "www.dogpile.com" ) ) {
    _removeCookie(changeInfo.cookie);
  }

  if ( changeInfo.cookie.name === "ECFG" &&
       ( changeInfo.cookie.domain === ".ecosia.org" ) ) {
    _removeCookie(changeInfo.cookie);
  }

  if ( changeInfo.cookie.name === "preferences" &&
       ( changeInfo.cookie.domain === ".ixquick.com" ||
         changeInfo.cookie.domain === ".startpage.com" ) ) {
    _removeCookie(changeInfo.cookie);
  }

  if ( changeInfo.cookie.name === "over18" &&
       ( changeInfo.cookie.domain === ".reddit.com" ) ) {
    _removeCookie(changeInfo.cookie);
  }

  // also needs to filter request for first request, see below
  if ( changeInfo.cookie.name === "content_rating" &&
       ( changeInfo.cookie.domain === ".vimeo.com" ) ) {
    _removeCookie(changeInfo.cookie);
  }

  if ( changeInfo.cookie.name === "dkv" &&
       ( changeInfo.cookie.domain === ".youtube.com" ) ) {
    _removeCookie(changeInfo.cookie);
  }
});
chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    return { cancel: details.method === "POST" };
  },
  {urls: ["*://vimeo.com/settings/contentrating"]},
  ["blocking"]
);

// courtesy of cookie api test extension, as of stackoverflow
function _removeCookie(cookie) {
  let url = "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain +
      cookie.path;
  chrome.cookies.remove({"url": url, "name": cookie.name});
}
