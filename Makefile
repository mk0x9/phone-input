TARGET=phone-input-compiled.js

all: $(TARGET)

$(TARGET): closure-compiler/build/compiler.jar
	ant

closure-compiler/build/compiler.jar: closure-compiler
	cd closure-compiler && ant jar

.PHONY: all
