"use strict";
// licensed under GPL 2 by github.com/serv-inc version from 2018-10-04
chrome = {
  _store: {"limit" : 160, _initialized: true},
  _store_man: {"limit" : 160},
  _store_updated: {"limit" : 0},
  _listeners: [],
  runtime: {
    onMessage : {
      addListener : function() {}
    }
  },
  storage: {
    local: {
      get: (a, callback) => callback(chrome._store),
      set: (a) => {
        console.log('save' + JSON.stringify(a));
        for (let el in a) {
          if ( a.hasOwnProperty(el) ) {
            chrome._store[el] = a[el];
          }
        }
      }
    },
    managed: {
      get: (a, callback) => callback(chrome._store_man)
    },
    onChanged: {
      addListener: (listener) => chrome._listeners.push(listener)
    }
  },
  _triggerChange(changeSet={"limit": {"newValue": 0, "oldValue": 160}},
                 area="managed") {
    chrome._listeners.forEach((listener) => {
      listener(changeSet, area);
    });
  }
};
