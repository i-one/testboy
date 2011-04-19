// Copyright (C) 2011 by Ivan Sialitski

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.




// testboy global
var testboy = {};

(function (testboy) {

    var doc = window.document,

        // undefined
        UNDEFINED,

        // symbol constants
        SYM_EMPTY = "",
        SYM_SPACE = " ",
        SYM_SEMICOLON = ":",

        ZERO_CHARS =  ["0", "0", "00"],

        // alias
        hasOwnProperty = Object.prototype.hasOwnProperty,

        // Adds one or more zero characters to the beginning of the specified number value
        // casted to string type.
        addZero = function (n, c) {
            var num = String(n), add = c - num.length;
            if (add > 0) {
                return ZERO_CHARS[add] + num;
            }
            return n;
        },

        // Appends an element to the body.
        appendToBody = function (el) {
            var body = doc.body;
            if (!body) {
                throw new Error("Can not append an element to the body because it's null.");
            }
            body.appendChild(el);
        };




    /**
     * Testboy 
     * @class testboy
     * @static
     * @module testboy
     */
    // testboy

    /**
     * Standard output target.
     * @static 
     * @property out
     * @type testboy.OutputTarget
     */
    // testboy.out;

    /**
     * Standard runner.
     * @static
     * @property runner
     * @type testboy.Runner
     */
    // testboy.runner;

    /**
     * Creates a global alias for an object or a function.
     * @method globalize
     * @param {string} alias Global alias name to be created.
     * @param {Object} obj Object to globalize.
     */
    testboy.globalize = function (alias, obj) {
        if (window.execScript) {
            // only for IE. We need to define a global var this way in order to be able to throw 
            // exceptions in this context.
            window.execScript("var " + alias + ";");
        }
        window[alias] = obj;
    };




    /**
     * Writes text in an HTML element.
     * @class OutputTarget
     * @namespace testboy
     * @constructor OutputTarget
     * @param {Element} el HTML element to be a container for the text.
     */
    var OutputTarget = function (el) {
        /**
         * The source html element.
         * @private
         * @property _src
         * @type Element
         */
        this._src = el;
    };

    testboy.OutputTarget = OutputTarget;

    /**
     * Creates DOM for an <code>OutputTarget</code> instance.
     * @private
     * @method _createDom
     */
    OutputTarget.prototype._createDom = function () {
        this._src = doc.createElement("pre");
    };

    /**
     * Writes a line of text.
     * @private
     * @method _writeln
     * @param {string} text Text to write.
     * @param {string} color Color of the text.
     */
    OutputTarget.prototype._writeln = function (text, color) {
        var el = doc.createElement("span");
        el.appendChild(doc.createTextNode(text + "\n"));
        if (color) {
            el.style.color = color;
        }
        this._src.appendChild(el);
    };

    /**
     * Writes a line of text.
     * @method writeln
     * @param {string} text Text to write.
     * @param {string} color Color of the text.
     */
    OutputTarget.prototype.writeln = function (text, color) {
        if (!this._src) {
            this._createDom();
            appendToBody(this._src);
        }
        this.writeln = this._writeln;
        this.writeln(text, color);
    };

    /**
     * Clears the text container.
     * @method clear
     */
    OutputTarget.prototype.clear = function () {
        var src = this._src;
        if (src) {
            src.innerHTML = "";
        }
    };




    /**
     * Simple set of tests.
     * @class TestCase
     * @namespace testboy
     * @constructor TestCase
     * @param {string} name Optional. Name of the test case.
     */
    var TestCase = function (name) {
        /**
         * Name of the test case.
         * @property name
         * @type string
         */
        this.name = name;
    };

    testboy.TestCase = TestCase;

    /**
     * Sets up the fixture. This method is invoked before a test is run.
     * @method setUp
     */
    TestCase.prototype.setUp = function () {};

    /**
     * Tears down the fixture. This method is invoked after a test is run.
     * @method tearDown
     */
    TestCase.prototype.tearDown = function () {};




    /**
     * Composite of tests.
     * @class TestSuite
     * @namespace testboy
     * @constructor TestSuite
     * @param {string} name Name of the test suite.
     */
    var TestSuite = function (name) {
        /**
         * Name of the test suite.
         * @property name
         * @type string
         */
        this.name = name;
        
        /**
         * Collection of test cases and test suites.
         * @private
         * @property _items
         * @type Array
         */
        this._items = [];
    };

    testboy.TestSuite = TestSuite;

    /**
     * Adds a test suite or test case to the suite.
     * @method add
     * @param {testboy.TestSuite|testboy.TestCase} to Test case or test suite to add.
     */
    TestSuite.prototype.add = function (to) {
        var items = this._items;
        items[items.length] = to;
    };

    /**
     * Retireves a collection of test cases and test suites.
     * @method getItems
     * @return {Array} Collection of test cases and test suites.
     */
    TestSuite.prototype.getItems = function () {
        return this._items;
    };




    /**
     * Stores test results.
     * @class TestResult
     * @namespace testboy
     * @constructor TestResult
     */
    var TestResult = function () {
        /**
         * Total number of run tests.
         * @property testCount
         * @type number
         */
        this.testCount = 0;

        /**
         * Total number of errors.
         * @property errorCount
         * @type number
         */
         this.errorCount = 0;

         /**
          * Collection of errors thrown during the tests.
          * @property errors
          * @type Array
          */
         this.errors = [];
    };

    testboy.TestResult = TestResult;

    /**
     * Resets the results.
     * @method reset
     */
    TestResult.prototype.reset = function () {
        this.testCount = 0;
        this.errorCount = 0;
        this.errors.length = 0;
    };

    /**
     * Adds an error to results.
     * @method addError
     * @param {Error} err Error object.
     */
    TestResult.prototype.addError =  function (err) {
        var errors = this.errors;
        errors[errors.length] = err;
        this.errorCount++;
    };

    /**
     * Increments the number of run tests.
     * @method incrementTestCount
     */
    TestResult.prototype.incrementTestCount = function () {
        this.testCount++;
    };
    
    /**
     * Determines whether the test is failed.
     * @method isFailed
     * @return {boolean}
     */
    TestResult.prototype.isFailed = function () {
        return !!this.errorCount;
    };
 
    /**
     * Determines whether the test is successful.
     * @method isSuccessful
     * @return {boolean}
     */
    TestResult.prototype.isSuccessful = function () {
        return !!!this.errorCount;
    };




    /**
     * Runs tests.
     * @class Runner
     * @namespace testboy
     * @constructor
     */
    var Runner = function () {

        /**
         * Tests results
         * @private
         * @property _results
         * @type testboy.TestResult
         */
        this._results = new TestResult();

        /** 
         * The root tests collection.
         * @private
         * @property _masterSuite
         * @type testboy.TestSuite
         */
        this._masterSuite = new TestSuite();
    };

    testboy.Runner = Runner;

    /**
     * Runs tests of a test case.
     * @private
     * @method _runTestCase
     * @param {testboy.TestCase} tc Test case to run tests.
     */
    Runner.prototype._runTestCase = function (tc) {
        var setUp = tc.setUp,
            tearDown = tc.tearDown,
            testName;

        logger.info("Running test case \"" + tc.name + "\"");
        for (testName in tc) {
            if (hasOwnProperty.call(tc, testName) && testName.indexOf("test") == 0) {
                try {
                    if (setUp) {
                        setUp();
                    }
                    tc[testName](); // run test
                    if (tearDown) {
                        tearDown();
                    }
                    logger.fine("Test \"" + testName + "\" passed.");
                } catch (err) {
                    this._results.addError(err);
                    logger.error("Test \"" + testName + "\" failed.\n" + err);
                }
                this._results.incrementTestCount();
            }
        }
    };

    /** 
     * Runs a test suite.
     * @private
     * @method _run
     * @param {testboy.TestSuite} ts Test suite to run.
     */
    Runner.prototype._run = function (ts) {
        var items = ts.getItems(),
            len = items.length,
            item;

            for (var i = 0; i < len; i++) {
                item = items[i];
                if (item instanceof TestSuite) {
                    this._run(item);
                } else {
                    this._runTestCase(item);
                }
            }
    };

    /** 
     * Adds a test case or test suite to the runner.
     * @method add
     * @param {testboy.TestSuite|testboy.TestCase} tc Test suite or test case to be added.
     */
    Runner.prototype.add = function (tc) {
        this._masterSuite.add(tc);
    };

    /**
     * Runs all tests.
     * @method run
     */
    Runner.prototype.run = function () {
        var results = this._results;

        results.reset();
        this._run(this._masterSuite);
        logger.info(["Test finished with ", results.errorCount, " error(s), ", 
                results.testCount - results.errorCount, "/", results.testCount, 
                " tests are passed."].join(SYM_EMPTY));
        if (results.isSuccessful()) {
            logger.info("TEST SUCCESSFUL");
        } else {
            logger.info("TEST FAILED");
        }
    };




    /**
     * <code>testboy.AssertionError</code> is thrown when an assertion fails.
     * @class AssertionError
     * @namespace testboy
     * @constructor AssertionError
     * @param {string} src Signature of an assertion method that failed (see getSignature()).
     * @param {string} message Error message.
     * @param {string} cause Detail description of a cause of an error.
     */
    var AssertionError = function (src, message, cause) {
        /**
         * Signature of an assertion method that failed.
         * @readonly
         * @property src
         * @type string
         */
        this.src = src;

        /**
         * Error message.
         * @readonly
         * @property message
         * @type string
         */
        this.message = message;

        /**
         * Detail description of a cause of an error.
         * @readonly
         * @property cause
         * @type string
         */
        this.cause = cause;
    };

    testboy.AssertionError = AssertionError;

    /** 
     * Name of the error type.
     * @property name
     * @type string
     */
    AssertionError.prototype.name = "testboy.AssertionError";

    /**
     * Retrieves a string expression of the error.
     * @method toString
     * @override
     * @return {string}
     */
    AssertionError.prototype.toString = function () {
        return [this.name, SYM_SEMICOLON, SYM_SPACE, this.message, "\n    at ", this.src, 
            ": ", this.cause].join(SYM_EMPTY);
    };




    /**
     * Testboy logger. Logs messages into the standard output target.
     * @class logger
     * @namespace testboy
     * @static
     */
    var logger = testboy.logger = {

        /**
         * @private
         * @method _post
         * @param {string} key Log mesage key.
         * @param {string} key Log mesage color.
         * @param {string} key Log mesage text.
         */
        _post: function (key, color, message) {
            var date = new Date();
                msg = [
                    addZero(date.getHours(), 2), SYM_SEMICOLON,
                    addZero(date.getMinutes(), 2), SYM_SEMICOLON,
                    addZero(date.getSeconds(), 2), SYM_SEMICOLON,
                    addZero(date.getMilliseconds(), 3), SYM_SPACE,
                    key, SYM_SPACE,
                    message
                ].join(SYM_EMPTY);
            out.writeln(msg, color);
        },

        /**
         * Logs the message without a timestamp.
         * @method log
         * @param {string} message The message to log.
         */
        log: function (message) {
            out.writeln(message, "black");
        },

        /**
         * Logs an info message.
         * @method info
         * @param {string} mesage The message to log.
         */
        info: function (message) {
            this._post("[info]", "gray", message);
        },

        /**
         * Logs a fine message.
         * @method fine
         * @param {string} mesage The message to log.
         */
        fine: function (message) {
            this._post("[fine]", "green", message);
        },

        /**
         * Logs a warning message.
         * @method warning
         * @param {string} mesage The message to log.
         */
        warning: function (message) {
            this._post("[warning]", "orange", message);
        },

        /**
         * Logs an error message.
         * @method error
         * @param {string} mesage The message to log.
         */
        error: function (message) {
            this._post("[error]", "red", message);
        }
    };




    /**
     * Provides methods for converting standard JavaScript values to human-readable strings.
     * @class debug
     * @namespace testboy
     * @static
     */
    var debug = testboy.debug = {

        /**
         * Retrieves a string containing a function name and its arguments types.
         * @static
         * @method getSignature
         * @param {string} name Function name.
         * @param {ArrayLike} args Collection of the function arguments.
         * @return {string}
         */
        getSignature: function (name, args) {
            var toString = [name, "("], i = 0, len = args.length - 1;
            for (; i < len; i++) {
                toString[toString.length] = typeof args[i];
                toString[toString.length] = ", ";
            }
            toString[toString.length] = typeof args[len];
            toString[toString.length] = ")";
            return toString.join(SYM_EMPTY);
        },

        /**
         * Retrieves string containing a value and the value type of the pattern: <code>type&lt;value&gt;</code>.
         * @param {*} value Value to convert in readable string.
         * @return {string}
         */
        valueToString: function (value) {
            return [typeof value, "<", String(value), ">"].join(SYM_EMPTY);
        }
    };




    /**
     * Provides assertion methods. Only failed assertions are recorded. These methods can be used 
     * directly: <code>testboy.asserts.assertTrue(...)</code>, however they are available in the
     * global context: <code>assertTrue(...)</code>.
     * @namespace testboy
     * @static
     * @class asserts
     */
    testboy.asserts = {

        /**
         * Asserts that a value is <code>true</code>.
         * @method assertTrue
         * @param {boolean} val Value to be checked. 
         * @param {string} message Optional. Message for the <code>AssertionError</code> to be 
         * displayed if the assertion fails.
         */
        assertTrue: function (val, message) {
            var src = debug.getSignature("assertTrue", arguments);
            if (val !== true) {
                throw new AssertionError(src, message, "Argument is other than " + debug.valueToString(true) + ".");
            }
        },

        /**
         * Asserts that a value is <code>false</code>.
         * @method assertFalse
         * @param {boolean} val Value to be checked. 
         * @param {string} message Optional. Message for the <code>AssertionError</code> to be 
         * displayed if the assertion fails.
         */
        assertFalse: function (val, message) {
            var src = debug.getSignature("assertFalse", arguments);
            if (val !== false) {
                throw new AssertionError(src, message, "Argument is other than " + debug.valueToString(false) + ".");
            }
        },

        /**
         * Asserts that two values are equal.
         * @method assertEquals
         * @param {boolean} expected Expected value. 
         * @param {boolean} actual Value to be checked against <code>expected</code>. 
         * @param {string} message Optional. Message for the <code>AssertionError</code> to be 
         * displayed if the assertion fails.
         */
        assertEquals: function (expected, actual, message) {
            var src = debug.getSignature("assertEquals", arguments);
            if (actual !== expected) {
                throw new AssertionError(src, message, ["Expected ", 
                    debug.valueToString(expected), " instead of ", 
                    debug.valueToString(actual), "."].join(SYM_EMPTY));
            }
        },

        /**
         * Asserts that a value is not <code>undefined</code>.
         * @method assertNotUndefined
         * @param {boolean} val Value to be checked. 
         * @param {string} message Optional. Message for the <code>AssertionError</code> to be 
         * displayed if the assertion fails.
         */
        assertNotUndefined: function (val, message) {
            var src = debug.getSignature("assertNotUndefined", arguments);
            if (val === UNDEFINED) {
                throw new AssertionError(src, message, "Argument is undefined.");
            }
        },

        /**
         * Asserts that a value is <code>undefined</code>.
         * @method assertUndefined
         * @param {boolean} val Value to be checked. 
         * @param {string} message Optional. Message for the <code>AssertionError</code> to be 
         * displayed if the assertion fails.
         */
        assertUndefined: function (val, message) {
            var src = debug.getSignature("assertUndefined", arguments);
            if (val !== UNDEFINED) {
                throw new AssertionError(src, message, "Argument is other than undefined.");
            }
        },

        /**
         * Asserts that a value is <code>null</code>.
         * @method assertNull
         * @param {boolean} val Value to be checked. 
         * @param {string} message Optional. Message for the <code>AssertionError</code> to be 
         * displayed if the assertion fails.
         */
        assertNull: function (val, message) {
            var src = debug.getSignature("assertNull", arguments);
            if (val !== null) {
                throw new AssertionError(src, message, "Argument is not null.");
            }
        },

        /**
         * Asserts taht a value is not <code>null</code>.
         * @method assertNotNull
         * @param {boolean} val Value to be checked. 
         * @param {string} message Optional. Message for the <code>AssertionError</code> to be 
         * displayed if the assertion fails.
         */
        assertNotNull: function (val, message) {
            var src = debug.getSignature("assertNotNull", arguments);
            if (val === null) {
                throw new AssertionError(src, message, "Argument is null.");
            }
        },

        /**
         * Asserts that a function throws an error.
         * @method assertError
         * @param {Function} fun Function to test.
         * @param {Object} args The <code>arguments</code> object or an array of arguments to pass 
         * in <code>fun</code>.
         * @param {Object} thisArg Determines the value of <code>this</code> inside <code>fun</code>. 
         * If <code>thisArg</code> is <code>null</code> or <code>undefined</code>, <code>this</code>
         * will be the global object. Otherwise, <code>this</code> will be equal to 
         * <code>Object(thisArg)</code>.
         * @param {string} message Optional. Message for the <code>AssertionError</code> to be 
         * displayed if the assertion fails.
         */
        assertError: function (fun, args, thisArg, message) {
            var src = debug.getSignature("assertError", arguments), 
            thrown = false;

            try {
                fun.apply(thisArg, args);
            } catch (err) {
                thrown = true;
            }
            if (!thrown) {
                throw new AssertionError(src, message, "Error wasn't thrown when it was expected.");
            }
        },

        /**
         * Asserts that a function throws no errors.
         * @method assertNoError
         * @param {Function} fun Function to test.
         * @param {Object} args The <code>arguments</code> object or an array of arguments to pass 
         * in <code>fun</code>.
         * @param {Object} thisArg Determines the value of <code>this</code> inside <code>fun</code>. 
         * If <code>thisArg</code> is <code>null</code> or <code>undefined</code>, <code>this</code>
         * will be the global object. Otherwise, <code>this</code> will be equal to 
         * <code>Object(thisArg)</code>.
         * @param {string} message Optional. Message for the <code>AssertionError</code> to be 
         * displayed if the assertion fails.
         */
        assertNoError: function (fun, args, thisArg, message) {
            var src = debug.getSignature("assertNoError", arguments), 
            thrown = false;

            try {
                fun.apply(thisArg, args);
            } catch (err) {
                thrown = true;
            }
            if (thrown) {
                throw new AssertionError(src, message, "Error was thrown when it was not expected.");
            }
        }
    };


    // standard runner
    var runner = testboy.runner = new Runner();

    // standard output target
    var out = testboy.out = new OutputTarget();


    // globalazing assertion methods
    testboy.globalize("assertTrue", testboy.asserts.assertTrue);
    testboy.globalize("assertFalse", testboy.asserts.assertFalse);
    testboy.globalize("assertEquals", testboy.asserts.assertEquals);
    testboy.globalize("assertNotUndefined", testboy.asserts.assertNotUndefined);
    testboy.globalize("assertUndefined", testboy.asserts.assertUndefined);
    testboy.globalize("assertNull", testboy.asserts.assertNull);
    testboy.globalize("assertNotNull", testboy.asserts.assertNotNull);
    testboy.globalize("assertError", testboy.asserts.assertError);
    testboy.globalize("assertNoError", testboy.asserts.assertNoError);

} (testboy));


