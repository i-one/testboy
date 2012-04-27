

/**
 * Testboy global variable.
 */
var testboy = {};


(function (testboy) {

    'use strict';

    var UNDEF,

        // string constants
        STRING_SEMICOLON = ':',
        STRING_EMPTY = '',

        // used in addZero() funciton
        ZERO_ARRAY = ['', '0', '00'],

        // local aliases
        win = window,
        document = win.document,

        Type,
        TestCase,
        TestSuite,
        HtmlConsole,
        TestResult,
        ResultCollector,
        Runner,
        AssertionError,
        Mocks,

        assert,
        out,

        standardTestCase,

        // used for parsing HTML code
        parseDiv = document.createElement('div'),

        // funciton that does nothing.
        emptyFn = function () {},

        /**
         * Retrieves the current time in milliseconds. Shortcut for <code>(new Date).getTime()</code>.
         * @return number
         */
        getCurrentTime = function () {
            return (new Date()).getTime();
        },

        /**
         * Parses HTML string and returns an HTML element.
         * @param {string} html HTML code to parse.
         * @return HTMLElement
         */
        parseHTML = function (html) {
            parseDiv.innerHTML = html;
            return parseDiv.firstChild;
        },

        /**
         * Writes the passed HTML string in the current document. Shortcut for 
         * <code>document.write()</code>. Shouldn't be used after the document is fully parsed by a browser.
         * @param {string} html HTML string to write in the current document at the parsing time.
         */
        writeHTML = function (html) {
            document.write(html);
        },

        /**
         * Casts the passed number to the string type and adds one or more "0" characters to beginning 
         * of the newly created string.
         * @param {number} n Number to stringify.
         * @param {number} c Expected length of the result string.
         */
        addZero = function (n, c) {
            var num = String(n), add = c - num.length;
            if (add > 0) {
                return ZERO_ARRAY[add] + num;
            }
            return n;
        },

        /**
         * Throws an error
         * @param {string} message Error message.
         */
        throwError = function (message) {
            out.error(message);
            throw new Error(message);
        };


    /**
     * Testboy API version.
     * @type string
     */
    testboy.version = "testboy 1.2 homebuilt";




    //=========================================================================
    // testboy.TypeName

    Type = {
        FUNCTION:   typeof function () {},
        OBJECT:     typeof {},
        BOOLEAN:    typeof true,
        NUMBER:     typeof 12,
        STRING:     typeof 'str'
    };
    Type.UNDEFINED_VALUE = UNDEF; // constant for the 'undefined' value
    Type.UNDEFINED = typeof Type.UNDEFINED_VALUE;

    /**
     * Retrieves a string containing type and value of the passed argument.
     * @param {*} value Value to describe.
     * @return {string} a string consising of the type and value of the passed argument.
     */
    Type.describe = function (value) {
        return ['{', typeof value, '} ', value].join(STRING_EMPTY);
    };


    //==========================================================================
    // testboy.TestCase

    /**
     * Simple set of tests.
     * @constructor
     * @param {string=} name Optonal. Name of a test case.
     */
    TestCase = function (name) {
        if (name) {
            this.name = name;
        }
        this._tests = {};
        this.fixture = {};
    };

    /**
     * @static
     * @const 
     * @type {string}
     */
    TestCase.DEFAULT_TEST_NAME = 'Test #';

    /**
     * This counter is used to generate names for test functions. 
     * @type {number}
     * @private
     */
    TestCase._testNameCounter = 0;

    TestCase.prototype = {

        /**
         * Map of test functions.
         * @type {Obejct}
         */
        _tests: null,

        /**
         * Contains name of the test case.
         * @type {string}
         */
        name: 'Unnamed Test Case',

        /**
         * Length of the test case, contains a number of the tests.
         * @type {number}
         */
        length: 0, // TODO make it private

        /**
         * Adds a test function to the test case.
         * @param {string} name Name of a test. Should be a unique string thus a test case shouldn't
         * contain two test functions with the same name.
         * @param {Function} fn the function to add.
         */
        addTest: function (name, fn) {
            if (fn === Type.UNDEFINED_VALUE) {
                fn = name;
                name = TestCase.DEFAULT_TEST_NAME + ++TestCase._testNameCounter;
            } else {
                if (this._tests[name]) {
                    throw new Error('Test case already contains a test with the given name');
                }
            }
            this._tests[name] = fn;
            this.length++;
        },

        /**
         * Sets up the fixture. Called before a test is run.
         */
        setup: emptyFn,

        /**
         * Sets up the fixture. Called after a test is run.
         */
        teardown: emptyFn
    };


    //==========================================================================
    // testboy.TestSuite

    /**
     * Container for test cases.
     * @constructor
     */
    TestSuite = function (name) {
        this.name = name;
        this.items = [];
    };

    TestSuite.prototype = {

        /**
         * Name of the test suite.
         * @type {string}
         */
        name: 'Unnamed Test Suite',

        /**
         * Array of test suites and test cases.
         * @type {Array}
         */
        items: null,

        /**
         * Adds a test case or test suite to the test suite.
         * @param {testboy.TestCase|testboy.TestSuite} caseOrSuite Test case or test suite to add.
         */
        add: function (caseOrSuite) {
            this.items[this.items.length] = caseOrSuite;
        },

        /**
         * Retrieves the length of the test suite collection.
         * @return {number}
         */
        getLength: function () {
            return this.items.length;
        },

        /**
         * Determines whether the test suite collection is empty.
         * @return {boolean}
         */
        isEmpty: function () {
            return this.items.length === 0;
        }
    };


    //=========================================================================
    // testboy.HtmlConsole

    /**
     * Pour implementation of a console component.
     * @constructor
     */
    HtmlConsole = function () {};

    // Console message types.
    HtmlConsole.FINE =      'fine';
    HtmlConsole.INFO =      'info';
    HtmlConsole.WARNING =   'warning';
    HtmlConsole.ERROR =     'error';

    /**
     * Mapping message types to css class names.
     * @static
     */
     // TODO: use the constants for the property names???
    HtmlConsole.messageStyle = {
        'fine':     'fin',
        'info':     'inf',
        'warning':  'war',
        'error':    'err'
    };

    HtmlConsole.prototype = {

        /**
         * HTML markup.
         * @type {string}
         * @private
         */
        _html: '<div class="tb-console"><pre class="tb-c-ln inf">Testboy Console\n' + testboy.version + '</pre></div>',

        /**
         * Console html element
         * @type {HTMLElement}
         * @private
         */
        _srcElement: null,

        /**
         * Comparator function for an object's property names.
         * @private
         */
        _comparePropertyNames: function (a, b) {
            if (a > b) {
                return -1;
            } else if (b > a) {
                return 1;
            } else {
                return 0;
            }
        },

        /**
         * @private
         */
        _getSortedObjectPropertyNameArray: function (obj) {
            var methodNames = [],
                methodNamesLength = methodNames.length,
                propertyNames = [],
                propertyNamesLength = propertyNames.length,
                propertyName;

            for (propertyName in obj) {
                if (obj.hasOwnProperty(propertyName)) {
                    if (typeof obj[propertyName] === Type.FUNCTION) {
                        methodNames[methodNamesLength++] = propertyName;
                    } else {
                        propertyNames[propertyNamesLength++] = propertyName;
                    }
                }
            }
            methodNames.sort(this._comparePropertyNames);
            propertyNames.sort(this._comparePropertyNames);
            return propertyNames.concat(methodNames);
        },

        /**
         * Logs a message of the given type.
         * @private
         */
        _log: function (type, message) {
            if (arguments.length === 1) {
                // if only one argument passed, assume this is an info message
                message = type;
                type = HtmlConsole.INFO;
            }
            var messageHTML = ['<pre class="tb-c-ln ', HtmlConsole.messageStyle[type], '">', message, '</pre>'].join(STRING_EMPTY);
            this._srcElement.appendChild(parseHTML(messageHTML));
        },

        /**
         * Logs a message of the specified type. The current implementation supports 4 message 
         * types: FINE, INFO, WARNING and ERROR. Static constants of this constructor can be used
         * to specify the type. They are "fine", "info", "warning" and "error" strings respectively.
         * If the source HTML element isn't created yet, the method will create it and render at the 
         * end of the BODY element.
         * 
         * @param {string} type Type of a message.
         * @param {string} type Message to log.
         */
        log: function (type, message) {
            if (!this._srcElement) {
                // ofourse, the console is not rendered yet
                this._srcElement = parseHTML(this._html); // create the source element.
                if (document.body) {
                    // if the body html element is available, render the console in there.
                    document.body.appendChild(this._srcElement);
                }
            }
            // the code above will be executed only once.
            this.log = this._log;
            this.log(type, message);
        },

        /**
         * Logs an error message.
         * @param {string} message Error message to log.
         */
        error: function (message) {
            this.log(HtmlConsole.ERROR, message);
        },

        /**
         * Logs a warning message.
         * @param {string} message Warning message to log.
         */
        warning: function (message) {
            this.log(HtmlConsole.WARNING, message);
        },

        /**
         * Logs an info message.
         * @param {string} message Info message to log.
         */
        info: function (message) {
            this.log(HtmlConsole.INFO, message);
        },

        /**
         * Lists enumerable properties of the passed object.
         * @param {Object} obj Object to list properties.
         * @param {boolean} hidePseudoPrivate Optional. Determines whether to hide properties 
         * that start with an underscore character. All properties are listed, if unspecified.
         * @param {string} comment Optional. User comment a about the object.
         */
        dir: function (obj, hidePseudoPrivate, comment) {
            if (typeof obj === Type.FUNCTION) {
                obj = obj.prototype;
            }

            var sb = [],    // string builder array
                sbLen = sb.length,  // its length
                properties = this._getSortedObjectPropertyNameArray(obj),   // sorded array of propery names
                propsLen = properties.length,   // length of the array of property names
                pn,     // property name
                value,  // property value
                i;  // loop counter

            sb[sbLen++] = '>>> dir(): ';

            if (comment) {
                sb[sbLen++] = comment;
            }

            for (i = 0; i < propsLen; i++) {
                pn = properties[i];
                if (hidePseudoPrivate) {
                    if (pn.indexOf('_') === 0) {
                        continue;
                    }
                }
                sb[sbLen++] = '\n    <span class="tb-pn">';
                sb[sbLen++] = pn;
                sb[sbLen++] = '</span>: ';
                value = obj[pn];
                sb[sbLen++] = typeof value === 'function' ? '[function]' : value;
            }
            this.log(sb.join(''));
        },

        /**
         * Clears content of the console by removing all children nodes of the source
         * element.
         */
        clear: function () {
            this._srcElement.innerHTML = '';
        }
    };


    //==========================================================================
    // testboy.TestResult

    /**
     * Contains information about a result of a single test.
     * @constructor
     * @param {string} testCaseName Name of a test case.
     * @param {string} testName Name of a test.
     * @param {boolean} passed Sets whether a test is passed.
     * @param {Error} errorObject Optional. Error object if a test is failed.
     */
    TestResult = function (testCaseName, testName, passed, errorObject) {

        /**
         * Name of a test case.
         * @type stirng
         */
        this.testCaseName = testCaseName;

        /**
         * Name of a test.
         * @type string
         */
        this.testName = testName;

        /**
         * Determines whether a test is passed.
         * @type boolean
         */
        this.isPassed = passed;

        /**
         * Determines whether a test is failed.
         * @type boolean
         */
        this.isFailed = !passed;

        /**
         * Error object, in case a test is failed.
         * type Error
         */
        this.error = errorObject || null;

        /**
         * Time (milliseconds) when the test result is retrieved.
         * @type {number}
         */
        this.timeStamp = getCurrentTime();
    };




    /**
     * Collects/logs results during testing.
     * @constructor
     */
    ResultCollector = function () {
        this.startTime = 0;
        this.endTime = 0;
        this.results = [];
        this.failures = 0;
    };

    ResultCollector.prototype = {

        /**
         * Time when testing is started.
         * @type {number}
         */
        startTime: 0,

        /**
         * Time when testing is finished.
         * @type {number}
         */
        endTime: 0,

        /**
         * Array of test results.
         * @type {Array}
         */
        results: null,

        /**
         * Number of failed tests.
         * @type {number}
         */
        failures: 0,

        /**
         * Name of a test case that is being run.
         * @type {string}
         */
        _currentTestCaseName: '',

        /**
         * Sets/determines whether test events are logged.
         * @type {boolean}
         */
        enableLogging: true,

        /**
         * Logs a test event into the console.
         * @private
         * @param {string} type Optional. Log message type (see testboy.HtmlConsole constants);
         * @param {string} message Message to log
         */
        _log: function (type, message) {
            if (!this.enableLogging) {
                return;
            }

            if (arguments.length === 1) {
                message = type;
                type = HtmlConsole.INFO;
            }

            var date = new Date(),
                logMessage = [
                    addZero(date.getHours(), 2), STRING_SEMICOLON,
                    addZero(date.getMinutes(), 2), STRING_SEMICOLON,
                    addZero(date.getSeconds(), 2), STRING_SEMICOLON,
                    addZero(date.getMilliseconds(), 3), ' [', type, '] ',
                    message
                ].join(STRING_EMPTY);

            out.log(type, logMessage);
        },

        /**
         * Logs a test result.
         * @private
         * @param {testboy.TestResult} testResult Test result to log.
         */
        _logTestResult: function (testResult) {
            if (testResult.isPassed) {
                this._log(HtmlConsole.FINE, ['Test "', testResult.testName,
                    '" passed.'].join(STRING_EMPTY));
            } else {
                this._log(HtmlConsole.ERROR, ['Test "', testResult.testName,
                    '" failed.\n', testResult.error].join(STRING_EMPTY));
            }
        },

        /**
         * @private
         */
        _logSummary: function () {
            var msg;
            if (!this.isFailed()) {
                msg = 'SUITE SUCCESSFULL';
            } else {
                msg = 'SUITE FAILED';
            }
            this._log([msg, '\nTests run: ', this.results.length, ', failed: ', this.failures]
                .join(STRING_EMPTY));
        },

        /**
         * Adds a test result to the collection.
         * @private
         * @param {testboy.TestResult} testResult Test result to add.
         */
        _addResult: function (testResult) {
            var results = this.results;
            results[results.length] = testResult;
            this._logTestResult(testResult);
        },

        /**
         * Determines whether the whole test suite is failed.
         * @return {boolean}
         */
        isFailed: function () {
            return this.failures > 0;
        },

        /**
         * Resets the state to the default. Forgives all results.
         */
        resetState: function () {
            this.startTime = 0;
            this.endTime = 0;
            this.results.length = 0;
            this.failures = 0;
        },

        /**
         * Invoked when the runner starts running tests.
         */
        onStart: function () {
            this.startTime = (new Date()).getTime();
            this._log("Started");
        },

        /**
         * Invoked when the runner stops.
         */
        onFinish: function () {
            this.endTime = (new Date()).getTime();
            this._logSummary();
            this._log('Done');
        },

        /**
         * Invoked when a test case is started.
         * @param {string} name Name of a test case.
         */
        onTestCaseStarted: function (name) {
            this._currentTestCaseName = name;
            this._log('Running test case "' + name + '"');
        },

        /**
         * Invoked when a test is successfully passed.
         * @param {string} testName Name of a test.
         */
        onTestPassed: function (testName) {
            this._addResult(new TestResult(this._currentTestCaseName, testName, true));
        },

        /**
         * Invoked when a test is failed.
         * @param {string} testName Name of a test.
         * @param {Error} err Error object.
         */
        onTestFailed: function (testName, err) {
            this._addResult(new TestResult(this._currentTestCaseName, testName, false, err));
            this.failures++;
        }
    };


    //==========================================================================
    // testboy.Runner

    /**
     * Runs tests. Uses a <code>TestSuite</code> instance to store test cases and a 
     * <code>ResultCollector</code> to log test information.
     * @constructor
     */
    Runner = function () {
        this._masterSuite = new TestSuite('master suite');
        this.resultCollector = new ResultCollector();
    };

    Runner.prototype = {

        /**
         * Master suite to keep test cases.
         * @type {testboy.TestSuite}
         * @private
         */
        _masterSuite: null,

        /**
         * Instance of <code>testboy.ResultCollector</code> to gather test information.
         * @type testboy.ResultCollector
         */
        resultCollector: null,

        /**
         * Runs a test case.
         * @private
         * @param {testboy.TestCase} testCase Test case to run.
         */
        _runTestCase: function (testCase) {
            var tests = testCase._tests,
                setup = testCase.setup,
                teardown = testCase.teardown,
                rc = this.resultCollector,
                testFn,
                testName;

            rc.onTestCaseStarted(testCase.name);

            if (testCase.length === 0) {
                // the test case has no registered tests
                // attempt to find test methods in the old way

                for (testName in testCase) {
                    if (testCase.hasOwnProperty(testName)) {
                        if (testName.indexOf('test') === 0) {
                            // found a test method
                            testFn = testCase[testName];
                            try {
                                setup.call(testCase);
                                testFn.call(testCase, assert);
                                teardown.call(testCase);
                                rc.onTestPassed(testName);
                            } catch (ex) {
                                rc.onTestFailed(testName, ex);
                            }
                        }
                    }
                }
            } else {
                for (testName in tests) {
                    if (tests.hasOwnProperty(testName)) {
                        testFn = tests[testName];
                        try {
                            setup.call(testCase);
                            testFn.call(testCase, assert);
                            teardown.call(testCase);
                            rc.onTestPassed(testName);
                        } catch (ex2) {
                            rc.onTestFailed(testName, ex2);
                        }
                    }
                }
            }
        },

        /**
         * Runs tests of the passed suite recursively.
         * @private
         * @param {testboy.TestSuite} suite Suite to run.
         */
        _run: function (suite) {
            var items = suite.items,
                item,
                i,
                len;

            for (i = 0, len = items.length; i < len; i++) {
                item = items[i];
                if (item instanceof TestCase) {
                    this._runTestCase(item);
                } else {
                    this._run(item);
                }
            }
        },

        /**
         * Retrieves the master suite that contains all test cases for this runner.
         * @return {testboy.TestSuite}
         */
        getMasterSuite: function () {
            return this._masterSuite;
        },

        /**
         * Adds a test suite or test case to the runner.
         * @param {testboy.TestSuite|testboy.TestCase} caseOrSuite Test case or test suite to add.
         */
        add: function (caseOrSuite) {
            this._masterSuite.add(caseOrSuite);
        },

        /**
         * Runs all tests added to the runner.
         */
        run: function () {
            var rc = this.resultCollector;
            rc.onStart();
            this._run(this._masterSuite);
            rc.onFinish();
        }
    };


    //==========================================================================
    // testboy.AssertionError

    /**
     * Contains assertion error details.
     * @constructor
     * @param {string} message
     * @param {string} cause
     * @param {string} srcFn
     */
    AssertionError = function (message, cause, srcFn) {
        this.message = message;
        this.cause = cause;
        this.funcName = srcFn || '[anonymous]()';
    };

    AssertionError.prototype = {

        /**
         * Name of the error type.
         * @type string
         */
        name: 'testboy.AssertionError',

        toString: function () {
            return [this.name, ': ', this.message, '\n',
                this.cause, '\nat ', this.funcName].join(STRING_EMPTY);
        }
    };


    //=========================================================================
    // testboy.assert


    /**
     * Object contains a set of assertion methods.
     */
    assert = {

        /**
         * Tests whether an object has a property with the specified name.
         */
        hasProperty: function (obj, propertyName, message) {
            if (obj[propertyName] === Type.UNDEFINED_VALUE) {
                throw new AssertionError(message, "Object doesn't have '" + propertyName
                    + "' method or property", "testboy.assert.hasProperty()");
            }
        },

        is: function (actual, expected, message) {
            if (actual !== expected) {
                throw new AssertionError(message, "Expected value " + Type.describe(expected)
                    + " instead of " + Type.describe(actual), "testboy.assert.is()");
            }
        },

        isTrue: function (value, message) {
            if (value !== true) {
                throw new AssertionError(message, "Passed value is not " + Type.describe(true),
                    "testboy.assert.isTrue()");
            }
        },

        isFalse: function (value, message) {
            if (value !== false) {
                throw new AssertionError(message, "Passed value is not " + Type.describe(false),
                    "testboy.assert.isFalse()");
            }
        },

        /**
         * Asserts that the passed value is other than null or undefined.
         */
        isSomething: function (value, message) {
            if (value === Type.UNDEFINED_VALUE || value === null) {
                throw new AssertionError(message, "Passed value is " + Type.describe(value),
                    "testboy.assert.isSomething()");
            }
        },

        /**
         * Asserts that the passed value is not undefined.
         */
        isNotUndefined: function (value, message) {
            if (value === Type.UNDEFINED_VALUE) {
                throw new AssertionError(message, "Passed value is " + Type.describe(value),
                    "testboy.assert.isNotUndefined()");
            }
        },

        isUndefined: function (value, message) {
            if (value !== Type.UNDEFINED_VALUE) {
                throw new AssertionError(message, "Passed value is other than "
                    + Type.describe(Type.UNDEFINED_VALUE), "testboy.assert.isUndefined()");
            }
        },

        isNull: function (value, message) {
            if (value !== null) {
                throw new AssertionError(message, "Passed value is other than "
                    + Type.describe(null), "testboy.assert.isNull()");
            }
        },

        isNotNull: function (value, message) {
            if (value === null) {
                throw new AssertionError(message, "Passed value is " + Type.describe(value),
                    "testboy.assert.isNotNull()");
            }
        },

        isTypeOf: function (value, typeName, message) {
            if (typeof value !== typeName) {
                throw new AssertionError(message, "Passed value is not of " + typeName + "type",
                    "testboy.assert.isTypeOf()");
            }
        },

        isInstanceOf: function (value, ctor, message) {
            if (!value instanceof ctor) {
                throw new AssertionError(message, "Passed value is not an instance of the specified constructor",
                    "testboy.assert.isInstanceOf()");
            }
        },

        throwsNoError: function (fn, message) {
            var thrown = false,
                error;
            try {
                fn();
            } catch (e) {
                error = e;
                thrown = true;
            }
            if (thrown) {
                throw new AssertionError(message, "Function threw an error\n" + error,
                    "testboy.assert.throwsNoError()");
            }
        },

        throwsError: function (fn, message) {
            var thrown = false;
            try {
                fn();
            } catch (e) {
                thrown = true;
            }
            if (!thrown) {
                throw new AssertionError(message, "Function didn't throw an error when it was expected",
                    "testboy.assert.throwsError()");
            }
        }
    };


    //==========================================================================
    // testboy.Mocks

    /**
     * 
     * @constructor
     * @param {Document} doc Document to create mock elements.
     */
    Mocks = function (doc) {
        if (!doc) {
            throw new Error('Cannot create instance of testboy.Mocks: the document isn\'t specified');
        }
        this._doc = doc;
    };

    Mocks.prototype = {

        /**
         * @type {Document}
         * @private
         */
        _doc: null,

        /**
         * @return {HTMLElement}
         */
        div: function () {
            return this._doc.createElement('div');
        },

        element: function () {
            return this._doc.createElement('span');
        },

        anchor: function (href) {
            var anchor = this._doc.createElement('a');
            anchor.setAttribute('href', href);
        }
    };


    /**
     * Creates a test case and registers it at the default runner.
     * @param {string} name Name of the newly created test case.
     */
    testboy.createTestCase = function (name) {
        var testCase = new TestCase(name);
        testboy.runner.add(testCase);
        return testCase;
    };

    testboy.run = function () {
        testboy.runner.run();
    };

    testboy.test = function (name, fn) {
        if (!standardTestCase) {
            standardTestCase = testboy.createTestCase('Standard Test Case');
        }
        standardTestCase.addTest(name, fn);
    };

    // export constructors
    testboy.Type = Type;
    testboy.TestCase = TestCase;
    testboy.TestSuite = TestSuite;
    testboy.HtmlConsole = HtmlConsole;
    testboy.TestResult = TestResult;
    testboy.ResultCollector = ResultCollector;
    testboy.Runner = Runner;
    testboy.AssertionError = AssertionError;
    testboy.Mocks = Mocks;

    testboy.assert  = assert;
    testboy.mocks   = new Mocks(document);
    testboy.out     = out = new HtmlConsole();
    testboy.runner  = new Runner();

    // write the styles used by testboy ui components (e.g. HtmlConsole)
    writeHTML('<style type="text/css">.tb-console {display: block;font-family:courier new;font-size: 9pt;border:1px solid #ccc;border-width: 1px 1px 0 1px} .tb-console .tb-c-ln {display:block;padding:2px;border-bottom: 1px solid #ccc;margin: 0;} .tb-console .tb-c-ln.fin {color: green;} .tb-console .tb-c-ln.inf {color: black;} .tb-console .tb-c-ln.war {color: orange;} .tb-console .tb-c-ln.err {color: red;} .tb-console .tb-pn {color: #881391;}</style>');


}(testboy));


