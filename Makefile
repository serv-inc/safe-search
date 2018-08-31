LINT=./node_modules/jshint/bin/jshint

zip: lint
	cd addon; zip ../safe.zip *

lint:
	${LINT} addon/background.js
	python2 -m json.tool addon/manifest.json > /dev/null
	python2 -m json.tool addon/preset.json > /dev/null
	python2 -m json.tool addon/schema.json > /dev/null
	tidy -eq addon/options.html
