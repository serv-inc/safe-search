"use strict";
// td: youtube (see commented out part, needs header)
// td2: vimeo (edit cookies)
function redirect(requestDetails) {
    let redir_url = alter(requestDetails.url);
    if ( redir_url ) {
        return { redirectUrl: alter(requestDetails.url) };
    }
}

/** alters url if needs to for safe search */
function alter(uri) {
    if ( uri.indexOf("google.") != -1 ) {
        if (/q=/.test(uri)) {
            return add_if_necessary(uri, "safe=strict");
        }
    } else if ( uri.indexOf("search.yahoo.") != -1 ) {
        if (/(\/search)/.test(uri)) {
            return add_if_necessary(uri, "vm=r");
        }
    } else if ( uri.indexOf("bing.") != -1 ) {
        if (/(\/search|\/videos|\/images|\/news)/.test(uri)) {
            return add_if_necessary(uri, "adlt=strict");
        }
    } else if ( uri.indexOf("duckduckgo.") != -1 ) {
        if ( uri.indexOf("q=") != -1 ) {
            return add_if_necessary(uri, "kp=1");
        }
    } else /*if ( uri.indexOf("youtube") != -1 ) {
        http_channel.setRequestHeader("YouTube-Restrict", "Moderate", false);
    } else */ {
        return false;
    }
}

/** @return url with parameter added if it does not already exist, else false */
function add_if_necessary(uri, needed_part) {
    if (uri.indexOf(needed_part) == -1) {
        return uri + "&" + needed_part;
    } else {
        return false;
    }
}

chrome.webRequest.onBeforeRequest.addListener(
    redirect,
    {urls: ["<all_urls>"], types: ["main_frame", "sub_frame"]},
    ["blocking"]
);
