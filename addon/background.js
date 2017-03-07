"use strict";

/* jshint esversion: 6, strict: global */
/* globals chrome */

// td2: vimeo (edit cookies)
function redirect(requestDetails) {
    let redir_url = _alter(requestDetails.url);
    if ( redir_url ) {
        return { redirectUrl: redir_url };
    }
}

/** alters url if needs to for safe search */
function _alter(uri) {
    if ( uri.indexOf("google.") != -1 ) {
        if (/q=/.test(uri)) {
            return _add_if_necessary(uri, "safe=strict");
        }
    } else if ( uri.indexOf("search.yahoo.") != -1 ) {
        if (/(\/search)/.test(uri)) {
            return _add_if_necessary(uri, "vm=r");
        }
    } else if ( uri.indexOf("bing.") != -1 ) {
        if (/(\/search|\/videos|\/images|\/news)/.test(uri)) {
            return _add_if_necessary(uri, "adlt=strict");
        }
    } else if ( uri.indexOf("duckduckgo.") != -1 ) {
        if ( uri.indexOf("q=") != -1 ) {
            return _add_if_necessary(uri, "kp=1");
        }
    }
    return false;
}

/** @return url with parameter added if it does not already exist, else false */
function _add_if_necessary(uri, needed_part) {
    if (uri.indexOf(needed_part) == -1) {
        return uri + "&" + needed_part;
    } else {
        return false;
    }
}

/** redirects all GET urls to safe search variants */
chrome.webRequest.onBeforeRequest.addListener(
    redirect,
    {urls: ["<all_urls>"], types: ["main_frame", "sub_frame"]},
    ["blocking"]
);

// copied and adjusted from chrome.webRequest docs
/** adds youtube restricted header to youtube requests */
chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details) {
        for (let i = 0; i < details.requestHeaders.length; ++i) {
            if (details.requestHeaders[i].name === 'YouTube-Restrict') {
                details.requestHeaders.splice(i, 1);
                break;
            }
        }
        details.requestHeaders.push({"name": "YouTube-Restrict",
                                     "value": "Moderate"});
        return {requestHeaders: details.requestHeaders};
    },
    {urls: ["*://*.youtube.com/*"], types: ["main_frame", "sub_frame"]},
    ["blocking", "requestHeaders"]
);

/** removes all cookies from ixquick/startpage, including safe-search-disable */
chrome.cookies.onChanged.addListener(function(changeInfo) {
    if ( changeInfo.removed ) {
        return;
    }

    if ( changeInfo.cookie.name === "preferences" &&
         ( changeInfo.cookie.domain === ".ixquick.com" ||
           changeInfo.cookie.domain === ".startpage.com" ) ) {
        _removeCookie(changeInfo.cookie);
    }
});

// courtesy of cookie api test extension, as of stackoverflow
function _removeCookie(cookie) {
  let url = "http" + (cookie.secure ? "s" : "") + "://" + cookie.domain +
            cookie.path;
  chrome.cookies.remove({"url": url, "name": cookie.name});
}
        
