
all: depends

depends: py_dep npm_dep

py_dep:
	pip install -r ./requirements.txt

npm_dep:
	npm install --prefix ./static/vendor

clean:
	rm -vf ./static/vendor
