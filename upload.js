// Promise api
var webstore_upload = require('webstore-upload');
const local = require("./local");

var uploadOptions = {
  accounts: {
    default: local.defaultaccount
  },
  extensions: {
    safe: {
      appID: "fiopkogmohpinncfhneadmpkcikmgkgc",
      zip: "./safe.zip"      
    }
  },
  uploadExtensions : ['safe']
};

webstore_upload(uploadOptions, console.log)
.then(function(result) {
    console.log(result);
    // do somethings nice
    return 'yay';
})
.catch(function(err) {
    console.error(err);
});

