LINT=./node_modules/jshint/bin/jshint

zip: lint
	cd addon; zip ../safe.zip *
	cp safe.zip safe.xpi

test_js:
	${LINT} addon/background.js
	${LINT} addon/settings.js

test_py:
	python -m json.tool addon/manifest.json > /dev/null
	python -m json.tool addon/preset.json > /dev/null
	python -m json.tool addon/schema.json > /dev/null
	python meta/same_version.py

test: test_js test_py
	tidy -eq addon/options.html
	chromium-browser ./test/unit/SpecRunner.html &
	firefox-esr ./test/unit/SpecRunner.html &

test: zip
	cp safe.zip safe.xpi
	py.test-3 ./test/browserstack/simpleunittest.py

dist: zip
	node ./meta/upload.js
