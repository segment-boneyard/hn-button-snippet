build: clean components script.html convert
	component build --dev

clean:
	rm -fr components build script.html

components: component.json
	component install --dev

convert: button.html script.html
	component convert button.html
	component convert script.html

script.html:
	echo '<script type="text/javascript">' > script.html
	uglifyjs --no-copyright loader.js > loader.min.js
	sed -i '' 's/}}/}\;}/g' loader.min.js # un-minify `}}` for minstache
	cat loader.min.js >> script.html
	echo '</script>' >> script.html
	tr -d '\n' < script.html > .script.html; mv .script.html script.html # remove line breaks
	rm loader.min.js

test:
	open test/index.html

.PHONY: test