"use strict";
/* jshint esversion: 6, strict: global, laxbreak: true */
/* globals chrome */
/* globals $set, URL, URLSearchParams */
// licensed under the MPL 2.0 by (github.com/serv-inc)


/**
 * @fileoverview alters URLs, sends headers, and deletes cookies to
 *   enforce safe search
 */

// =========== URLS ==================
/** redirects all GET urls to safe search variants */
chrome.webRequest.onBeforeSendHeaders.addListener(
  redirect,
  {urls: ["<all_urls>"], types: ["main_frame", "sub_frame", "xmlhttprequest"]},
  ["blocking"]
);

/** redirects google chrome's omnibox that does not reload the page */
chrome.webNavigation.onReferenceFragmentUpdated.addListener(function(details) {
  if ( /webhp.*q=/.test(details.url) ) {
    let new_url = _meta_add(details.url, ["safe", "ssui"], ["active", "on"]);
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


/** alters url if needs to for safe search, false if no change needed */
function _alter(uri) {
  if ( /google\..*q=/.test(uri)
       && ! /(docs|drive|maps|play)\.google/.test(uri)
       && ! /\/(drive|maps)\//.test(uri) ) {
    return _meta_add(uri, ["safe", "ssui"], ["active", "on"]);
  } else if ( /search.yahoo.*\/search/.test(uri) ) {
    return _meta_add(uri, ["vm"], ["r"]);
  } else if ( /bing\..*(\/search|\/videos|\/images|\/news)/.test(uri) ) {
      return _meta_add(uri, ["adlt"], ["strict"]);
  } else if ( /duckduckgo\..*q=/.test(uri) ) {
      return _meta_add(uri, ["kp"], ["1"]);
  } else if ( /yandex\..*\/search/.test(uri) ) {
    return _meta_add(uri, ["fyandex"], ["1"]);
  } else if ( /qwant.*safesearch/.test(uri) ) {
    return _meta_add(uri, ["safesearch"], ["2"]);
  }
  return false;
}

// qwant does some weird stuff, redirecting failed with CORS on FF
chrome.tabs.onUpdated.addListener(
  function(tabId, changeInfo, tab) {
    if (typeof(changeInfo.url) !== "undefined") {
      if ( /qwant\..*q=/.test(changeInfo.url) ) {
      }
    }
  }
);

/** @return uri with key[i]=value[i] for all i instead of or in addition to other params, false if no change needed */
function _meta_add(uri, keys, values) {
  let newurl = new URL(uri);
  let params = new URLSearchParams(newurl.search);
  let okcount = 0;
  for (let i = 0; i < keys.length; i++) {
    if ( params.has(keys[i])
         && params.get(keys[i]) === values[i]
         && params.getAll(keys[i]).length === 1 ) {
      okcount += 1;
    }
  }
  if (okcount == keys.length) {
    return false;
  }
  for (let i = 0; i < keys.length; i++) {
    params.set(keys[i], values[i]);
  }
  newurl.search = "?" + params.toString();
  return newurl.href;
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
  {urls: ["*://*.youtube.com/*", "*://clients1.google.com/*client=youtube*"],
   types: ["main_frame", "sub_frame"]},
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

  if ( changeInfo.cookie.domain === ".dailymotion.com" &&
       changeInfo.cookie.name === "ff" ) {
    _removeCookie(changeInfo.cookie);
  }

  if ( changeInfo.cookie.domain === "www.dogpile.com"
       && changeInfo.cookie.name === "ws_prefs" ) {
    _removeCookie(changeInfo.cookie);
  }

  if ( changeInfo.cookie.domain === "duckduckgo.com"
       && changeInfo.cookie.name === "g" ) {
    _removeCookie(changeInfo.cookie);
  }

  if ( changeInfo.cookie.domain === ".ecosia.org"
       && changeInfo.cookie.name === "ECFG" ) {
    _removeCookie(changeInfo.cookie);
  }

  if ( changeInfo.cookie.domain === ".patreon.com"
       && changeInfo.cookie.name === "can_see_nsfw" ) {
    _removeCookie(changeInfo.cookie);
    chrome.tabs.reload();
  }
  
  if ( changeInfo.cookie.domain === ".startpage.com"
       && changeInfo.cookie.name === "preferences" ) {
    _removeCookie(changeInfo.cookie);
  }

  if ( changeInfo.cookie.domain === ".reddit.com"
       && changeInfo.cookie.name === "over18" ) {
    _removeCookie(changeInfo.cookie);
  }

  // also needs to filter request for first request, see below
  if ( changeInfo.cookie.domain === ".vimeo.com"
       && changeInfo.cookie.name === "content_rating" ) {
    _removeCookie(changeInfo.cookie);
  }

  if ( changeInfo.cookie.domain === ".youtube.com" ) {
    if ( changeInfo.cookie.name === "dkv" ) {
      _removeCookie(changeInfo.cookie);
    } else if ( changeInfo.cookie.name === "PREFS" && $set.youtube >= 1 ) {
      let prefs = new URLSearchParams(changeInfo.cookie.value);
      if ( prefs.get("f2") !== "8000000" ) {
        prefs.set("f2", "8000000");
        chrome.cookies.set({
          "url": "https://youtube.com",
          "name": "PREFS",
          "value": prefs.toString()
        });
      }
    }
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
