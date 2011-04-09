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



/**
 * Testboy.
 * JavaScript Unit Testing Framework.
 * 
 * @module testboy
 * @author Ivan Sialitski
 */
var testboy = testboy || {};

(function (testboy) {

    /**
     * Provides common util methods and serves as a namespace for the testboy object library.
     * @static
     * @class testboy
     */

    // main costants
    var SYM_EMPTY = "",
        SYM_SPACE = " ",
        SYM_SEMICOLON = ":",

        // undefined constant
        UNDEFINED,

        // reference to the document object
        doc = window.document,

        // alias for Object's hasOwnProperty method
        hasOwn = Object.prototype.hasOwnProperty,

        // used in addZero
        ZERO_CHARS =  ["0", "0", "00"],

        /**
         * Adds one or more zero characters to the beginning of the specified number value
         * casted to string type.
         * @private
         * @method addZero
         * @param {number} n the number value to add zero chars to.
         * @param {nummber} c length of the result string.
         * @return {string} the formatted number.
         */
        addZero = function (n, c) {
            var num = String(n), add = c - num.length;
            if (add > 0) {
                return ZERO_CHARS[add] + num;
            }
            return n;
        };


    /**
     * The standard output target.
     * @static
     * @property out
     * @type testboy.OutputTarget
     */
     //testboy.out;

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
     * Inherits prototype of the parent constructor to the child constructor. Decorates the child 
     * constructor with <code>_super</code> property which refers to the perent's constructor
     * prototype.
     * @method extend
     * @param {function} ctor Child constructor.
     * @param {function} ctor Parent constructor.
     */
    testboy.extend = function (ctor, superCtor) {
        var Tc = function () {}; 
        Tc.prototype = superCtor.prototype;
        ctor.prototype = new Tc();
        ctor._super = superCtor.prototype;
        superCtor.prototype.constructor = superCtor;
    };


    /**
     * Provides functionality for writing colored lines of text in the target element.
     * @namespace testboy
     * @class OutputTarget
     * @constructor OutputTarget
     * @param {Element} el HTML element to be used as an output target.
     */
    testboy.OutputTarget = function (el) {

        /**
         * The source html element.
         * @private
         * @property _src
         * @type Element
         */
        this._src = el;
    };

    testboy.OutputTarget.prototype = {

        /**
         * Creates an HTML element to be used as an output target.
         * @private 
         * @method _createDom
         */
        _createDom: function () {
            this._src = doc.createElement("pre");
            // add the element to the DOM
            if (doc.body) {
                doc.body.appendChild(this._src);
            }
        },

        /**
         * Writes a line into the target element.
         * @private
         * @method _writeln
         * @param {string} text Text to write.
         * @param {string} color Optional. Defines a color for <code>text</code>.
         */
        _writeln: function (text, color) {
            var el = doc.createElement("span"); // only inline element is allowed by HTML strict.dtd
            el.innerHTML = text + "\n";
            if (color) {
                el.style.color = color;
            }
            this._src.appendChild(el);
        },

        /**
         * Writes a line of text in the target element.
         * @method writeln
         * @param {string} text Text to write.
         * @param {string} color Optional. Defines a color for <code>text</code>.
         */
        writeln: function (text, color) {
            if (!this._src) {
                this._createDom();
            }
            this._writeln(text, color);
            this.writeln = this._writeln;
        },
        
        /**
         * Clears the content of the output target.
         * @method clear
         */
        clear: function () {
            var src = this._src;
            if (src) {
                src.innerHTML = SYM_EMPTY;
            }
        }
    };


    testboy.out = new testboy.OutputTarget();


    /**
     * Testboy logger. Logs messages into the page.
     * @namespace testboy
     * @static
     * @class logger
     */
    testboy.logger = {

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
            testboy.out.writeln(msg, color);
        },

        /**
         * Logs the message without a timestamp.
         * @method log
         * @param {string} message The message to log.
         */
        log: function (message) {
            testboy.out.writeln(message, "black");
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
     * Simple set of tests.
     * @namespace testboy
     * @class TestCase
     * @constructor TestCase
     * @param {string} name Name of the test case.
     */
    testboy.TestCase = function (name) {

        /**
         * Name of the test case.
         * @property name
         * @type string
         */
        this.name = name;
    };

    testboy.TestCase.prototype = {

        /**
         * Sets up the fixture. This method is invoked before the test(s). Empty by default.
         * @method setUp
         */
        setUp: function () {},

        /**
         * Tears down the fixture. This method is invoked after the test(s). Empty by default.
         * @method tearDown
         */
        tearDown: function () {}
    };


    /**
     * Contains set of test cases and test suites that share the same fixture.
     * @namespace testboy
     * @class TestSuite
     * @constructor TestSuite
     * @param {string} name Name of the test suite.
     */
    testboy.TestSuite = function (name) {

        /**
         * Name of the test suite.
         * @property name
         * @type string
         */
        this.name = name;

        /**
         * Set of test objects.
         * @property items
         * @type Array
         */
        this.items = [];
    };

    testboy.TestSuite.prototype = {

        /**
         * Adds the specified test object to the suite.
         * @method add
         * @param {testboy.TestCase|testboy.TestSuite|Object} to Test object to add.
         */
        add: function (to) {
            var items = this.items;
            items[items.length] = to;
        },

        /**
         * Sets up the fixture. This method is invoked before the test(s).
         * @method setUp
         */
        setUp: function () {},

        /**
         * Tears down the fixture. This method is invoked after the test(s).
         * @method tearDown
         */
        tearDown: function () {}
    };


    /**
     * Stores test results.
     * @namespace testboy
     * @class TestResult
     * @constructor TestResult
     */
    testboy.TestResult = function () {

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
         * Collection of errors thrown during the test.
         * @property errors
         * @type Array
         */
        this.errors = [];
    };

    testboy.TestResult.prototype = {

        /**
         * Resets the results.
         * @method reset
         */
        reset: function () {
            this.errorCount = 0;
            this.testCount = 0;
            this.errors.length = 0;
        },

        /**
         * Adds an error to the results.
         * @method addError
         * @param {Error} err Error object.
         */
        addError: function (err) {
            this.errors[this.errors.length] = err;
            this.errorCount++;
        },

        /**
         * Increments number of run tests.
         * @method incrementTestCount
         */
        incrementTestCount: function () {
            this.testCount++;
        },

        /**
         * Determines whether the test is failed.
         * @method isFailed
         * @return {boolean} true if the test failed, false otherwise.
         */
        isFailed: function () {
            return !!this.errorCount;
        },

        /**
         * Determines whether the test is successful.
         * @method isSuccessful
         * @type boolean
         * @return true if the test is successful, false otherwise.
         */        
        isSuccessful: function () {
            return !!!this.errorCount;
        }
    };


    /**
     * Runs tests and stores results.
     * @namespace testboy
     * @static
     * @class runner
     */
    testboy.runner = {

        /**
         * @private
         * @property _tcCounter
         * @type number
         */
        _tcCounter: 0,

        /**
         * Test results.
         * @private
         * @property _result
         * @type testboy.TestResult
         */
        _result: new testboy.TestResult(),

        /** 
         * The master suite containing all test objects.
         * @private
         * @property _masterSuite
         * @type testboy.TestSuite
         */
        _masterSuite: new testboy.TestSuite(),

        /**
         * Runs tests of the passed test case.
         * @private
         * @method _runTestCase
         * @param {testboy.TestCase|Object} tc the test case to run.
         */
        _runTestCase: function (tc) {
            var setUp = tc.setUp,
                tearDown = tc.tearDown,
                testName;

            testboy.logger.info("Running test case \"" + tc.name + "\"");

            if (setUp) {
                setUp();
            }
            for (testName in tc) {
                if (hasOwn.call(tc, testName) && testName.indexOf("test") == 0) {
                    try {
                        tc[testName]();
                        testboy.logger.fine("Test \"" + testName + "\" passed.");
                    } catch (err) {
                        this._result.addError(err);
                        testboy.logger.error("Test \"" + testName + "\" failed.\n" + err);
                    }
                    this._result.incrementTestCount();
                }
            }
            if (tearDown) {
                tearDown();
            }
        },

        /**
         * Runs the passed test suite
         * @private
         * @method _run
         * @param {testboy.TestSuite} suite the suite to run.
         */
        _run: function (suite) {
            var items = suite.items, len = items.length, item;

            for (var i = 0; i < len; i++) {
                item = items[i];
                if (item instanceof testboy.TestSuite) {
                    this._run(item);
                } else {
                    this._runTestCase(item);
                }
            }
        },


        /**
         * Adds the test object to the runner.
         * @method add
         * @param {testboy.TestCase|testboy.TestSuite|Object} to Test object to add.
         */
        add: function (to) {
            this._masterSuite.add(to);
        },

        /**
         * Runs the tests that were added to the runner.
         * @method run
         */
        run: function () {
            var result = this._result;

            this._result.reset(); // reset the test results

            this._run(this._masterSuite);

            testboy.logger.info(["Test finished with ", result.errorCount, " error(s), ", 
                result.testCount - result.errorCount, "/", result.testCount, 
                " tests are passed."].join(SYM_EMPTY));

            if (result.isSuccessful()) {
                testboy.logger.info("TEST SUCCESSFUL");
            } else {
                testboy.logger.info("TEST FAILED");
            }
        }
    };


    /**
     * Provides methods for converting standard JavaScript values to readable strings.
     * @namespace testboy
     * @static
     * @class ref
     */
    testboy.ref = {

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
            return [typeof value, "&lt;", value, "&gt;"].join(SYM_EMPTY);
        }
    };


    /**
     * <code>testboy.AssertionError</code> is thrown when an assertion fails.
     * @namespace testboy
     * @class AssertionError
     * @constructor AssertionError
     * @param {string} src Signature of an assertion method that failed (see getSignature()).
     * @param {string} message Error message.
     * @param {string} cause Detail description of a cause of an error.
     */
    testboy.AssertionError = function (src, message, cause) {

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

    /**
     * Error type name.
     * @readonly
     * @property name
     * @type string
     */
    testboy.AssertionError.prototype.name = "testboy.AssertionError";

    /**
     * Retrieves a string representation of an error object.
     * @method toString
     * @return {string} String representation of an error object.
     */
    testboy.AssertionError.prototype.toString = function () {
        return [this.name, SYM_SEMICOLON, SYM_SPACE, this.message, "\n&nbsp;&nbsp;&nbsp;&nbsp;at ", this.src, 
            ": ", this.cause].join(SYM_EMPTY);
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
            var src = testboy.ref.getSignature("assertTrue", arguments);
            if (val !== true) {
                throw new testboy.AssertionError(src, message, "Argument is other than boolean&lt;true&gt;.");
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
            var src = testboy.ref.getSignature("assertFalse", arguments);
            if (val !== false) {
                throw new testboy.AssertionError(src, message, "Argument is other than" + testboy.ref.valueToString(false) + ".");
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
            var src = testboy.ref.getSignature("assertEquals", arguments);
            if (actual !== expected) {
                throw new testboy.AssertionError(src, message, ["Expected ", 
                    testboy.ref.valueToString(expected), " instead of ", 
                    testboy.ref.valueToString(actual), "."].join(SYM_EMPTY));
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
            var src = testboy.ref.getSignature("assertNotUndefined", arguments);
            if (val === UNDEFINED) {
                throw new testboy.AssertionError(src, message, "Argument is undefined.");
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
            var src = testboy.ref.getSignature("assertUndefined", arguments);
            if (val !== UNDEFINED) {
                throw new testboy.AssertionError(src, message, "Argument is other than undefined.");
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
            var src = testboy.ref.getSignature("assertNull", arguments);
            if (val !== null) {
                throw new testboy.AssertionError(src, message, "Argument is not null.");
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
            var src = testboy.ref.getSignature("assertNotNull", arguments);
            if (val === null) {
                throw new testboy.AssertionError(src, message, "Argument is null.");
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
            var src = testboy.ref.getSignature("assertNotNull", arguments), 
            thrown = false;

            try {
                fun.apply(scope, args);
            } catch (err) {
                thrown = true;
            }
            if (thrown) {
                throw new testboy.AssertionError(src, message, "Error was thrown when it was not expected.");
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
        assertNoError: function () {
            var src = testboy.ref.getSignature("assertNotNull", arguments), 
            thrown = false;

            try {
                fun.apply(scope, args);
            } catch (err) {
                thrown = true;
            }
            if (!thrown) {
                throw new testboy.AssertionError(src, message, "Error wasn't thrown when it was expected.");
            }
        }
    };

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