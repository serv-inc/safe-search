/** runs on qwant, sets safe search */
// see https://stackoverflow.com/questions/8982312/
var actualCode = 'var set = applicationState.user.getSettings(); set.safeSearch = 2; set.update()';

var script = document.createElement('script');
script.appendChild(document.createTextNode(actualCode));
(document.head || document.documentElement).appendChild(script);
script.parentNode.removeChild(script);


