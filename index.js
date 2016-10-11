(function(){
var g = typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}

function _functionNameToTestName(functionName) {
	return functionName
		.replace(/_/g, ' ')
		.replace(/([^A-Z])([A-Z])/g, '$1 $2')
		.replace(/([A-Z][a-z])/g, ' $1')
		.replace(/\W+/g, ' ')
		.replace(/\W[A-Z](?=[a-z\W])/g, function(namePart) { return namePart.toLowerCase(); });}

function _buildDescribeName(setupFunctions) {
	var names = ['when'];

	setupFunctions.forEach((setupFunction) => {
		if(setupFunction instanceof Fixture) {
			names.push(setupFunction.name);
		} else if(setupFunction instanceof Function) {
			names.push(_functionNameToTestName(setupFunction.name || ''));
		} else if(setupFunction instanceof Object) {
		} else {
			names.push(setupFunction.toString());
		}
	});

	return names.join(' ');
}

function _argsToArr(args) {
	var arr = [];

	for(var i = 0; i < args.length; i++) {
		arr.push(args[i]);
	}

	return arr;
}

function _extend(destination, source) {
	for(var key in source) {
		if(source.hasOwnProperty(key)) {
			destination[key] = source[key];
		}
	}
}

function _delete(destination, source) {
	for(var key in source) {
		if(source.hasOwnProperty(key)) {
			delete destination[key];
		}
	}	
}

function Fixture(options) {
	if (!options || !options.name) {
		throw 'new Fixture() must be called with options containing at least "name".';
	}
	this.name = options.name;
	this.before = options.before;
	this.after = options.after;
}

Fixture.prototype.apply = function() {
	this.args = [];
	for(var i = 0; i < arguments.length; i++) {
		this.args.push(arguments[i]);
	}
	return this;
}

function whenIt() {
	var setupFunctions = _argsToArr(arguments);
	var testFunction = setupFunctions.pop();
	var cleanupFunctions = [];
	var testName = _buildDescribeName(setupFunctions);

	describe(testName, function() {
		beforeEach(function() {
			var self = this;

			setupFunctions.forEach(function(setupFunction) {
				if(setupFunction instanceof Fixture) {
					if(setupFunction.before) {
						setupFunction.before.apply(self, setupFunction.args || []);
					}
					cleanupFunctions.push(setupFunction);
				} else if(setupFunction instanceof Function) {
					cleanupFunctions.push(setupFunction.call(self));
				} else if(setupFunction instanceof Object) {
					_extend(self, setupFunction);
					cleanupFunctions.push(setupFunction);
				}
			});
		});

		afterEach(function() {
			var self = this;

			cleanupFunctions.forEach(function(cleanupFunction) {
				if(cleanupFunction instanceof Fixture) {
					if(cleanupFunction.after) {
						cleanupFunction.after.apply(self, cleanupFunction.args || []);
					}
				} else if(cleanupFunction instanceof Function) {
					cleanupFunction.call(self);
				} else if(cleanupFunction instanceof Object) {
					_delete(self, cleanupFunction);
				}
			});
		});

		testFunction.call(this);
	});
}

function thenIt() {
	var assertionFunctions = _argsToArr(arguments);

	assertionFunctions.forEach(function(assertion) {
		it(_functionNameToTestName(assertion.name), assertion);
	});
}

if(module && module.exports) {
	module.exports.whenIt = g.whenIt = whenIt;
	module.exports.thenIt = g.thenIt = thenIt;
	module.exports.Fixture = g.Fixture = Fixture;
}
})();