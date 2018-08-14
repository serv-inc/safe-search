LINT=./node_modules/jshint/bin/jshint

zip: lint
	cd addon; zip ../safe.zip *

lint:
	${LINT} addon/background.js
