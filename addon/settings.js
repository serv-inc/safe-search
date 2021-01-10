'use strict';
/* jshint esversion: 6, strict: global, loopfunc: true, laxbreak: true */
/* globals chrome, XMLHttpRequest */
/* exported getSettings */
// licensed under the MPL 2.0 by (github.com/serv-inc)

/**
* @fileinfo: facilitates saving and retrieving from local and managed storage
*/
class Settings {
  /** initializes from managed, local storage. on first load from preset.json */
  constructor() {
    const _self = this;
    this._initialized = false;
    this._listeners = {};
    this._loaded = false;
    this._managed = [];
    this._saved = true;
    this._settings = {};
    const managedPolyfill = (chrome.storage.managed || {get: (a, b) => b({})});
    managedPolyfill.get(null, (result) => {
      if ( typeof(result) !== 'undefined' ) {
        for (const el in result) {
          if ( result.hasOwnProperty(el) ) {
            this._managed.push(el);
            this._addToSettings(el, result[el]);
          }
        }
      }
      chrome.storage.local.get(null, (result) => {
        // eslint-disable-next-line guard-for-in
        for (const el in result) {
          if ( el === '_initialized' ) {
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
      for (const el in changes) {
        if ( changes.hasOwnProperty(el) ) {
          if ( area === 'managed' ) {
            if ( ! _self.isManaged(el) ) { // create
              _self._managed.push(el);
            } else { // update or delete
              // got deleted, use as local
              if ( ! changes[el].hasOwnProperty('newValue') ) {
                _self._managed.splice(_self._managed.indexOf(el));
              }
            }
          }
          _self._addToSettings(el, changes[el].newValue);
          if ( el in _self._listeners ) {
            _self._listeners[el].forEach((el) => el(changes, area));
          }
        }
      }
    });
  }

  /** @return {RegExp} of whitelist */
  get whitelistRegExp() {
    return RegExp(this.whitelist);
  }

  /** @param {string} key to add
      @param {string} value for key */
  _addToSettings(key, value) {
    this._settings[key] = value;
    this._addGetSet(key, !this.isManaged(key));
  }


  // could also trigger a save of that value via set
  /** @param {string} key to add getter and setter for
      @param {boolean} setter true if should add setter, else only getter */
  _addGetSet(key, setter=false) {
    if ( setter ) {
      Object.defineProperty(this, key,
          {get: () => {
            return this._settings[key];
          },
          set: (x) => {
            this._settings[key] = x;
            this._saved = false;
          },
          configurable: true});
    } else {
      Object.defineProperty(this, key,
          {get: () => {
            return this._settings[key];
          },
          configurable: true});
    }
  }

  /** @param {string} key
      @param {Object} listener function to call when key's value changes */
  addOnChangedListener(key, listener) {
    if ( key in this._listeners ) {
      this._listeners[key].push(listener);
    } else {
      this._listeners[key] = [listener];
    }
  }

  /** loading done, save status */
  finish() {
    this._loaded = true;
    this.save();
  }

  /** @param {string} key to check if managed
      @return {boolean} true if key is in managed storage */
  isManaged(key) {
    return this._managed.includes(key);
  }

  /** save to local storage */
  save() {
    const out = {'_initialized': true};
    for (const el in this._settings) {
      if ( ! this.isManaged(el) && typeof(el) !== 'undefined') {
        out[el] = this._settings[el];
      }
    }
    if (typeof(chrome.storage) !== 'undefined') {
      chrome.storage.local.set(out);
      this._saved = true;
    }
  }

  /** load settings from file */
  _loadFileSettings() {
    const xobj = new XMLHttpRequest();
    xobj.overrideMimeType('application/json');
    xobj.open('GET', 'preset.json', true);
    xobj.onreadystatechange = () => {
      if (xobj.readyState == 4 && xobj.status == '200') {
        const parsed = JSON.parse(xobj.responseText);
        for (const el in parsed) {
          if ( parsed.hasOwnProperty(el) &&
               ! this.isManaged(el) ) {
            this._addToSettings(el, parsed[el]);
          }
        }
        this.finish();
      }
    };
    xobj.send(null);
  }
}

const $set = new Settings();

// eslint-disable no-unused-vars
/** @return {Object} settings to options page */
function getSettings() {
  return $set;
}
