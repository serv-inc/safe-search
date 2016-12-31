zip: lint
	cd addon; zip ../safe.zip *

lint:
	jshint addon/background.js
