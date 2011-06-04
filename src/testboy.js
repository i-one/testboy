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
        SYM_NEW_LINE = "\n",
        SYM_SEMICOLON = ":",

        ZERO_CHARS =  ["0", "0", "00"],

        // alias
        hasOwnProperty = Object.prototype.hasOwnProperty,

        globalized = {},

        parseDiv = doc.createElement("div"),

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
        },

        bind = function (fn, obj) {
            return function () {
                return fn.apply(obj, arguments);
            }
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
     * Makes global aliases for all enumerable methods of an object.
     * @method globalize
     * @param {Object} obj Object to globalize methods.
     */
    testboy.globalize = function (obj) {
        var methodNames = [], i, name;

        // select names of all enumerable properties that contain functions.
        for (i in obj) {
            if (typeof obj[i] == types.FUNCTION) {
                if (globalized[i]) {
                    continue;
                } else if (window[i] !== types.UNDEFINED_VALUE) {
                    logger.error(["Global variable ", i, " is already defined"].join(SYM_EMPTY));
                    continue;
                }
                methodNames[methodNames.length] = i;
            }
        }

        if (!methodNames.length) {
            return;
        }

        if (/MSIE/.test(window.navigator.userAgent)) {
            var script = [];
            for (i = 0, len = methodNames.length; i < len; i++) {
                script[script.length] = "var " + methodNames[i] + ";";
            }
            window.execScript(script.join(SYM_EMPTY));
        }

        // globalize methods
        for (i = 0, len = methodNames.length; i < len; i++) {
            name = methodNames[i];
            window[name] = bind(obj[name], obj);
            globalized[name] = true; // remember names of the globalized methods
        }
    };




    /**
     * Enumeration of standard JavaScript types.
     * @static
     * @class types
     * @namespace testboy
     */
    var types = testboy.types = {
        FUNCTION: typeof function () {},
        OBJECT: typeof {},
        BOOLEAN: typeof true,
        NUMBER: typeof 12,
        STRING: typeof "abc"
    };
    types.UNDEFINED_VALUE;
    types.UNDEFINED = typeof types.UNDEFINED_VALUE;




    /**
     * Provides information about the browser.
     * @static
     * @class browser
     * @namespace testboy
     */
    var browser = testboy.browser = {};

    /**
     * Determines that the browser is MSIE.
     * @property ie
     * @type boolean
     */ 
    browser.ie = false;

    /**
     * Determines that the browser is Firefox.
     * @property ff
     * @type boolean
     */
    browser.ff = false;

    /**
     * Contains the browser name.
     * @property name
     * @type string
     */
    browser.name = "";

    /**
     * Contains the browser version. This property is type of string, if you need this information
     * of number type, you should use <code>testboy.browser.versionNumber</code>.
     * @property version
     * @type boolean
     */
    browser.version = "";

    /**
     * The browser version number.
     * @property versionNumber
     * @type number
     */
    browser.versionNumber = -1;

    /**
     * Determines whether the browser is supported by the Testboy.
     * @property isSupported
     * @type boolean
     */
    browser.isSupported = false;

    /**
     * Determines whether the browser is running in the strict mode.
     * @property isInStrictMode
     * @type boolean
     */
    browser.isInStrictMode = doc.compatMode == "CSS1Compat";

    /**
     * Inits the object's properties.
     * @private
     * @method _init
     */
    browser._init = function () {
        var ua = window.navigator.userAgent,
            match;

        if (match = /(MSIE)\s(\d+.\d+)/.exec(ua)) {
            this.ie = true;
        } else if (match = /(Firefox)\/(\S+)/.exec(ua)) {
            this.ff = true;
        }

        if (match) {
            this.name = match[1];
            this.version = match[2];
            this.versionNumber = parseFloat(match[2]);
            this.isSupported = true;
        }
    };
    browser._init();




    /**
     * Allows to build string comprised from several lines having the same indention.
     * @class StringBuilder
     * @namespace testboy
     * @constructor StringBuilder
     * @param {string} str First line text.
     */
    var StringBuilder = function (str) {
        if (str) {
            this._buffer = [str];
        } else {
            this._buffer = [];
        }

        this._arr = [];
    };

    testboy.StringBuilder = StringBuilder;

    /**
     * Number of space characters to set indention.
     * @property indention
     * @type number
     */
    StringBuilder.prototype.indention = 0;

    /**
     * Appends a line of text to the string.
     * @method appendLine
     * @param {string} str Text to append.
     */
    StringBuilder.prototype.appendLine = function (str) {
        var buf = this._buffer,
            indention = this.indention,
            arr = this._arr,
            line;

        if (indention > 0) {
            arr.length = indention + 1;
            line = SYM_NEW_LINE + arr.join(" ") + str;
        } else {
            line = SYM_NEW_LINE + str;
        }
        buf[buf.length] = line;
    };

    /**
     * Retirieves the string.
     * @method toString
     * @return string
     */
    testboy.StringBuilder.prototype.toString = function () {
        return this._buffer.join(SYM_EMPTY);
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
        this._src = el || null;
    };

    testboy.OutputTarget = OutputTarget;

    /**
     * Creates DOM for an <code>OutputTarget</code> instance.
     * @private
     * @method _createDom
     */
    OutputTarget.prototype._createDom = function () {
        this._src = doc.createElement("pre");
        this._src.style.lineHeight = "18px";
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
     * Retrieves the source HTML element of the output target.
     * @method getSrcElement
     * @return {Element}
     */
    OutputTarget.prototype.getSrcElement = function () {
        return this._src;
    };

    /**
     * Sets the source element for the output target.
     * @method setSrcElement
     * @param {Element} src Element to set.
     */
    OutputTarget.prototype.setSrcElement = function (src) {
        this._src = src;
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

        /**
         * Collection of tests.
         * @property tests
         * @type Array
         */
        this.tests = {};

        /**
         * Determines whether the test case contains tests.
         * @property hasTests
         * @type boolean
         */
        this.hasTests = false;
    };

    testboy.TestCase = TestCase;

    /**
     * Adds a test to the test case.
     * @private 
     * @method _addTest
     * @param {string} name Name of a test.
     * @param {Function} fn Test function.
     */
    TestCase.prototype._addTest = function (name, fn) {
        this.tests[name] = fn;
    };

    /**
     * Adds a test to the test case.
     * @method test
     * @param {string} name Name of a test.
     * @param {Function} fn Test function.
     */
    TestCase.prototype.test = function (name, fn) {
        this.hasTests = true;
        this.test = this._addTest;
        this.test(name, fn);
    };

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
     * This method is invoked before the tests are run.
     * @method runBefore
     */
    TestCase.prototype.runBefore = function () {};

    /**
     * This method is invoked after the tests are run.
     */
    TestCase.prototype.runAfter = function () {};




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
     * Retrieves the number of test cases or test suites added to this suite.
     * @method getSize
     * @return number
     */
    TestSuite.prototype.getSize = function () {
        return this._items.length;
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

         /**
          * Collection of failures.
          * @property failures
          * @type Array
          */
         this.failures = [];
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

    TestResult.prototype.addFailure = function (failure) {
        var failures = this.failures;
        failures[failures.length] = failure;
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
            runBefore = tc.runBefore,
            runAfter = tc.runAfter,
            tests = tc.tests,
            results = this._results,
            testName,
            sb;

        logger.info("Running test case \"" + tc.name + "\".");

        if (runBefore) {
            runBefore.call(tc);
        }
        for (testName in tests) {
            try {
                if (setUp) {
                    setUp.call(tc);
                }
                tests[testName].call(tc); // run test
                if (tearDown) {
                    tearDown.call(tc);
                }
                logger.fine("Test \"" + testName + "\" passed.");
            } catch (err) {
                if (err instanceof AssertionError) {
                    results.addFailure(err);
                    sb = ['Test "', testName, '" failed.', SYM_NEW_LINE, err];
                } else {
                    results.addError(err);
                    sb = ['Error during test "', testName, '"',SYM_NEW_LINE, err];
                }
                logger.error(sb.join(SYM_EMPTY));
            }
            this._results.incrementTestCount();
        }
        if (runAfter) {
            runAfter.call(tc);
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
        var results = this._results,
            mode = testboy.browser.isInStrictMode ? "the strict mode" : "the quirks mode";

        results.reset();

        if (testboy.browser.isSupported) {
            logger.info("Running in brwoser: " + testboy.browser.name);
            logger.info("Browser version: " + testboy.browser.version);
        } else {
            logger.warning("Unsupported browser.");
        }
        
        logger.info("The page is processed in " + mode);
        logger.info("Started");

        this._run(this._masterSuite);

        logger.info(["Done", SYM_NEW_LINE, 
            "Tests run: ", results.testCount, "; ",
            "Failures: ", results.failures.length, "; ",
            "Errors: ", results.errorCount, "; ", 
            SYM_NEW_LINE,
            results.isSuccessful() ? "TEST SUCCESSFUL" : "TEST FAILED"
        ].join(''));
    };

    /**
     * Retrieves the size of the master suite.
     * @method getSize
     * @return number
     */
    Runner.prototype.getSize = function () {
        return this._masterSuite.getSize();
    };

    /**
     * Determines whether the runner is empty.
     * @method isEmpty
     * @return boolean
     */
    Runner.prototype.isEmpty = function () {
        return this._masterSuite.getSize() == 0;
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
        return [this.name, SYM_SEMICOLON, SYM_SPACE, this.message, "\n",
            this.cause, "\nat ", this.src].join(SYM_EMPTY);
    };


    var HtmlConsole = function (el) {
        this._src_ = el || null;
    };

    testboy.HtmlConsole = HtmlConsole;

    HtmlConsole.styles = {
        "fine": "green",
        "info": "#5f5f5f",
        "warn": "orange",
        "error": "red"
    };

    HtmlConsole.prototype.isRendered = false;

    HtmlConsole.prototype.createDom = function () {
        parseDiv.innerHTML = '<pre style="background-color: white; line-height: 18px;"></pre>';
        this._src_ = parseDiv.firstChild;
    };

    HtmlConsole.prototype.render = function () {
        if (!this._src_) {
            this.createDom();
        }
        appendToBody(this._src_);
        this.isRendered = true;
    };

    HtmlConsole.prototype._log = function (key, message) {
        parseDiv.innerHTML = ['<span style="color:', HtmlConsole.styles[key], '">', message, 
            '</span>'].join(SYM_EMPTY);
        this._src_.appendChild(parseDiv.firstChild);
        this._src_.appendChild(doc.createTextNode(SYM_NEW_LINE));
    };

    HtmlConsole.prototype.log = function (key, message) {
        if (!this.isRendered) {
            this.render();
        }
        this.log = this._log;
        this.log(key, message);
    };




    /**
     * Adapts the native browser console to support the loge target interface.
     * @static
     * @class browserConsole
     * @namesapce testboy
     */
    var browserConsole = testboy.browserConsole = {};

    /**
     * The native browser console.
     * @private
     * @property _console
     * @type Object
     */
    browserConsole._console = null;

    /**
     * Determines whether the console is available for logging.
     * @property isAvailable
     * @type boolean
     */
    browserConsole.isAvailable = false;

    /**
     * Logs a message of the specified type into the console.
     * @method log
     * @param {string} key Log message key: "fine", "info", "warn" or "error".
     * @param {string} message Message to log.
     */
    browserConsole.log = function (key, message) {
        switch (key) {
            case "error": browserConsole._console.error(message); break;
            case "fine": browserConsole._console.info(message); break;
            case "warn": browserConsole._console.warn(message); break;
            case "info": browserConsole._console.info(message); break;
        }
    };

    // init browserConsole
    if (window.console) {
        browserConsole._console = window.console;
        browserConsole.isAvailable = true;
    }




    /**
     * Testboy logger. Logs messages into the standard output target.
     * @class logger
     * @namespace testboy
     * @static
     */
    var logger = testboy.logger = {};

    logger._targets = [];

    /**
     * Determines whether the logger is enabled.
     * @property enabled
     * @type boolean
     */
    logger.enabled = true;

    logger.addTarget = function (target) {
        var targets = logger._targets;
        targets[targets.length] = target;
    };

    logger.log = function (key, message) {
        if (!this.enabled) {
            return;
        }

        var targets = logger._targets,
            len = targets.length,
            date = new Date(),
            sb = [
                addZero(date.getHours(), 2), SYM_SEMICOLON,
                addZero(date.getMinutes(), 2), SYM_SEMICOLON,
                addZero(date.getSeconds(), 2), SYM_SEMICOLON,
                addZero(date.getMilliseconds(), 3), SYM_SPACE,
                "[", key, "]", SYM_SPACE,
                message
            ].join(SYM_EMPTY);

        for (var i = 0; i < len; i++) {
            targets[i].log(key, sb);
        }
    };

    logger.info = function (message) {
        logger.log("info", message);
    };

    logger.warn = function (message) {
        logger.log("warn", message);
    };

    logger.error = function (message) {
        logger.log("error", message);
    };

    logger.fine = function (message) {
        logger.log("fine", message);
    };



    /**
     * Provides methods for converting standard JavaScript values to human-readable strings.
     * @class debug
     * @namespace testboy
     * @static
     */
    var debug = testboy.debug = {

        _extractFuncitonName: function (fn) {
            var toString = Function.prototype.toString,
                re = /function\s+(\w+)\(/;
            var match = re.exec(toString.call(fn));
            if (match) {
                return match[1];
            } else {
                return "[anonymous]";
            }
        },

        /**
         * Retrieves a string containing a function name and its arguments types.
         * @static
         * @method getSignature
         * @param {ArrayLike} args Collection of the function arguments.
         * @param {string} name Optional. Function name.
         * @return {string}
         */
        getSignature: function (args, name) {
            var name = name || this._extractFuncitonName(args.callee),
                valueToString = this.valueToString,
                arr = [name, "("],
                i = 0,
                len = args.length - 1,
                type;

            for (; i < len; i++) {
                type = typeof args[i];
                arr[arr.length] = valueToString(args[i]);
                arr[arr.length] = ", ";
            }
            type = typeof args[i];
            arr[arr.length] = valueToString(args[i]);
            arr[arr.length] = ")";
            return arr.join(SYM_EMPTY);
        },

        /**
         * Retrieves string containing a value and the value type of the pattern: <code>type&lt;value&gt;</code>.
         * @param {*} value Value to convert in readable string.
         * @return {string}
         */
        valueToString: function (value) {
            var type = typeof value,
                val = value;

            if (type == types.FUNCTION) {
                val = "[function]";
            } else if (type == types.OBJECT) {
                val = "[object]";
            } else if (type == types.STRING) {
                val = "\"" + val + "\"";
            } else {
                val = String(value);
            }
            return ["{", type, "}", val].join(SYM_EMPTY);
        },

        /**
         * Retrieves a string describing properties of the passed object. Only enumerable properties
         * are included.
         * @method printObject
         * @param {Object} obj Object to print properties.
         * @param {Object} comment Optional. Short message describing the object.
         */
         // dir()
        printObject: function (o, comment) {
            var sb = new testboy.StringBuilder(comment),
                propertyName;
            
            sb.indention = 4;
            for (propertyName in o) {
                sb.appendLine(propertyName + ": " + debug.valueToString(o[propertyName]));
            }
            return sb.toString();
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
            var src = debug.getSignature(arguments, "assertTrue");
            if (val !== true) {
                throw new AssertionError(src, message, "Argument is other than " + debug.valueToString(true));
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
            var src = debug.getSignature(arguments, "assertFalse");
            if (val !== false) {
                throw new AssertionError(src, message, "Argument is other than " + debug.valueToString(false));
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
            var src = debug.getSignature(arguments, "assertEquals");
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
            var src = debug.getSignature(arguments, "assertNotUndefined");
            if (val === UNDEFINED) {
                throw new AssertionError(src, message, "Argument is undefined");
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
            var src = debug.getSignature(arguments, "assertUndefined");
            if (val !== UNDEFINED) {
                throw new AssertionError(src, message, "Argument is other than undefined");
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
            var src = debug.getSignature(arguments, "assertNull");
            if (val !== null) {
                throw new AssertionError(src, message, "Argument is not null");
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
            var src = debug.getSignature(arguments, "assertNotNull");
            if (val === null) {
                throw new AssertionError(src, message, "Argument is null");
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
            var src = debug.getSignature(arguments, "assertError"), 
            thrown = false;

            try {
                fun.apply(thisArg, args);
            } catch (err) {
                thrown = true;
            }
            if (!thrown) {
                throw new AssertionError(src, message, "Error is not thrown when it is expected");
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
            var src = debug.getSignature(arguments, "assertNoError"),
            thrown = false;

            try {
                fun.apply(thisArg, args);
            } catch (err) {
                thrown = true;
            }
            if (thrown) {
                throw new AssertionError(src, message, "Error is thrown when it is not expected");
            }
        },

        assertInstanceOf: function (obj, ctor, message) {
            var src = debug.getSignature(arguments, "assertInstanceOf");
            if (!(obj instanceof ctor)) {
                throw new AssertionError(src, message, "Object is not instance of the specified constructor");
            }
        }
    };


    // standard runner
    var runner = testboy.runner = new Runner();

    // standard output target
    var out = testboy.out = new HtmlConsole();

    // standard test case
    var standardTestCase = new TestCase("default");

    // add logger targets
    logger.addTarget(out);
    if (browserConsole.isAvailable) {
        logger.addTarget(browserConsole);
    }




    /**
     * Provides handy aliases that are useful when writing test cases. Methods of this 
     * class can be globalized with 
     * <code>testboy.globalize(testboy.alias)</code>. Usage example:
     * <pre>
     *   testboy.globalize(testboy.alias);
     *   
     *   testCase("My Test Case", function () {
     *
     *       setUp(function () {
     *           // set up the fixture
     *       });
     *
     *       test("Test alert() command", function () {
     *           assertTrue(alert != undefined, "'alert' should be available");
     *       });
     *       
     *        tearDown(fnuction () {
     *           // tear down the fixture
     *        });
     *
     *   });
     * </pre>
     * @static
     * @class alias
     * @namespace testboy
     */
    var alias = testboy.alias = {
        /**
         * Creates a test case with the specified name and adds it to the standard runner. 
         * This test case becomes the standard, thus <code>testboy.test()</code> will add 
         * tests to this test case. Short form for: <code> new testboy.TestCase(name)</code>.
         * Example:
         * <pre>
         *    var testCase = new testboy.TestCase("My Test");
         *    testCase.test("test 1", function () {
         *        assertTrue(true);
         *    });
         * 
         *    // the same as
         *    testboy.testCase("My Test", function () {
         * 
         *       test("test 1", function () {
         *            assertTrue(true);
         *       });
         *    });
         * </pre>
         * This form allows using local variables instead of object level variables.
         * @method testCase
         * @param {string} name Name of a test case.
         */
        testCase: function (name, fn) {
            standardTestCase = new TestCase(name);
            if (fn) {
                fn(testboy);
            }
            runner.add(standardTestCase);
        },

        /**
         * Alias for <code>TestCase.prototype.test()</code>. Adds a test function to the
         * standard test case. See <code>testboy.testCase()</code>.
         * @method test
         * @param {sting} name Test name. Any string including spaces, special chars etc.
         * @param {Function} fn Test function. It will be invoked when thst case is runner by 
         * a runner.
         */
        test: function (name, fn) {
            if (!standardTestCase) {
                throw new Error("No test case defined.");
            }
            standardTestCase.test(name, fn);
        },

        /**
         * Alias for <code>TestCase.prototype.runBefore()</code>. This method is invoked before 
         * any test is run.
         * @method runBefore
         * @param {Function} fn Test function. It will be invoked when thst case is runner by 
         * a runner.
         */
        runBefore: function (fn) {
            standardTestCase.runBefore = fn;
        },


        setUp: function (fn) {
            standardTestCase.setUp = fn;
        },

        tearDown: function (fn) {
            standardTestCase.tearDown = fn;
        },

        start: function () {
            if (runner.isEmpty() && standardTestCase.hasTests) {
                runner.add(standardTestCase);
            }
            runner.run();
        }
    };


} (testboy));
 


