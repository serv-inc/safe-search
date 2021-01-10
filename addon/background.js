'use strict';
/* jshint esversion: 6, strict: global, laxbreak: true */
/* globals chrome, $set, URL, URLSearchParams */
// licensed under the MPL 2.0 by (github.com/serv-inc)


/**
 * @fileoverview alters URLs, sends headers, and deletes cookies to
 *   enforce safe search
 */

// =========== URLS ==================
/** redirects all GET urls to safe search variants */
chrome.webRequest.onBeforeSendHeaders.addListener(
    redirectBefore,
    {
      urls: ['<all_urls>'],
      types: ['main_frame', 'sub_frame', 'xmlhttprequest'],
    },
    ['blocking'],
);

/** redirects google chrome's omnibox that does not reload the page */
chrome.webNavigation.onReferenceFragmentUpdated.addListener(function(details) {
  if ( /(webhp|search).*q=/.test(details.url) ) {
    const newUrl = _metaAdd(details.url, ['safe', 'ssui'], ['active', 'on']);
    if ( newUrl ) {
      chrome.tabs.update(details.tabId, {'url': newUrl});
    }
  }
}, {url: [{hostContains: 'google'}]});

// DDG otherwise fails
chrome.webNavigation.onDOMContentLoaded.addListener(
    redirectDOM,
    {url: [{hostSuffix: 'duckduckgo.com'}]},
);

/** redirect all relevant URLs to safe search variants
* @param {Object} requestDetails received from onBeforeSendHeaders
* @return {Object} value fitting for onBeforeSendHeaders */
function redirectBefore(requestDetails) {
  const redirUrl = _alter(requestDetails.url);
  if ( redirUrl ) {
    return {redirectUrl: redirUrl};
  }
}

/** alternative redirect, as redirectBefore not called for DDG
* @param {Object} requestDetails received from onBeforeSendHeaders */
function redirectDOM(requestDetails) {
  const redirUrl = _alter(requestDetails.url);
  if ( redirUrl ) {
    chrome.tabs.update(requestDetails.tabId, {'url': redirUrl});
  }
}


/** Modify uri for safe search
@param {string} uri the uri to maybe alter
@return {string} altered url if needed for safe search,
false if no change needed */
function _alter(uri) {
  if ( /bing\..*(\/search|\/videos|\/images|\/news)/.test(uri) ) {
    return _metaAdd(uri, ['adlt'], ['strict']);
  } else if ( /duckduckgo\..*q=/.test(uri) ) {
    return _metaAdd(uri, ['kp'], ['1']);
  } else if ( /ecosia.*search/.test(uri) ) {
    return _metaAdd(uri, ['safesearch'], ['2']);
  } else if ( /google.*(webhp|search).*q=/.test(uri) ) {
    return _metaAdd(uri, ['safe', 'ssui'], ['active', 'on']);
  } else if ( /qwant.com/.test(uri) ) { // seems to not be heeded
    return _metaAdd(uri, ['safesearch', 's'], ['2', '2']);
  } else if ( /search.yahoo.*\/search/.test(uri) ) {
    return _metaAdd(uri, ['vm'], ['r']);
  } else if ( /yandex\..*\/search/.test(uri) ) {
    return _metaAdd(uri, ['fyandex'], ['1']);
  } else if ( /onesearch.*\/search/.test(uri) ) {
    return _metaAdd(uri, ['vm'], ['r']);
  }
  return false;
}

// qwant does some weird stuff, redirecting failed with CORS on FF
chrome.tabs.onUpdated.addListener(
    function(tabId, changeInfo, tab) {
      if (typeof(changeInfo.url) !== 'undefined') {
        if ( /qwant\..*q=/.test(changeInfo.url) ) {
        }
      }
    },
);

/**
@param {str} uri to modify
@param {Array} keys of URLParam keys
@param {Array} values of URLParam values
@return {string } uri with key[i]=value[i]
* for all i instead of or in addition to other params,
* false if no change needed */
function _metaAdd(uri, keys, values) {
  const newurl = new URL(uri);
  const params = new URLSearchParams(newurl.search);
  let okcount = 0;
  for (let i = 0; i < keys.length; i++) {
    if ( params.has(keys[i]) &&
         params.get(keys[i]) === values[i] &&
         params.getAll(keys[i]).length === 1 ) {
      okcount += 1;
    }
  }
  if (okcount == keys.length) {
    return false;
  }
  for (let i = 0; i < keys.length; i++) {
    params.set(keys[i], values[i]);
  }
  newurl.search = '?' + params.toString();
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
        details.requestHeaders.push({'name': 'YouTube-Restrict',
          'value': 'Moderate'});
      } else if ( $set.youtube === 2 ) {
        details.requestHeaders.push({'name': 'YouTube-Restrict',
          'value': 'Strict'});
      }
      return {requestHeaders: details.requestHeaders};
    },
    {urls: ['*://*.youtube.com/*', '*://clients1.google.com/*client=youtube*'],
      types: ['main_frame', 'sub_frame']},
    ['blocking', 'requestHeaders'],
);


// =========== COOKIES ==================
// todo: document, target specific setting if someone complains
const DUCKIE = {
  url: 'http://duckduckgo.com/',
  name: 'p',
  value: '1',
  domain: 'duckduckgo.com',
  expirationDate: Math.pow(2, 32)-1,
};
chrome.cookies.set(DUCKIE);

const VIMMIEMIN = {
  url: 'https://vimeo.com/',
  name: 'content_rating',
  value: '191',
  domain: '.vimeo.com',
  expirationDate: Math.pow(2, 32)-1,
};

/** @param {Object} cookie
@return {boolean} if cookie is ok: blocks nudity */
function vimeoOk(cookie) {
  return (cookie !== null) && (255 - cookie.value & 64);
}
chrome.cookies.get(
    {url: 'https://vimeo.com', name: 'content_rating'},
    (cookie) => {
      if (!vimeoOk(cookie)) {
        chrome.cookies.set(VIMMIEMIN);
      }
    },
);

/** REMOVES COOKIES: main cookie from ixquick/startpage, dogpile's
 * search prefs, reddit's over18
 */
chrome.cookies.onChanged.addListener(function(changeInfo) {
  if ( changeInfo.removed ) {
    return;
  }

  if ( changeInfo.cookie.domain === '.bing.com' &&
       changeInfo.cookie.name === '_SS' ) {
    _removeCookie(changeInfo.cookie);
  }

  if ( changeInfo.cookie.domain === '.bing.com' &&
       changeInfo.cookie.name === 'SRCHHPGUSR' ) {
    _removeCookie(changeInfo.cookie);
  }

  if ( changeInfo.cookie.domain === '.dailymotion.com' &&
       changeInfo.cookie.name === 'ff' ) {
    _removeCookie(changeInfo.cookie);
  }

  if ( changeInfo.cookie.domain === 'www.dogpile.com' &&
       changeInfo.cookie.name === 'ws_prefs' ) {
    _removeCookie(changeInfo.cookie);
  }

  if ( changeInfo.cookie.domain === 'duckduckgo.com' &&
       changeInfo.cookie.name === 'p' ) {
    _removeCookie(changeInfo.cookie);
    chrome.cookies.set(DUCKIE);
  }

  if ( changeInfo.cookie.domain === 'duckduckgo.com' &&
       changeInfo.cookie.name === 'g' ) {
    _removeCookie(changeInfo.cookie);
  }

  if ( changeInfo.cookie.domain === '.ecosia.org' &&
       changeInfo.cookie.name === 'ECFG' ) {
    _removeCookie(changeInfo.cookie);
  }

  if ( changeInfo.cookie.domain === '.patreon.com' &&
       changeInfo.cookie.name === 'can_see_nsfw' ) {
    _removeCookie(changeInfo.cookie);
    chrome.tabs.reload();
  }

  if ( changeInfo.cookie.domain === '.startpage.com' &&
       changeInfo.cookie.name === 'preferences' ) {
    _removeCookie(changeInfo.cookie);
  }

  if ( changeInfo.cookie.domain === '.reddit.com' &&
       changeInfo.cookie.name === 'over18' ) {
    _removeCookie(changeInfo.cookie);
  }

  // also needs to filter request for first request, see below
  if ( changeInfo.cookie.domain === '.vimeo.com' &&
       changeInfo.cookie.name === 'content_rating' ) {
    if (!vimeoOk(changeInfo.cookie)) {
      _removeCookie(changeInfo.cookie);
      chrome.cookies.set(VIMMIEMIN);
    }
  }

  if ( changeInfo.cookie.domain === '.youtube.com' ) {
    if ( changeInfo.cookie.name === 'dkv' ) {
      _removeCookie(changeInfo.cookie);
    } else if ( changeInfo.cookie.name === 'PREFS' && $set.youtube >= 1 ) {
      const prefs = new URLSearchParams(changeInfo.cookie.value);
      if ( prefs.get('f2') !== '8000000' ) {
        prefs.set('f2', '8000000');
        chrome.cookies.set({
          'url': 'https://youtube.com',
          'name': 'PREFS',
          'value': prefs.toString(),
        });
      }
    }
  }
});

// courtesy of cookie api test extension, as of stackoverflow
/** @param {Object} cookie to remove */
function _removeCookie(cookie) {
  const url = 'http' + (cookie.secure ? 's' : '') + '://' + cookie.domain +
      cookie.path;
  chrome.cookies.remove({'url': url, 'name': cookie.name});
}
