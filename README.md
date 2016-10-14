## WhenIt / ThenIt syntax for JS unit tests.

Works with Mocha or Jasmine test frameworks.

The intent is to provide a way to make small reusable functions that are used between several tests, without having to duplicate code between tests. It also provides a way to move test names from plain strings into function names.

# Installation

Get the files.

> npm install when-it --save-dev

Add to your test environment.

```
require('when-it');

// or with a regular script tag

<script src="node_modules/test-when-it/index.js" type="text/javascript"></script>
```

# Use

## whenIt(..)

The `whenIt(...)` function takes any number of arguments that act as test setup (aka `beforeEach`). The _last_ parameter must be a function that is executed as the test context.

The following things can be passed to the `whenIt` function:

* `Function` - The function will be executed as a `beforeEach` step. If the function has a `.name` then the name will be appended to the test name. If the function returns another `function`, then that returned function will be called in an `afterEach` step. Example:

```
describe('example', function() {
	function setsUserToBob() {
		this.user = 'Bob';

		return function() {
			delete this.user;
		}
	}

	whenIt(setsUserToBob, function() {
		it('can access the user name', function() {
			expect(this.user).to.equal('Bob');
		});
	});
});

// The above code is equivelant to this "normal" mocha test code:

describe('example', function() {
	describe('when it sets user to bob ', function() {
		beforeEach(function() {
			this.user = 'Bob';
		});

		afterEach(function() {
			delete this.user;
		});

		it('then it can access the user name', function() {
			expect(this.user).to.equal('Bob');
		});
	});
});
```

* `String` - The string will be appended to the test name.

* `Object` - The properties of the object will be copied to the `this` test context during the `beforeEach` step. The properties will then be deleted from the `this` context in the `afterEach`. Example:

```
describe('example', function() {
	whenIt('sets user to bob', { user: 'Bob' }, function() {
		it('can access the user name', function() {
			expect(this.user).to.equal('Bob');
		});
	});
});
```

* `Fixture` - See further information below.

## thenIt(..)

The `thenIt` function can be passed multiple `function`s. Each function is executed as its own `it()` test. Example:

```
describe('example', function() {
	function setsTheUserToAString() {
		expect(this.user).to.be.instanceOf(String);
	}

	function setsTheUserToBob() {
		expect(this.user).to.equal('Bob');
	}

	whenIt('sets user to bob', { user: 'Bob' }, function() {
		thenIt(setsTheUserToAString, setsTheUserToBob);
	});
});

// The above code is equivelant to this "normal" mocha test code:

describe('example', function() {
	describe('when it sets user to Bob', function() {
		beforeEach(function() {
			this.user = 'Bob';	
		});

		afterEach(function() {
			delete this.user;
		});

		it('sets the user to a string', function() {
			expect(this.user).to.be.instanceOf(String);
		});

		it('sets the user to Bob', function() {
			expect(this.user).to.equal('Bob');
		});
	});
});
```

## new Fixture(...)

An instance of the `Fixture` object can be passed to `whenIt` and it used to encapsulate a name and test before/after steps.

The constructor must be passed an object of the form:

```
var doesSomething = new Fixture({
	name: 'a string name to insert into the test name', // required.
	before: function() {}, // run during beforeEach. optional.
	after: function() {} // run during afterEach. optional.
});

whenIt(doesSomething, function() {
	it(...);
});
```

The instance also exposes a `.apply()` function. You can pass any arguments to the function, and those arguments will be passed to the `before` and `after` functions.

```
var setsUser = new Fixture({
	name: 'sets the user',
	before: function(name) { this.user = name; },
	after: function(name) { delete this.user; }
});

whenIt(setsUser.apply('Bob'), 'to Bob', function() {

	// full test name is "when it sets the user to Bob the user is set to Bob"
	it('the user is set to Bob', function() {
		expect(this.user).to.equal('Bob');
	});
});
```