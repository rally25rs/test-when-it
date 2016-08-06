const g = typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}

function functionNameToTestName(functionName) {
	return functionName
		.replace(/_/g, ' ')
		.replace(/([^A-Z])([A-Z])/g, '$1 $2')
		.replace(/([A-Z][a-z])/g, ' $1')
		.replace(/\W+/g, ' ')
		.replace(/\W[A-Z](?=[a-z\W])/g, function(namePart) { return namePart.toLowerCase(); });}

function buildDescribeName(setupFunctions) {
	var names = ['when'];

	setupFunctions.forEach((setupFunction) => {
		if(setupFunction instanceof Function) {
			names.push(functionNameToTestName(setupFunction.name || ''));
		} else {
			names.push(setupFunction.toString());
		}
	});

	return names.join(' ');
}

function whenIt(...setupFunctions) {
	const testFunction = setupFunctions.pop();
	const cleanupFunctions = [];
	const testName = buildDescribeName(setupFunctions);

	describe(testName, function() {
		beforeEach(function() {
			setupFunctions.forEach((setupFunction) => {
				if(setupFunction instanceof Function) {
					cleanupFunctions.push(setupFunction.call(this));
				}
			});
		});

		afterEach(function() {
			cleanupFunctions.forEach((cleanupFunction) => {
				if(cleanupFunction instanceof Function) {
					cleanupFunction.call(this);
				}
			});
		});

		testFunction.call(this);
	});
}

function thenIt(...assertionFunctions) {
	assertionFunctions.forEach((assertion) => {
		it(functionNameToTestName(assertion.name), assertion);
	});
}

module.exports.whenIt = g.whenIt = whenIt;
module.exports.thenIt = g.thenIt = thenIt;
