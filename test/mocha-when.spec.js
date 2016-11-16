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

	function isAddedToTheContext() {
		expect(this.z).to.equal('z');
	}

	whenIt(aFunctionSetsAVariableOnThis, function () {
		thenIt(itIsAvailableToTheTest,
			   itIsResetBetweenEachTest);
	});

	whenIt('is passed an object', {z: 'z'}, function() {
		thenIt(isAddedToTheContext);
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

describe('fixture', function() {
	var passesAParameter = new Fixture({
		name: 'creates a user',
		before: function(userName) {
			this.user = userName;
		},
		after: function(userName) {
			delete this.user;
		}
	});

	var isPassedToWhenIt = new Fixture({
		name: 'is passed to whenIt',
		before: function() {
			this.x = true;
		},
		after: function() {
			delete this.x;
		}
	})

	it('is instanceof fixture', function () {
		expect(passesAParameter).to.be.instanceOf(Fixture)
	});

	whenIt(isPassedToWhenIt, function() {
		it('its before is executed', function() {
			expect(this.x).to.be.defined;
		});
	});

	whenIt(passesAParameter.apply('Bob'), function() {
		it('is forwarded to the functions', function() {
			expect(this.user).to.equal('Bob');
		});
	});
});

describe('setIt', function() {
	setIt('fromLiteral', 'valueFromLiteral');
	setIt('fromFunc', function() {
		return 'valueFromFunc';
	});
	setIt('throwError', function() {
		throw 'error';
	})

	it('makes a value available on the test context', function() {
		expect(this.fromLiteral).to.equal('valueFromLiteral');
	});

	it('makes the return value of a function available on the test context', function() {
		expect(this.fromFunc).to.equal('valueFromFunc');
	});

	it('is not evaluated until used', function() {
		var self = this;
		expect(function() { self.throwError; }).to.throw('error');
	});
});