"use strict";
// todo: test jshint stuff
/* jshint esversion: 6, strict: global */
/* jshint loopfunc: true */
/* jshint laxbreak: true */
/* globals chrome */
/* globals XMLHttpRequest */
/* globals setTimeout */
// licensed under the MPL 2.0 by (github.com/serv-inc)

class Settings {
  /** initializes from managed, local storage. on first load from preset.json */
  constructor() {
    let _self = this;
    this._settings = {};
    this._managed = [];
    this._initialized = false;
    this._loaded = false;
    this._saved = true;
    this._listeners = {};
    let storagePolyfill = chrome.storage.managed || { get: (a, b) => b({}) };
    storagePolyfill.get(null, result => {
      for (let el in result) {
        if ( result.hasOwnProperty(el) ) {
          this._managed.push(el);
          this._addToSettings(el, result[el]);
        }
      }
      chrome.storage.local.get(null, result => {
        for (let el in result) {
          if ( el === "_initialized" ) {
            this._initialized = true;
            continue;
          }
          if ( result.hasOwnProperty(el) && ! this.isManaged(el) ) {
            this._addToSettings(el, result[el]);
          }
        }
        if ( ! this._initialized ) {
          this._loadFileSettings();
        } else {
          this.finish();
        }
      });
    });
    // if a managed option becomes unmanaged, use the managed setting as local
    chrome.storage.onChanged.addListener((changes, area) => {
      for (let el in changes) {
        if ( changes.hasOwnProperty(el) ) {
          if ( area === "managed" ) {
            if ( ! _self.isManaged(el) ) { // create
              _self._managed.push(el);
            } else { // update or delete
              if ( ! changes[el].hasOwnProperty('newValue') ) { // got deleted, use as local
                _self._managed.splice(_self._managed.indexOf(el));
              }
            }
          }
          _self._addToSettings(el, changes[el].newValue);
          if ( el in _self._listeners ) {
            _self._listeners[el].forEach(el => el(changes, area));
          }
        }
      }
    });
  }


  get whitelistRegExp() {
    return RegExp(this.whitelist);
  }


  _addToSettings(el, val) {
    this._settings[el] = val;
    this._addGetSet(el, !this.isManaged(el));
  }


  // could also trigger a save of that value via set
  _addGetSet(el, setter=false) {
    if ( setter ) {
      Object.defineProperty(this, el,
                            { get: () => { return this._settings[el]; },
                              set: (x) => {
                                this._settings[el] = x;
                                this._saved = false;
                              },
                              configurable: true });
    } else {
      Object.defineProperty(this, el,
                            { get: () => { return this._settings[el]; },
                              configurable: true });
    }
  }


  addOnChangedListener(val, listener) {
    if ( val in this._listeners ) {
      this._listeners[val].push(listener);
    } else {
      this._listeners[val] = [listener];
    }
  }


  finish() {
    this._loaded = true;
    this.save();
  }


  isManaged(el) {
    return this._managed.includes(el);
  }


  save() {
    let out = {"_initialized": true};
    for (let el in this._settings) {
      if ( ! this.isManaged(el) && typeof(el) !== "undefined") {
        out[el] = this._settings[el];
      }
    }
    chrome.storage.local.set(out);
    this._saved = true;
  }


  _loadFileSettings() {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'preset.json', true);
    xobj.onreadystatechange = () => {
      if (xobj.readyState == 4 && xobj.status == "200") {
        let parsed = JSON.parse(xobj.responseText);
        for (let el in parsed) {
          if ( parsed.hasOwnProperty(el)
               && ! this.isManaged(el) ) {
            this._addToSettings(el, parsed[el]);
          }
        }
        this.finish();
      }
    };
    xobj.send(null);
  }
}

let $set = new Settings();
/** @return settings to options page */
function getSettings() { return $set; }
