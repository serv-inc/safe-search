LINT=./node_modules/jshint/bin/jshint

zip: lint
	cd addon; zip ../safe.zip *
	cp safe.zip safe.xpi

lint:
	${LINT} addon/background.js
	${LINT} addon/settings.js
	python2 -m json.tool addon/manifest.json > /dev/null
	python2 -m json.tool addon/preset.json > /dev/null
	python2 -m json.tool addon/schema.json > /dev/null
	tidy -eq addon/options.html
	chromium-browser ./test/unit/SpecRunner.html &
	firefox-esr ./test/unit/SpecRunner.html &
