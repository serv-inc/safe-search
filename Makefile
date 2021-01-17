LINT=npx eslint

zip: lint
	cd addon; zip ../safe.zip *
	cp safe.zip safe.xpi

lint: lint_js lint_py lint_sh

lint_py:
	python -m json.tool addon/manifest.json > /dev/null
	python -m json.tool addon/preset.json > /dev/null
	python -m json.tool addon/schema.json > /dev/null
	python meta/same_version.py

lint_js:
	npm run lint

lint_sh:
	tidy -eq addon/options.html

test_manual:
	chromium-browser ./test/unit/SpecRunner.html &
	firefox-esr ./test/unit/SpecRunner.html &

test: zip
	cp safe.zip safe.xpi
	py.test-3 ./test/browserstack/simpleunittest.py

dist: zip
	node ./meta/upload.js
