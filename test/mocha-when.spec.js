const {
	expect
} = require('chai');

require('../index');

describe('function context', function () {
	function aFunctionSetsAVariableOnThis() {
		this.x = (this.x || 0) + 1;
	}

	function itIsAvailableToTheTest() {
		this.y = true;
		expect(this.x).to.equal(1);		
	}

	function itIsResetBetweenEachTest() {
		expect(this.x).to.equal(2);
		expect(this.y).not.to.be.defined;		
	}

	whenIt(aFunctionSetsAVariableOnThis, function () {
		thenIt(itIsAvailableToTheTest,
			   itIsResetBetweenEachTest);
	});
});

describe('cleanup', function() {
	function aFunctionThatReturnsAFunction() {
		this.isSetup = true;

		return function() {
			this.isCleanedup = true;
		};
	}

	whenIt('is passed', aFunctionThatReturnsAFunction, function() {
		it('calls the returned function in afterEach', function() {
			expect(this.isSetup).to.be.true;
		});
	});
});
