(function (global) {
  var process = {
    title: 'browser',
    browser: true,
    env: {},
    argv: [],
    nextTick: function (fn) {
      setTimeout(fn, 0)
    },
    cwd: function () {
      return '/'
    },
    chdir: function () {
    }
  };
  // Require module
  function require(file, callback) {
    if ({}.hasOwnProperty.call(require.cache, file))
      return require.cache[file];
    // Handle async require
    if (typeof callback == 'function') {
      require.load(file, callback);
      return
    }
    var resolved = require.resolve(file);
    if (!resolved)
      throw new Error('Failed to resolve module ' + file);
    var module$ = {
      id: file,
      require: require,
      filename: file,
      exports: {},
      loaded: false,
      parent: null,
      children: []
    };
    var dirname = file.slice(0, file.lastIndexOf('/') + 1);
    require.cache[file] = module$.exports;
    resolved.call(module$.exports, module$, module$.exports, dirname, file);
    module$.loaded = true;
    return require.cache[file] = module$.exports
  }
  require.modules = {};
  require.cache = {};
  require.resolve = function (file) {
    return {}.hasOwnProperty.call(require.modules, file) ? require.modules[file] : void 0
  };
  // define normal static module
  require.define = function (file, fn) {
    require.modules[file] = fn
  };
  global.require = require;
  // source: /Users/dtai/work/verus/crowdcontrol/src/data/index.coffee
  require.define('./data', function (module, exports, __dirname, __filename) {
    var policy;
    policy = require('./data/policy');
    module.exports = {
      Api: require('./data/api'),
      Source: require('./data/source'),
      Policy: policy.Policy,
      TabularRestfulStreamingPolicy: policy.TabularRestfulStreamingPolicy
    }
  });
  // source: /Users/dtai/work/verus/crowdcontrol/src/data/policy.coffee
  require.define('./data/policy', function (module, exports, __dirname, __filename) {
    var Policy, Q, TabularRestfulStreamingPolicy, _, extend = function (child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key]
        }
        function ctor() {
          this.constructor = child
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor;
        child.__super__ = parent.prototype;
        return child
      }, hasProp = {}.hasOwnProperty;
    _ = require('underscore/underscore');
    Q = require('q/q');
    Policy = function () {
      Policy.prototype.intervalTime = Infinity;
      Policy.prototype.source = null;
      Policy.prototype.events = null;
      Policy.prototype.unload = function () {
      };
      Policy.prototype.load = function (res) {
        var d, data;
        d = Q.defer();
        data = res.data;
        d.resolve(data);
        return d.promise
      };
      function Policy(options) {
        this.options = options;
        _.extend(this, this.options)
      }
      Policy.Once = new Policy;
      return Policy
    }();
    TabularRestfulStreamingPolicy = function (superClass) {
      extend(TabularRestfulStreamingPolicy, superClass);
      function TabularRestfulStreamingPolicy() {
        return TabularRestfulStreamingPolicy.__super__.constructor.apply(this, arguments)
      }
      TabularRestfulStreamingPolicy.prototype.load = function (res) {
        var d, data, fail, failed, i, id, j, len, togo;
        d = Q.defer();
        data = res.data;
        if (!_.isArray(data)) {
          d.resolve(data);
          return d.promise
        }
        togo = 0;
        failed = false;
        fail = function (res) {
          togo--;
          return d.reject(res.message)
        };
        for (i = j = 0, len = data.length; j < len; i = ++j) {
          id = data[i];
          if (!_.isObject(id)) {
            togo++;
            data[i] = null;
            (function (_this) {
              return function (id, i) {
                var success;
                success = function (res) {
                  var datum, k, len1, partialData;
                  togo--;
                  data[i] = res.data;
                  if (togo === 0) {
                    return d.resolve(data)
                  } else if (!failed) {
                    partialData = [];
                    for (k = 0, len1 = data.length; k < len1; k++) {
                      datum = data[k];
                      if (datum != null) {
                        partialData.push(datum)
                      }
                    }
                    return d.notify(partialData)
                  }
                };
                return _this.source.api.get(_this.source.path + '/' + id).then(success, fail)
              }
            }(this)(id, i))
          }
        }
        return d.promise
      };
      return TabularRestfulStreamingPolicy
    }(Policy);
    module.exports = {
      Policy: Policy,
      TabularRestfulStreamingPolicy: TabularRestfulStreamingPolicy
    }
  });
  // source: /Users/dtai/work/verus/crowdcontrol/node_modules/underscore/underscore.js
  require.define('underscore/underscore', function (module, exports, __dirname, __filename) {
    //     Underscore.js 1.8.3
    //     http://underscorejs.org
    //     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
    //     Underscore may be freely distributed under the MIT license.
    (function () {
      // Baseline setup
      // --------------
      // Establish the root object, `window` in the browser, or `exports` on the server.
      var root = this;
      // Save the previous value of the `_` variable.
      var previousUnderscore = root._;
      // Save bytes in the minified (but not gzipped) version:
      var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;
      // Create quick reference variables for speed access to core prototypes.
      var push = ArrayProto.push, slice = ArrayProto.slice, toString = ObjProto.toString, hasOwnProperty = ObjProto.hasOwnProperty;
      // All **ECMAScript 5** native function implementations that we hope to use
      // are declared here.
      var nativeIsArray = Array.isArray, nativeKeys = Object.keys, nativeBind = FuncProto.bind, nativeCreate = Object.create;
      // Naked function reference for surrogate-prototype-swapping.
      var Ctor = function () {
      };
      // Create a safe reference to the Underscore object for use below.
      var _ = function (obj) {
        if (obj instanceof _)
          return obj;
        if (!(this instanceof _))
          return new _(obj);
        this._wrapped = obj
      };
      // Export the Underscore object for **Node.js**, with
      // backwards-compatibility for the old `require()` API. If we're in
      // the browser, add `_` as a global object.
      if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
          exports = module.exports = _
        }
        exports._ = _
      } else {
        root._ = _
      }
      // Current version.
      _.VERSION = '1.8.3';
      // Internal function that returns an efficient (for current engines) version
      // of the passed-in callback, to be repeatedly applied in other Underscore
      // functions.
      var optimizeCb = function (func, context, argCount) {
        if (context === void 0)
          return func;
        switch (argCount == null ? 3 : argCount) {
        case 1:
          return function (value) {
            return func.call(context, value)
          };
        case 2:
          return function (value, other) {
            return func.call(context, value, other)
          };
        case 3:
          return function (value, index, collection) {
            return func.call(context, value, index, collection)
          };
        case 4:
          return function (accumulator, value, index, collection) {
            return func.call(context, accumulator, value, index, collection)
          }
        }
        return function () {
          return func.apply(context, arguments)
        }
      };
      // A mostly-internal function to generate callbacks that can be applied
      // to each element in a collection, returning the desired result — either
      // identity, an arbitrary callback, a property matcher, or a property accessor.
      var cb = function (value, context, argCount) {
        if (value == null)
          return _.identity;
        if (_.isFunction(value))
          return optimizeCb(value, context, argCount);
        if (_.isObject(value))
          return _.matcher(value);
        return _.property(value)
      };
      _.iteratee = function (value, context) {
        return cb(value, context, Infinity)
      };
      // An internal function for creating assigner functions.
      var createAssigner = function (keysFunc, undefinedOnly) {
        return function (obj) {
          var length = arguments.length;
          if (length < 2 || obj == null)
            return obj;
          for (var index = 1; index < length; index++) {
            var source = arguments[index], keys = keysFunc(source), l = keys.length;
            for (var i = 0; i < l; i++) {
              var key = keys[i];
              if (!undefinedOnly || obj[key] === void 0)
                obj[key] = source[key]
            }
          }
          return obj
        }
      };
      // An internal function for creating a new object that inherits from another.
      var baseCreate = function (prototype) {
        if (!_.isObject(prototype))
          return {};
        if (nativeCreate)
          return nativeCreate(prototype);
        Ctor.prototype = prototype;
        var result = new Ctor;
        Ctor.prototype = null;
        return result
      };
      var property = function (key) {
        return function (obj) {
          return obj == null ? void 0 : obj[key]
        }
      };
      // Helper for collection methods to determine whether a collection
      // should be iterated as an array or as an object
      // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
      // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
      var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
      var getLength = property('length');
      var isArrayLike = function (collection) {
        var length = getLength(collection);
        return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX
      };
      // Collection Functions
      // --------------------
      // The cornerstone, an `each` implementation, aka `forEach`.
      // Handles raw objects in addition to array-likes. Treats all
      // sparse array-likes as if they were dense.
      _.each = _.forEach = function (obj, iteratee, context) {
        iteratee = optimizeCb(iteratee, context);
        var i, length;
        if (isArrayLike(obj)) {
          for (i = 0, length = obj.length; i < length; i++) {
            iteratee(obj[i], i, obj)
          }
        } else {
          var keys = _.keys(obj);
          for (i = 0, length = keys.length; i < length; i++) {
            iteratee(obj[keys[i]], keys[i], obj)
          }
        }
        return obj
      };
      // Return the results of applying the iteratee to each element.
      _.map = _.collect = function (obj, iteratee, context) {
        iteratee = cb(iteratee, context);
        var keys = !isArrayLike(obj) && _.keys(obj), length = (keys || obj).length, results = Array(length);
        for (var index = 0; index < length; index++) {
          var currentKey = keys ? keys[index] : index;
          results[index] = iteratee(obj[currentKey], currentKey, obj)
        }
        return results
      };
      // Create a reducing function iterating left or right.
      function createReduce(dir) {
        // Optimized iterator function as using arguments.length
        // in the main function will deoptimize the, see #1991.
        function iterator(obj, iteratee, memo, keys, index, length) {
          for (; index >= 0 && index < length; index += dir) {
            var currentKey = keys ? keys[index] : index;
            memo = iteratee(memo, obj[currentKey], currentKey, obj)
          }
          return memo
        }
        return function (obj, iteratee, memo, context) {
          iteratee = optimizeCb(iteratee, context, 4);
          var keys = !isArrayLike(obj) && _.keys(obj), length = (keys || obj).length, index = dir > 0 ? 0 : length - 1;
          // Determine the initial value if none is provided.
          if (arguments.length < 3) {
            memo = obj[keys ? keys[index] : index];
            index += dir
          }
          return iterator(obj, iteratee, memo, keys, index, length)
        }
      }
      // **Reduce** builds up a single result from a list of values, aka `inject`,
      // or `foldl`.
      _.reduce = _.foldl = _.inject = createReduce(1);
      // The right-associative version of reduce, also known as `foldr`.
      _.reduceRight = _.foldr = createReduce(-1);
      // Return the first value which passes a truth test. Aliased as `detect`.
      _.find = _.detect = function (obj, predicate, context) {
        var key;
        if (isArrayLike(obj)) {
          key = _.findIndex(obj, predicate, context)
        } else {
          key = _.findKey(obj, predicate, context)
        }
        if (key !== void 0 && key !== -1)
          return obj[key]
      };
      // Return all the elements that pass a truth test.
      // Aliased as `select`.
      _.filter = _.select = function (obj, predicate, context) {
        var results = [];
        predicate = cb(predicate, context);
        _.each(obj, function (value, index, list) {
          if (predicate(value, index, list))
            results.push(value)
        });
        return results
      };
      // Return all the elements for which a truth test fails.
      _.reject = function (obj, predicate, context) {
        return _.filter(obj, _.negate(cb(predicate)), context)
      };
      // Determine whether all of the elements match a truth test.
      // Aliased as `all`.
      _.every = _.all = function (obj, predicate, context) {
        predicate = cb(predicate, context);
        var keys = !isArrayLike(obj) && _.keys(obj), length = (keys || obj).length;
        for (var index = 0; index < length; index++) {
          var currentKey = keys ? keys[index] : index;
          if (!predicate(obj[currentKey], currentKey, obj))
            return false
        }
        return true
      };
      // Determine if at least one element in the object matches a truth test.
      // Aliased as `any`.
      _.some = _.any = function (obj, predicate, context) {
        predicate = cb(predicate, context);
        var keys = !isArrayLike(obj) && _.keys(obj), length = (keys || obj).length;
        for (var index = 0; index < length; index++) {
          var currentKey = keys ? keys[index] : index;
          if (predicate(obj[currentKey], currentKey, obj))
            return true
        }
        return false
      };
      // Determine if the array or object contains a given item (using `===`).
      // Aliased as `includes` and `include`.
      _.contains = _.includes = _.include = function (obj, item, fromIndex, guard) {
        if (!isArrayLike(obj))
          obj = _.values(obj);
        if (typeof fromIndex != 'number' || guard)
          fromIndex = 0;
        return _.indexOf(obj, item, fromIndex) >= 0
      };
      // Invoke a method (with arguments) on every item in a collection.
      _.invoke = function (obj, method) {
        var args = slice.call(arguments, 2);
        var isFunc = _.isFunction(method);
        return _.map(obj, function (value) {
          var func = isFunc ? method : value[method];
          return func == null ? func : func.apply(value, args)
        })
      };
      // Convenience version of a common use case of `map`: fetching a property.
      _.pluck = function (obj, key) {
        return _.map(obj, _.property(key))
      };
      // Convenience version of a common use case of `filter`: selecting only objects
      // containing specific `key:value` pairs.
      _.where = function (obj, attrs) {
        return _.filter(obj, _.matcher(attrs))
      };
      // Convenience version of a common use case of `find`: getting the first object
      // containing specific `key:value` pairs.
      _.findWhere = function (obj, attrs) {
        return _.find(obj, _.matcher(attrs))
      };
      // Return the maximum element (or element-based computation).
      _.max = function (obj, iteratee, context) {
        var result = -Infinity, lastComputed = -Infinity, value, computed;
        if (iteratee == null && obj != null) {
          obj = isArrayLike(obj) ? obj : _.values(obj);
          for (var i = 0, length = obj.length; i < length; i++) {
            value = obj[i];
            if (value > result) {
              result = value
            }
          }
        } else {
          iteratee = cb(iteratee, context);
          _.each(obj, function (value, index, list) {
            computed = iteratee(value, index, list);
            if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
              result = value;
              lastComputed = computed
            }
          })
        }
        return result
      };
      // Return the minimum element (or element-based computation).
      _.min = function (obj, iteratee, context) {
        var result = Infinity, lastComputed = Infinity, value, computed;
        if (iteratee == null && obj != null) {
          obj = isArrayLike(obj) ? obj : _.values(obj);
          for (var i = 0, length = obj.length; i < length; i++) {
            value = obj[i];
            if (value < result) {
              result = value
            }
          }
        } else {
          iteratee = cb(iteratee, context);
          _.each(obj, function (value, index, list) {
            computed = iteratee(value, index, list);
            if (computed < lastComputed || computed === Infinity && result === Infinity) {
              result = value;
              lastComputed = computed
            }
          })
        }
        return result
      };
      // Shuffle a collection, using the modern version of the
      // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
      _.shuffle = function (obj) {
        var set = isArrayLike(obj) ? obj : _.values(obj);
        var length = set.length;
        var shuffled = Array(length);
        for (var index = 0, rand; index < length; index++) {
          rand = _.random(0, index);
          if (rand !== index)
            shuffled[index] = shuffled[rand];
          shuffled[rand] = set[index]
        }
        return shuffled
      };
      // Sample **n** random values from a collection.
      // If **n** is not specified, returns a single random element.
      // The internal `guard` argument allows it to work with `map`.
      _.sample = function (obj, n, guard) {
        if (n == null || guard) {
          if (!isArrayLike(obj))
            obj = _.values(obj);
          return obj[_.random(obj.length - 1)]
        }
        return _.shuffle(obj).slice(0, Math.max(0, n))
      };
      // Sort the object's values by a criterion produced by an iteratee.
      _.sortBy = function (obj, iteratee, context) {
        iteratee = cb(iteratee, context);
        return _.pluck(_.map(obj, function (value, index, list) {
          return {
            value: value,
            index: index,
            criteria: iteratee(value, index, list)
          }
        }).sort(function (left, right) {
          var a = left.criteria;
          var b = right.criteria;
          if (a !== b) {
            if (a > b || a === void 0)
              return 1;
            if (a < b || b === void 0)
              return -1
          }
          return left.index - right.index
        }), 'value')
      };
      // An internal function used for aggregate "group by" operations.
      var group = function (behavior) {
        return function (obj, iteratee, context) {
          var result = {};
          iteratee = cb(iteratee, context);
          _.each(obj, function (value, index) {
            var key = iteratee(value, index, obj);
            behavior(result, value, key)
          });
          return result
        }
      };
      // Groups the object's values by a criterion. Pass either a string attribute
      // to group by, or a function that returns the criterion.
      _.groupBy = group(function (result, value, key) {
        if (_.has(result, key))
          result[key].push(value);
        else
          result[key] = [value]
      });
      // Indexes the object's values by a criterion, similar to `groupBy`, but for
      // when you know that your index values will be unique.
      _.indexBy = group(function (result, value, key) {
        result[key] = value
      });
      // Counts instances of an object that group by a certain criterion. Pass
      // either a string attribute to count by, or a function that returns the
      // criterion.
      _.countBy = group(function (result, value, key) {
        if (_.has(result, key))
          result[key]++;
        else
          result[key] = 1
      });
      // Safely create a real, live array from anything iterable.
      _.toArray = function (obj) {
        if (!obj)
          return [];
        if (_.isArray(obj))
          return slice.call(obj);
        if (isArrayLike(obj))
          return _.map(obj, _.identity);
        return _.values(obj)
      };
      // Return the number of elements in an object.
      _.size = function (obj) {
        if (obj == null)
          return 0;
        return isArrayLike(obj) ? obj.length : _.keys(obj).length
      };
      // Split a collection into two arrays: one whose elements all satisfy the given
      // predicate, and one whose elements all do not satisfy the predicate.
      _.partition = function (obj, predicate, context) {
        predicate = cb(predicate, context);
        var pass = [], fail = [];
        _.each(obj, function (value, key, obj) {
          (predicate(value, key, obj) ? pass : fail).push(value)
        });
        return [
          pass,
          fail
        ]
      };
      // Array Functions
      // ---------------
      // Get the first element of an array. Passing **n** will return the first N
      // values in the array. Aliased as `head` and `take`. The **guard** check
      // allows it to work with `_.map`.
      _.first = _.head = _.take = function (array, n, guard) {
        if (array == null)
          return void 0;
        if (n == null || guard)
          return array[0];
        return _.initial(array, array.length - n)
      };
      // Returns everything but the last entry of the array. Especially useful on
      // the arguments object. Passing **n** will return all the values in
      // the array, excluding the last N.
      _.initial = function (array, n, guard) {
        return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)))
      };
      // Get the last element of an array. Passing **n** will return the last N
      // values in the array.
      _.last = function (array, n, guard) {
        if (array == null)
          return void 0;
        if (n == null || guard)
          return array[array.length - 1];
        return _.rest(array, Math.max(0, array.length - n))
      };
      // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
      // Especially useful on the arguments object. Passing an **n** will return
      // the rest N values in the array.
      _.rest = _.tail = _.drop = function (array, n, guard) {
        return slice.call(array, n == null || guard ? 1 : n)
      };
      // Trim out all falsy values from an array.
      _.compact = function (array) {
        return _.filter(array, _.identity)
      };
      // Internal implementation of a recursive `flatten` function.
      var flatten = function (input, shallow, strict, startIndex) {
        var output = [], idx = 0;
        for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
          var value = input[i];
          if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
            //flatten current level of array or arguments object
            if (!shallow)
              value = flatten(value, shallow, strict);
            var j = 0, len = value.length;
            output.length += len;
            while (j < len) {
              output[idx++] = value[j++]
            }
          } else if (!strict) {
            output[idx++] = value
          }
        }
        return output
      };
      // Flatten out an array, either recursively (by default), or just one level.
      _.flatten = function (array, shallow) {
        return flatten(array, shallow, false)
      };
      // Return a version of the array that does not contain the specified value(s).
      _.without = function (array) {
        return _.difference(array, slice.call(arguments, 1))
      };
      // Produce a duplicate-free version of the array. If the array has already
      // been sorted, you have the option of using a faster algorithm.
      // Aliased as `unique`.
      _.uniq = _.unique = function (array, isSorted, iteratee, context) {
        if (!_.isBoolean(isSorted)) {
          context = iteratee;
          iteratee = isSorted;
          isSorted = false
        }
        if (iteratee != null)
          iteratee = cb(iteratee, context);
        var result = [];
        var seen = [];
        for (var i = 0, length = getLength(array); i < length; i++) {
          var value = array[i], computed = iteratee ? iteratee(value, i, array) : value;
          if (isSorted) {
            if (!i || seen !== computed)
              result.push(value);
            seen = computed
          } else if (iteratee) {
            if (!_.contains(seen, computed)) {
              seen.push(computed);
              result.push(value)
            }
          } else if (!_.contains(result, value)) {
            result.push(value)
          }
        }
        return result
      };
      // Produce an array that contains the union: each distinct element from all of
      // the passed-in arrays.
      _.union = function () {
        return _.uniq(flatten(arguments, true, true))
      };
      // Produce an array that contains every item shared between all the
      // passed-in arrays.
      _.intersection = function (array) {
        var result = [];
        var argsLength = arguments.length;
        for (var i = 0, length = getLength(array); i < length; i++) {
          var item = array[i];
          if (_.contains(result, item))
            continue;
          for (var j = 1; j < argsLength; j++) {
            if (!_.contains(arguments[j], item))
              break
          }
          if (j === argsLength)
            result.push(item)
        }
        return result
      };
      // Take the difference between one array and a number of other arrays.
      // Only the elements present in just the first array will remain.
      _.difference = function (array) {
        var rest = flatten(arguments, true, true, 1);
        return _.filter(array, function (value) {
          return !_.contains(rest, value)
        })
      };
      // Zip together multiple lists into a single array -- elements that share
      // an index go together.
      _.zip = function () {
        return _.unzip(arguments)
      };
      // Complement of _.zip. Unzip accepts an array of arrays and groups
      // each array's elements on shared indices
      _.unzip = function (array) {
        var length = array && _.max(array, getLength).length || 0;
        var result = Array(length);
        for (var index = 0; index < length; index++) {
          result[index] = _.pluck(array, index)
        }
        return result
      };
      // Converts lists into objects. Pass either a single array of `[key, value]`
      // pairs, or two parallel arrays of the same length -- one of keys, and one of
      // the corresponding values.
      _.object = function (list, values) {
        var result = {};
        for (var i = 0, length = getLength(list); i < length; i++) {
          if (values) {
            result[list[i]] = values[i]
          } else {
            result[list[i][0]] = list[i][1]
          }
        }
        return result
      };
      // Generator function to create the findIndex and findLastIndex functions
      function createPredicateIndexFinder(dir) {
        return function (array, predicate, context) {
          predicate = cb(predicate, context);
          var length = getLength(array);
          var index = dir > 0 ? 0 : length - 1;
          for (; index >= 0 && index < length; index += dir) {
            if (predicate(array[index], index, array))
              return index
          }
          return -1
        }
      }
      // Returns the first index on an array-like that passes a predicate test
      _.findIndex = createPredicateIndexFinder(1);
      _.findLastIndex = createPredicateIndexFinder(-1);
      // Use a comparator function to figure out the smallest index at which
      // an object should be inserted so as to maintain order. Uses binary search.
      _.sortedIndex = function (array, obj, iteratee, context) {
        iteratee = cb(iteratee, context, 1);
        var value = iteratee(obj);
        var low = 0, high = getLength(array);
        while (low < high) {
          var mid = Math.floor((low + high) / 2);
          if (iteratee(array[mid]) < value)
            low = mid + 1;
          else
            high = mid
        }
        return low
      };
      // Generator function to create the indexOf and lastIndexOf functions
      function createIndexFinder(dir, predicateFind, sortedIndex) {
        return function (array, item, idx) {
          var i = 0, length = getLength(array);
          if (typeof idx == 'number') {
            if (dir > 0) {
              i = idx >= 0 ? idx : Math.max(idx + length, i)
            } else {
              length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1
            }
          } else if (sortedIndex && idx && length) {
            idx = sortedIndex(array, item);
            return array[idx] === item ? idx : -1
          }
          if (item !== item) {
            idx = predicateFind(slice.call(array, i, length), _.isNaN);
            return idx >= 0 ? idx + i : -1
          }
          for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
            if (array[idx] === item)
              return idx
          }
          return -1
        }
      }
      // Return the position of the first occurrence of an item in an array,
      // or -1 if the item is not included in the array.
      // If the array is large and already in sort order, pass `true`
      // for **isSorted** to use binary search.
      _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
      _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);
      // Generate an integer Array containing an arithmetic progression. A port of
      // the native Python `range()` function. See
      // [the Python documentation](http://docs.python.org/library/functions.html#range).
      _.range = function (start, stop, step) {
        if (stop == null) {
          stop = start || 0;
          start = 0
        }
        step = step || 1;
        var length = Math.max(Math.ceil((stop - start) / step), 0);
        var range = Array(length);
        for (var idx = 0; idx < length; idx++, start += step) {
          range[idx] = start
        }
        return range
      };
      // Function (ahem) Functions
      // ------------------
      // Determines whether to execute a function as a constructor
      // or a normal function with the provided arguments
      var executeBound = function (sourceFunc, boundFunc, context, callingContext, args) {
        if (!(callingContext instanceof boundFunc))
          return sourceFunc.apply(context, args);
        var self = baseCreate(sourceFunc.prototype);
        var result = sourceFunc.apply(self, args);
        if (_.isObject(result))
          return result;
        return self
      };
      // Create a function bound to a given object (assigning `this`, and arguments,
      // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
      // available.
      _.bind = function (func, context) {
        if (nativeBind && func.bind === nativeBind)
          return nativeBind.apply(func, slice.call(arguments, 1));
        if (!_.isFunction(func))
          throw new TypeError('Bind must be called on a function');
        var args = slice.call(arguments, 2);
        var bound = function () {
          return executeBound(func, bound, context, this, args.concat(slice.call(arguments)))
        };
        return bound
      };
      // Partially apply a function by creating a version that has had some of its
      // arguments pre-filled, without changing its dynamic `this` context. _ acts
      // as a placeholder, allowing any combination of arguments to be pre-filled.
      _.partial = function (func) {
        var boundArgs = slice.call(arguments, 1);
        var bound = function () {
          var position = 0, length = boundArgs.length;
          var args = Array(length);
          for (var i = 0; i < length; i++) {
            args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i]
          }
          while (position < arguments.length)
            args.push(arguments[position++]);
          return executeBound(func, bound, this, this, args)
        };
        return bound
      };
      // Bind a number of an object's methods to that object. Remaining arguments
      // are the method names to be bound. Useful for ensuring that all callbacks
      // defined on an object belong to it.
      _.bindAll = function (obj) {
        var i, length = arguments.length, key;
        if (length <= 1)
          throw new Error('bindAll must be passed function names');
        for (i = 1; i < length; i++) {
          key = arguments[i];
          obj[key] = _.bind(obj[key], obj)
        }
        return obj
      };
      // Memoize an expensive function by storing its results.
      _.memoize = function (func, hasher) {
        var memoize = function (key) {
          var cache = memoize.cache;
          var address = '' + (hasher ? hasher.apply(this, arguments) : key);
          if (!_.has(cache, address))
            cache[address] = func.apply(this, arguments);
          return cache[address]
        };
        memoize.cache = {};
        return memoize
      };
      // Delays a function for the given number of milliseconds, and then calls
      // it with the arguments supplied.
      _.delay = function (func, wait) {
        var args = slice.call(arguments, 2);
        return setTimeout(function () {
          return func.apply(null, args)
        }, wait)
      };
      // Defers a function, scheduling it to run after the current call stack has
      // cleared.
      _.defer = _.partial(_.delay, _, 1);
      // Returns a function, that, when invoked, will only be triggered at most once
      // during a given window of time. Normally, the throttled function will run
      // as much as it can, without ever going more than once per `wait` duration;
      // but if you'd like to disable the execution on the leading edge, pass
      // `{leading: false}`. To disable execution on the trailing edge, ditto.
      _.throttle = function (func, wait, options) {
        var context, args, result;
        var timeout = null;
        var previous = 0;
        if (!options)
          options = {};
        var later = function () {
          previous = options.leading === false ? 0 : _.now();
          timeout = null;
          result = func.apply(context, args);
          if (!timeout)
            context = args = null
        };
        return function () {
          var now = _.now();
          if (!previous && options.leading === false)
            previous = now;
          var remaining = wait - (now - previous);
          context = this;
          args = arguments;
          if (remaining <= 0 || remaining > wait) {
            if (timeout) {
              clearTimeout(timeout);
              timeout = null
            }
            previous = now;
            result = func.apply(context, args);
            if (!timeout)
              context = args = null
          } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining)
          }
          return result
        }
      };
      // Returns a function, that, as long as it continues to be invoked, will not
      // be triggered. The function will be called after it stops being called for
      // N milliseconds. If `immediate` is passed, trigger the function on the
      // leading edge, instead of the trailing.
      _.debounce = function (func, wait, immediate) {
        var timeout, args, context, timestamp, result;
        var later = function () {
          var last = _.now() - timestamp;
          if (last < wait && last >= 0) {
            timeout = setTimeout(later, wait - last)
          } else {
            timeout = null;
            if (!immediate) {
              result = func.apply(context, args);
              if (!timeout)
                context = args = null
            }
          }
        };
        return function () {
          context = this;
          args = arguments;
          timestamp = _.now();
          var callNow = immediate && !timeout;
          if (!timeout)
            timeout = setTimeout(later, wait);
          if (callNow) {
            result = func.apply(context, args);
            context = args = null
          }
          return result
        }
      };
      // Returns the first function passed as an argument to the second,
      // allowing you to adjust arguments, run code before and after, and
      // conditionally execute the original function.
      _.wrap = function (func, wrapper) {
        return _.partial(wrapper, func)
      };
      // Returns a negated version of the passed-in predicate.
      _.negate = function (predicate) {
        return function () {
          return !predicate.apply(this, arguments)
        }
      };
      // Returns a function that is the composition of a list of functions, each
      // consuming the return value of the function that follows.
      _.compose = function () {
        var args = arguments;
        var start = args.length - 1;
        return function () {
          var i = start;
          var result = args[start].apply(this, arguments);
          while (i--)
            result = args[i].call(this, result);
          return result
        }
      };
      // Returns a function that will only be executed on and after the Nth call.
      _.after = function (times, func) {
        return function () {
          if (--times < 1) {
            return func.apply(this, arguments)
          }
        }
      };
      // Returns a function that will only be executed up to (but not including) the Nth call.
      _.before = function (times, func) {
        var memo;
        return function () {
          if (--times > 0) {
            memo = func.apply(this, arguments)
          }
          if (times <= 1)
            func = null;
          return memo
        }
      };
      // Returns a function that will be executed at most one time, no matter how
      // often you call it. Useful for lazy initialization.
      _.once = _.partial(_.before, 2);
      // Object Functions
      // ----------------
      // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
      var hasEnumBug = !{ toString: null }.propertyIsEnumerable('toString');
      var nonEnumerableProps = [
        'valueOf',
        'isPrototypeOf',
        'toString',
        'propertyIsEnumerable',
        'hasOwnProperty',
        'toLocaleString'
      ];
      function collectNonEnumProps(obj, keys) {
        var nonEnumIdx = nonEnumerableProps.length;
        var constructor = obj.constructor;
        var proto = _.isFunction(constructor) && constructor.prototype || ObjProto;
        // Constructor is a special case.
        var prop = 'constructor';
        if (_.has(obj, prop) && !_.contains(keys, prop))
          keys.push(prop);
        while (nonEnumIdx--) {
          prop = nonEnumerableProps[nonEnumIdx];
          if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
            keys.push(prop)
          }
        }
      }
      // Retrieve the names of an object's own properties.
      // Delegates to **ECMAScript 5**'s native `Object.keys`
      _.keys = function (obj) {
        if (!_.isObject(obj))
          return [];
        if (nativeKeys)
          return nativeKeys(obj);
        var keys = [];
        for (var key in obj)
          if (_.has(obj, key))
            keys.push(key);
        // Ahem, IE < 9.
        if (hasEnumBug)
          collectNonEnumProps(obj, keys);
        return keys
      };
      // Retrieve all the property names of an object.
      _.allKeys = function (obj) {
        if (!_.isObject(obj))
          return [];
        var keys = [];
        for (var key in obj)
          keys.push(key);
        // Ahem, IE < 9.
        if (hasEnumBug)
          collectNonEnumProps(obj, keys);
        return keys
      };
      // Retrieve the values of an object's properties.
      _.values = function (obj) {
        var keys = _.keys(obj);
        var length = keys.length;
        var values = Array(length);
        for (var i = 0; i < length; i++) {
          values[i] = obj[keys[i]]
        }
        return values
      };
      // Returns the results of applying the iteratee to each element of the object
      // In contrast to _.map it returns an object
      _.mapObject = function (obj, iteratee, context) {
        iteratee = cb(iteratee, context);
        var keys = _.keys(obj), length = keys.length, results = {}, currentKey;
        for (var index = 0; index < length; index++) {
          currentKey = keys[index];
          results[currentKey] = iteratee(obj[currentKey], currentKey, obj)
        }
        return results
      };
      // Convert an object into a list of `[key, value]` pairs.
      _.pairs = function (obj) {
        var keys = _.keys(obj);
        var length = keys.length;
        var pairs = Array(length);
        for (var i = 0; i < length; i++) {
          pairs[i] = [
            keys[i],
            obj[keys[i]]
          ]
        }
        return pairs
      };
      // Invert the keys and values of an object. The values must be serializable.
      _.invert = function (obj) {
        var result = {};
        var keys = _.keys(obj);
        for (var i = 0, length = keys.length; i < length; i++) {
          result[obj[keys[i]]] = keys[i]
        }
        return result
      };
      // Return a sorted list of the function names available on the object.
      // Aliased as `methods`
      _.functions = _.methods = function (obj) {
        var names = [];
        for (var key in obj) {
          if (_.isFunction(obj[key]))
            names.push(key)
        }
        return names.sort()
      };
      // Extend a given object with all the properties in passed-in object(s).
      _.extend = createAssigner(_.allKeys);
      // Assigns a given object with all the own properties in the passed-in object(s)
      // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
      _.extendOwn = _.assign = createAssigner(_.keys);
      // Returns the first key on an object that passes a predicate test
      _.findKey = function (obj, predicate, context) {
        predicate = cb(predicate, context);
        var keys = _.keys(obj), key;
        for (var i = 0, length = keys.length; i < length; i++) {
          key = keys[i];
          if (predicate(obj[key], key, obj))
            return key
        }
      };
      // Return a copy of the object only containing the whitelisted properties.
      _.pick = function (object, oiteratee, context) {
        var result = {}, obj = object, iteratee, keys;
        if (obj == null)
          return result;
        if (_.isFunction(oiteratee)) {
          keys = _.allKeys(obj);
          iteratee = optimizeCb(oiteratee, context)
        } else {
          keys = flatten(arguments, false, false, 1);
          iteratee = function (value, key, obj) {
            return key in obj
          };
          obj = Object(obj)
        }
        for (var i = 0, length = keys.length; i < length; i++) {
          var key = keys[i];
          var value = obj[key];
          if (iteratee(value, key, obj))
            result[key] = value
        }
        return result
      };
      // Return a copy of the object without the blacklisted properties.
      _.omit = function (obj, iteratee, context) {
        if (_.isFunction(iteratee)) {
          iteratee = _.negate(iteratee)
        } else {
          var keys = _.map(flatten(arguments, false, false, 1), String);
          iteratee = function (value, key) {
            return !_.contains(keys, key)
          }
        }
        return _.pick(obj, iteratee, context)
      };
      // Fill in a given object with default properties.
      _.defaults = createAssigner(_.allKeys, true);
      // Creates an object that inherits from the given prototype object.
      // If additional properties are provided then they will be added to the
      // created object.
      _.create = function (prototype, props) {
        var result = baseCreate(prototype);
        if (props)
          _.extendOwn(result, props);
        return result
      };
      // Create a (shallow-cloned) duplicate of an object.
      _.clone = function (obj) {
        if (!_.isObject(obj))
          return obj;
        return _.isArray(obj) ? obj.slice() : _.extend({}, obj)
      };
      // Invokes interceptor with the obj, and then returns obj.
      // The primary purpose of this method is to "tap into" a method chain, in
      // order to perform operations on intermediate results within the chain.
      _.tap = function (obj, interceptor) {
        interceptor(obj);
        return obj
      };
      // Returns whether an object has a given set of `key:value` pairs.
      _.isMatch = function (object, attrs) {
        var keys = _.keys(attrs), length = keys.length;
        if (object == null)
          return !length;
        var obj = Object(object);
        for (var i = 0; i < length; i++) {
          var key = keys[i];
          if (attrs[key] !== obj[key] || !(key in obj))
            return false
        }
        return true
      };
      // Internal recursive comparison function for `isEqual`.
      var eq = function (a, b, aStack, bStack) {
        // Identical objects are equal. `0 === -0`, but they aren't identical.
        // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
        if (a === b)
          return a !== 0 || 1 / a === 1 / b;
        // A strict comparison is necessary because `null == undefined`.
        if (a == null || b == null)
          return a === b;
        // Unwrap any wrapped objects.
        if (a instanceof _)
          a = a._wrapped;
        if (b instanceof _)
          b = b._wrapped;
        // Compare `[[Class]]` names.
        var className = toString.call(a);
        if (className !== toString.call(b))
          return false;
        switch (className) {
        // Strings, numbers, regular expressions, dates, and booleans are compared by value.
        case '[object RegExp]':
        // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
        case '[object String]':
          // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
          // equivalent to `new String("5")`.
          return '' + a === '' + b;
        case '[object Number]':
          // `NaN`s are equivalent, but non-reflexive.
          // Object(NaN) is equivalent to NaN
          if (+a !== +a)
            return +b !== +b;
          // An `egal` comparison is performed for other numeric values.
          return +a === 0 ? 1 / +a === 1 / b : +a === +b;
        case '[object Date]':
        case '[object Boolean]':
          // Coerce dates and booleans to numeric primitive values. Dates are compared by their
          // millisecond representations. Note that invalid dates with millisecond representations
          // of `NaN` are not equivalent.
          return +a === +b
        }
        var areArrays = className === '[object Array]';
        if (!areArrays) {
          if (typeof a != 'object' || typeof b != 'object')
            return false;
          // Objects with different constructors are not equivalent, but `Object`s or `Array`s
          // from different frames are.
          var aCtor = a.constructor, bCtor = b.constructor;
          if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor && _.isFunction(bCtor) && bCtor instanceof bCtor) && ('constructor' in a && 'constructor' in b)) {
            return false
          }
        }
        // Assume equality for cyclic structures. The algorithm for detecting cyclic
        // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
        // Initializing stack of traversed objects.
        // It's done here since we only need them for objects and arrays comparison.
        aStack = aStack || [];
        bStack = bStack || [];
        var length = aStack.length;
        while (length--) {
          // Linear search. Performance is inversely proportional to the number of
          // unique nested structures.
          if (aStack[length] === a)
            return bStack[length] === b
        }
        // Add the first object to the stack of traversed objects.
        aStack.push(a);
        bStack.push(b);
        // Recursively compare objects and arrays.
        if (areArrays) {
          // Compare array lengths to determine if a deep comparison is necessary.
          length = a.length;
          if (length !== b.length)
            return false;
          // Deep compare the contents, ignoring non-numeric properties.
          while (length--) {
            if (!eq(a[length], b[length], aStack, bStack))
              return false
          }
        } else {
          // Deep compare objects.
          var keys = _.keys(a), key;
          length = keys.length;
          // Ensure that both objects contain the same number of properties before comparing deep equality.
          if (_.keys(b).length !== length)
            return false;
          while (length--) {
            // Deep compare each member
            key = keys[length];
            if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack)))
              return false
          }
        }
        // Remove the first object from the stack of traversed objects.
        aStack.pop();
        bStack.pop();
        return true
      };
      // Perform a deep comparison to check if two objects are equal.
      _.isEqual = function (a, b) {
        return eq(a, b)
      };
      // Is a given array, string, or object empty?
      // An "empty" object has no enumerable own-properties.
      _.isEmpty = function (obj) {
        if (obj == null)
          return true;
        if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj)))
          return obj.length === 0;
        return _.keys(obj).length === 0
      };
      // Is a given value a DOM element?
      _.isElement = function (obj) {
        return !!(obj && obj.nodeType === 1)
      };
      // Is a given value an array?
      // Delegates to ECMA5's native Array.isArray
      _.isArray = nativeIsArray || function (obj) {
        return toString.call(obj) === '[object Array]'
      };
      // Is a given variable an object?
      _.isObject = function (obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj
      };
      // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
      _.each([
        'Arguments',
        'Function',
        'String',
        'Number',
        'Date',
        'RegExp',
        'Error'
      ], function (name) {
        _['is' + name] = function (obj) {
          return toString.call(obj) === '[object ' + name + ']'
        }
      });
      // Define a fallback version of the method in browsers (ahem, IE < 9), where
      // there isn't any inspectable "Arguments" type.
      if (!_.isArguments(arguments)) {
        _.isArguments = function (obj) {
          return _.has(obj, 'callee')
        }
      }
      // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
      // IE 11 (#1621), and in Safari 8 (#1929).
      if (typeof /./ != 'function' && typeof Int8Array != 'object') {
        _.isFunction = function (obj) {
          return typeof obj == 'function' || false
        }
      }
      // Is a given object a finite number?
      _.isFinite = function (obj) {
        return isFinite(obj) && !isNaN(parseFloat(obj))
      };
      // Is the given value `NaN`? (NaN is the only number which does not equal itself).
      _.isNaN = function (obj) {
        return _.isNumber(obj) && obj !== +obj
      };
      // Is a given value a boolean?
      _.isBoolean = function (obj) {
        return obj === true || obj === false || toString.call(obj) === '[object Boolean]'
      };
      // Is a given value equal to null?
      _.isNull = function (obj) {
        return obj === null
      };
      // Is a given variable undefined?
      _.isUndefined = function (obj) {
        return obj === void 0
      };
      // Shortcut function for checking if an object has a given property directly
      // on itself (in other words, not on a prototype).
      _.has = function (obj, key) {
        return obj != null && hasOwnProperty.call(obj, key)
      };
      // Utility Functions
      // -----------------
      // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
      // previous owner. Returns a reference to the Underscore object.
      _.noConflict = function () {
        root._ = previousUnderscore;
        return this
      };
      // Keep the identity function around for default iteratees.
      _.identity = function (value) {
        return value
      };
      // Predicate-generating functions. Often useful outside of Underscore.
      _.constant = function (value) {
        return function () {
          return value
        }
      };
      _.noop = function () {
      };
      _.property = property;
      // Generates a function for a given object that returns a given property.
      _.propertyOf = function (obj) {
        return obj == null ? function () {
        } : function (key) {
          return obj[key]
        }
      };
      // Returns a predicate for checking whether an object has a given set of
      // `key:value` pairs.
      _.matcher = _.matches = function (attrs) {
        attrs = _.extendOwn({}, attrs);
        return function (obj) {
          return _.isMatch(obj, attrs)
        }
      };
      // Run a function **n** times.
      _.times = function (n, iteratee, context) {
        var accum = Array(Math.max(0, n));
        iteratee = optimizeCb(iteratee, context, 1);
        for (var i = 0; i < n; i++)
          accum[i] = iteratee(i);
        return accum
      };
      // Return a random integer between min and max (inclusive).
      _.random = function (min, max) {
        if (max == null) {
          max = min;
          min = 0
        }
        return min + Math.floor(Math.random() * (max - min + 1))
      };
      // A (possibly faster) way to get the current timestamp as an integer.
      _.now = Date.now || function () {
        return new Date().getTime()
      };
      // List of HTML entities for escaping.
      var escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '`': '&#x60;'
      };
      var unescapeMap = _.invert(escapeMap);
      // Functions for escaping and unescaping strings to/from HTML interpolation.
      var createEscaper = function (map) {
        var escaper = function (match) {
          return map[match]
        };
        // Regexes for identifying a key that needs to be escaped
        var source = '(?:' + _.keys(map).join('|') + ')';
        var testRegexp = RegExp(source);
        var replaceRegexp = RegExp(source, 'g');
        return function (string) {
          string = string == null ? '' : '' + string;
          return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string
        }
      };
      _.escape = createEscaper(escapeMap);
      _.unescape = createEscaper(unescapeMap);
      // If the value of the named `property` is a function then invoke it with the
      // `object` as context; otherwise, return it.
      _.result = function (object, property, fallback) {
        var value = object == null ? void 0 : object[property];
        if (value === void 0) {
          value = fallback
        }
        return _.isFunction(value) ? value.call(object) : value
      };
      // Generate a unique integer id (unique within the entire client session).
      // Useful for temporary DOM ids.
      var idCounter = 0;
      _.uniqueId = function (prefix) {
        var id = ++idCounter + '';
        return prefix ? prefix + id : id
      };
      // By default, Underscore uses ERB-style template delimiters, change the
      // following template settings to use alternative delimiters.
      _.templateSettings = {
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g,
        escape: /<%-([\s\S]+?)%>/g
      };
      // When customizing `templateSettings`, if you don't want to define an
      // interpolation, evaluation or escaping regex, we need one that is
      // guaranteed not to match.
      var noMatch = /(.)^/;
      // Certain characters need to be escaped so that they can be put into a
      // string literal.
      var escapes = {
        "'": "'",
        '\\': '\\',
        '\r': 'r',
        '\n': 'n',
        '\u2028': 'u2028',
        '\u2029': 'u2029'
      };
      var escaper = /\\|'|\r|\n|\u2028|\u2029/g;
      var escapeChar = function (match) {
        return '\\' + escapes[match]
      };
      // JavaScript micro-templating, similar to John Resig's implementation.
      // Underscore templating handles arbitrary delimiters, preserves whitespace,
      // and correctly escapes quotes within interpolated code.
      // NB: `oldSettings` only exists for backwards compatibility.
      _.template = function (text, settings, oldSettings) {
        if (!settings && oldSettings)
          settings = oldSettings;
        settings = _.defaults({}, settings, _.templateSettings);
        // Combine delimiters into one regular expression via alternation.
        var matcher = RegExp([
          (settings.escape || noMatch).source,
          (settings.interpolate || noMatch).source,
          (settings.evaluate || noMatch).source
        ].join('|') + '|$', 'g');
        // Compile the template source, escaping string literals appropriately.
        var index = 0;
        var source = "__p+='";
        text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
          source += text.slice(index, offset).replace(escaper, escapeChar);
          index = offset + match.length;
          if (escape) {
            source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'"
          } else if (interpolate) {
            source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'"
          } else if (evaluate) {
            source += "';\n" + evaluate + "\n__p+='"
          }
          // Adobe VMs need the match returned to produce the correct offest.
          return match
        });
        source += "';\n";
        // If a variable is not specified, place data values in local scope.
        if (!settings.variable)
          source = 'with(obj||{}){\n' + source + '}\n';
        source = "var __t,__p='',__j=Array.prototype.join," + "print=function(){__p+=__j.call(arguments,'');};\n" + source + 'return __p;\n';
        try {
          var render = new Function(settings.variable || 'obj', '_', source)
        } catch (e) {
          e.source = source;
          throw e
        }
        var template = function (data) {
          return render.call(this, data, _)
        };
        // Provide the compiled source as a convenience for precompilation.
        var argument = settings.variable || 'obj';
        template.source = 'function(' + argument + '){\n' + source + '}';
        return template
      };
      // Add a "chain" function. Start chaining a wrapped Underscore object.
      _.chain = function (obj) {
        var instance = _(obj);
        instance._chain = true;
        return instance
      };
      // OOP
      // ---------------
      // If Underscore is called as a function, it returns a wrapped object that
      // can be used OO-style. This wrapper holds altered versions of all the
      // underscore functions. Wrapped objects may be chained.
      // Helper function to continue chaining intermediate results.
      var result = function (instance, obj) {
        return instance._chain ? _(obj).chain() : obj
      };
      // Add your own custom functions to the Underscore object.
      _.mixin = function (obj) {
        _.each(_.functions(obj), function (name) {
          var func = _[name] = obj[name];
          _.prototype[name] = function () {
            var args = [this._wrapped];
            push.apply(args, arguments);
            return result(this, func.apply(_, args))
          }
        })
      };
      // Add all of the Underscore functions to the wrapper object.
      _.mixin(_);
      // Add all mutator Array functions to the wrapper.
      _.each([
        'pop',
        'push',
        'reverse',
        'shift',
        'sort',
        'splice',
        'unshift'
      ], function (name) {
        var method = ArrayProto[name];
        _.prototype[name] = function () {
          var obj = this._wrapped;
          method.apply(obj, arguments);
          if ((name === 'shift' || name === 'splice') && obj.length === 0)
            delete obj[0];
          return result(this, obj)
        }
      });
      // Add all accessor Array functions to the wrapper.
      _.each([
        'concat',
        'join',
        'slice'
      ], function (name) {
        var method = ArrayProto[name];
        _.prototype[name] = function () {
          return result(this, method.apply(this._wrapped, arguments))
        }
      });
      // Extracts the result from a wrapped and chained object.
      _.prototype.value = function () {
        return this._wrapped
      };
      // Provide unwrapping proxy for some methods used in engine operations
      // such as arithmetic and JSON stringification.
      _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;
      _.prototype.toString = function () {
        return '' + this._wrapped
      };
      // AMD registration happens at the end for compatibility with AMD loaders
      // that may not enforce next-turn semantics on modules. Even though general
      // practice for AMD registration is to be anonymous, underscore registers
      // as a named module because, like jQuery, it is a base library that is
      // popular enough to be bundled in a third party lib, but not be part of
      // an AMD load request. Those cases could generate an error when an
      // anonymous define() is called outside of a loader request.
      if (typeof define === 'function' && define.amd) {
        define('underscore', [], function () {
          return _
        })
      }
    }.call(this))
  });
  // source: /Users/dtai/work/verus/crowdcontrol/node_modules/q/q.js
  require.define('q/q', function (module, exports, __dirname, __filename) {
    // vim:ts=4:sts=4:sw=4:
    /*!
 *
 * Copyright 2009-2012 Kris Kowal under the terms of the MIT
 * license found at http://github.com/kriskowal/q/raw/master/LICENSE
 *
 * With parts by Tyler Close
 * Copyright 2007-2009 Tyler Close under the terms of the MIT X license found
 * at http://www.opensource.org/licenses/mit-license.html
 * Forked at ref_send.js version: 2009-05-11
 *
 * With parts by Mark Miller
 * Copyright (C) 2011 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
    (function (definition) {
      'use strict';
      // This file will function properly as a <script> tag, or a module
      // using CommonJS and NodeJS or RequireJS module formats.  In
      // Common/Node/RequireJS, the module exports the Q API and when
      // executed as a simple <script>, it creates a Q global instead.
      // Montage Require
      if (typeof bootstrap === 'function') {
        bootstrap('promise', definition)  // CommonJS
      } else if (typeof exports === 'object' && typeof module === 'object') {
        module.exports = definition()  // RequireJS
      } else if (typeof define === 'function' && define.amd) {
        define(definition)  // SES (Secure EcmaScript)
      } else if (typeof ses !== 'undefined') {
        if (!ses.ok()) {
          return
        } else {
          ses.makeQ = definition
        }  // <script>
      } else if (typeof window !== 'undefined' || typeof self !== 'undefined') {
        // Prefer window over self for add-on scripts. Use self for
        // non-windowed contexts.
        var global = typeof window !== 'undefined' ? window : self;
        // Get the `window` object, save the previous Q global
        // and initialize Q as a global.
        var previousQ = global.Q;
        global.Q = definition();
        // Add a noConflict function so Q can be removed from the
        // global namespace.
        global.Q.noConflict = function () {
          global.Q = previousQ;
          return this
        }
      } else {
        throw new Error('This environment was not anticipated by Q. Please file a bug.')
      }
    }(function () {
      'use strict';
      var hasStacks = false;
      try {
        throw new Error
      } catch (e) {
        hasStacks = !!e.stack
      }
      // All code after this point will be filtered from stack traces reported
      // by Q.
      var qStartingLine = captureLine();
      var qFileName;
      // shims
      // used for fallback in "allResolved"
      var noop = function () {
      };
      // Use the fastest possible means to execute a task in a future turn
      // of the event loop.
      var nextTick = function () {
        // linked list of tasks (single, with head node)
        var head = {
          task: void 0,
          next: null
        };
        var tail = head;
        var flushing = false;
        var requestTick = void 0;
        var isNodeJS = false;
        // queue for late tasks, used by unhandled rejection tracking
        var laterQueue = [];
        function flush() {
          /* jshint loopfunc: true */
          var task, domain;
          while (head.next) {
            head = head.next;
            task = head.task;
            head.task = void 0;
            domain = head.domain;
            if (domain) {
              head.domain = void 0;
              domain.enter()
            }
            runSingle(task, domain)
          }
          while (laterQueue.length) {
            task = laterQueue.pop();
            runSingle(task)
          }
          flushing = false
        }
        // runs a single function in the async queue
        function runSingle(task, domain) {
          try {
            task()
          } catch (e) {
            if (isNodeJS) {
              // In node, uncaught exceptions are considered fatal errors.
              // Re-throw them synchronously to interrupt flushing!
              // Ensure continuation if the uncaught exception is suppressed
              // listening "uncaughtException" events (as domains does).
              // Continue in next event to avoid tick recursion.
              if (domain) {
                domain.exit()
              }
              setTimeout(flush, 0);
              if (domain) {
                domain.enter()
              }
              throw e
            } else {
              // In browsers, uncaught exceptions are not fatal.
              // Re-throw them asynchronously to avoid slow-downs.
              setTimeout(function () {
                throw e
              }, 0)
            }
          }
          if (domain) {
            domain.exit()
          }
        }
        nextTick = function (task) {
          tail = tail.next = {
            task: task,
            domain: isNodeJS && process.domain,
            next: null
          };
          if (!flushing) {
            flushing = true;
            requestTick()
          }
        };
        if (typeof process === 'object' && process.toString() === '[object process]' && process.nextTick) {
          // Ensure Q is in a real Node environment, with a `process.nextTick`.
          // To see through fake Node environments:
          // * Mocha test runner - exposes a `process` global without a `nextTick`
          // * Browserify - exposes a `process.nexTick` function that uses
          //   `setTimeout`. In this case `setImmediate` is preferred because
          //    it is faster. Browserify's `process.toString()` yields
          //   "[object Object]", while in a real Node environment
          //   `process.nextTick()` yields "[object process]".
          isNodeJS = true;
          requestTick = function () {
            process.nextTick(flush)
          }
        } else if (typeof setImmediate === 'function') {
          // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
          if (typeof window !== 'undefined') {
            requestTick = setImmediate.bind(window, flush)
          } else {
            requestTick = function () {
              setImmediate(flush)
            }
          }
        } else if (typeof MessageChannel !== 'undefined') {
          // modern browsers
          // http://www.nonblocking.io/2011/06/windownexttick.html
          var channel = new MessageChannel;
          // At least Safari Version 6.0.5 (8536.30.1) intermittently cannot create
          // working message ports the first time a page loads.
          channel.port1.onmessage = function () {
            requestTick = requestPortTick;
            channel.port1.onmessage = flush;
            flush()
          };
          var requestPortTick = function () {
            // Opera requires us to provide a message payload, regardless of
            // whether we use it.
            channel.port2.postMessage(0)
          };
          requestTick = function () {
            setTimeout(flush, 0);
            requestPortTick()
          }
        } else {
          // old browsers
          requestTick = function () {
            setTimeout(flush, 0)
          }
        }
        // runs a task after all other tasks have been run
        // this is useful for unhandled rejection tracking that needs to happen
        // after all `then`d tasks have been run.
        nextTick.runAfter = function (task) {
          laterQueue.push(task);
          if (!flushing) {
            flushing = true;
            requestTick()
          }
        };
        return nextTick
      }();
      // Attempt to make generics safe in the face of downstream
      // modifications.
      // There is no situation where this is necessary.
      // If you need a security guarantee, these primordials need to be
      // deeply frozen anyway, and if you don’t need a security guarantee,
      // this is just plain paranoid.
      // However, this **might** have the nice side-effect of reducing the size of
      // the minified code by reducing x.call() to merely x()
      // See Mark Miller’s explanation of what this does.
      // http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
      var call = Function.call;
      function uncurryThis(f) {
        return function () {
          return call.apply(f, arguments)
        }
      }
      // This is equivalent, but slower:
      // uncurryThis = Function_bind.bind(Function_bind.call);
      // http://jsperf.com/uncurrythis
      var array_slice = uncurryThis(Array.prototype.slice);
      var array_reduce = uncurryThis(Array.prototype.reduce || function (callback, basis) {
        var index = 0, length = this.length;
        // concerning the initial value, if one is not provided
        if (arguments.length === 1) {
          // seek to the first value in the array, accounting
          // for the possibility that is is a sparse array
          do {
            if (index in this) {
              basis = this[index++];
              break
            }
            if (++index >= length) {
              throw new TypeError
            }
          } while (1)
        }
        // reduce
        for (; index < length; index++) {
          // account for the possibility that the array is sparse
          if (index in this) {
            basis = callback(basis, this[index], index)
          }
        }
        return basis
      });
      var array_indexOf = uncurryThis(Array.prototype.indexOf || function (value) {
        // not a very good shim, but good enough for our one use of it
        for (var i = 0; i < this.length; i++) {
          if (this[i] === value) {
            return i
          }
        }
        return -1
      });
      var array_map = uncurryThis(Array.prototype.map || function (callback, thisp) {
        var self = this;
        var collect = [];
        array_reduce(self, function (undefined, value, index) {
          collect.push(callback.call(thisp, value, index, self))
        }, void 0);
        return collect
      });
      var object_create = Object.create || function (prototype) {
        function Type() {
        }
        Type.prototype = prototype;
        return new Type
      };
      var object_hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);
      var object_keys = Object.keys || function (object) {
        var keys = [];
        for (var key in object) {
          if (object_hasOwnProperty(object, key)) {
            keys.push(key)
          }
        }
        return keys
      };
      var object_toString = uncurryThis(Object.prototype.toString);
      function isObject(value) {
        return value === Object(value)
      }
      // generator related shims
      // FIXME: Remove this function once ES6 generators are in SpiderMonkey.
      function isStopIteration(exception) {
        return object_toString(exception) === '[object StopIteration]' || exception instanceof QReturnValue
      }
      // FIXME: Remove this helper and Q.return once ES6 generators are in
      // SpiderMonkey.
      var QReturnValue;
      if (typeof ReturnValue !== 'undefined') {
        QReturnValue = ReturnValue
      } else {
        QReturnValue = function (value) {
          this.value = value
        }
      }
      // long stack traces
      var STACK_JUMP_SEPARATOR = 'From previous event:';
      function makeStackTraceLong(error, promise) {
        // If possible, transform the error stack trace by removing Node and Q
        // cruft, then concatenating with the stack trace of `promise`. See #57.
        if (hasStacks && promise.stack && typeof error === 'object' && error !== null && error.stack && error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1) {
          var stacks = [];
          for (var p = promise; !!p; p = p.source) {
            if (p.stack) {
              stacks.unshift(p.stack)
            }
          }
          stacks.unshift(error.stack);
          var concatedStacks = stacks.join('\n' + STACK_JUMP_SEPARATOR + '\n');
          error.stack = filterStackString(concatedStacks)
        }
      }
      function filterStackString(stackString) {
        var lines = stackString.split('\n');
        var desiredLines = [];
        for (var i = 0; i < lines.length; ++i) {
          var line = lines[i];
          if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
            desiredLines.push(line)
          }
        }
        return desiredLines.join('\n')
      }
      function isNodeFrame(stackLine) {
        return stackLine.indexOf('(module.js:') !== -1 || stackLine.indexOf('(node.js:') !== -1
      }
      function getFileNameAndLineNumber(stackLine) {
        // Named functions: "at functionName (filename:lineNumber:columnNumber)"
        // In IE10 function name can have spaces ("Anonymous function") O_o
        var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
        if (attempt1) {
          return [
            attempt1[1],
            Number(attempt1[2])
          ]
        }
        // Anonymous functions: "at filename:lineNumber:columnNumber"
        var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
        if (attempt2) {
          return [
            attempt2[1],
            Number(attempt2[2])
          ]
        }
        // Firefox style: "function@filename:lineNumber or @filename:lineNumber"
        var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
        if (attempt3) {
          return [
            attempt3[1],
            Number(attempt3[2])
          ]
        }
      }
      function isInternalFrame(stackLine) {
        var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);
        if (!fileNameAndLineNumber) {
          return false
        }
        var fileName = fileNameAndLineNumber[0];
        var lineNumber = fileNameAndLineNumber[1];
        return fileName === qFileName && lineNumber >= qStartingLine && lineNumber <= qEndingLine
      }
      // discover own file name and line number range for filtering stack
      // traces
      function captureLine() {
        if (!hasStacks) {
          return
        }
        try {
          throw new Error
        } catch (e) {
          var lines = e.stack.split('\n');
          var firstLine = lines[0].indexOf('@') > 0 ? lines[1] : lines[2];
          var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
          if (!fileNameAndLineNumber) {
            return
          }
          qFileName = fileNameAndLineNumber[0];
          return fileNameAndLineNumber[1]
        }
      }
      function deprecate(callback, name, alternative) {
        return function () {
          if (typeof console !== 'undefined' && typeof console.warn === 'function') {
            console.warn(name + ' is deprecated, use ' + alternative + ' instead.', new Error('').stack)
          }
          return callback.apply(callback, arguments)
        }
      }
      // end of shims
      // beginning of real work
      /**
 * Constructs a promise for an immediate reference, passes promises through, or
 * coerces promises from different systems.
 * @param value immediate reference or promise
 */
      function Q(value) {
        // If the object is already a Promise, return it directly.  This enables
        // the resolve function to both be used to created references from objects,
        // but to tolerably coerce non-promises to promises.
        if (value instanceof Promise) {
          return value
        }
        // assimilate thenables
        if (isPromiseAlike(value)) {
          return coerce(value)
        } else {
          return fulfill(value)
        }
      }
      Q.resolve = Q;
      /**
 * Performs a task in a future turn of the event loop.
 * @param {Function} task
 */
      Q.nextTick = nextTick;
      /**
 * Controls whether or not long stack traces will be on
 */
      Q.longStackSupport = false;
      // enable long stacks if Q_DEBUG is set
      if (typeof process === 'object' && process && process.env && process.env.Q_DEBUG) {
        Q.longStackSupport = true
      }
      /**
 * Constructs a {promise, resolve, reject} object.
 *
 * `resolve` is a callback to invoke with a more resolved value for the
 * promise. To fulfill the promise, invoke `resolve` with any value that is
 * not a thenable. To reject the promise, invoke `resolve` with a rejected
 * thenable, or invoke `reject` with the reason directly. To resolve the
 * promise to another thenable, thus putting it in the same state, invoke
 * `resolve` with that other thenable.
 */
      Q.defer = defer;
      function defer() {
        // if "messages" is an "Array", that indicates that the promise has not yet
        // been resolved.  If it is "undefined", it has been resolved.  Each
        // element of the messages array is itself an array of complete arguments to
        // forward to the resolved promise.  We coerce the resolution value to a
        // promise using the `resolve` function because it handles both fully
        // non-thenable values and other thenables gracefully.
        var messages = [], progressListeners = [], resolvedPromise;
        var deferred = object_create(defer.prototype);
        var promise = object_create(Promise.prototype);
        promise.promiseDispatch = function (resolve, op, operands) {
          var args = array_slice(arguments);
          if (messages) {
            messages.push(args);
            if (op === 'when' && operands[1]) {
              // progress operand
              progressListeners.push(operands[1])
            }
          } else {
            Q.nextTick(function () {
              resolvedPromise.promiseDispatch.apply(resolvedPromise, args)
            })
          }
        };
        // XXX deprecated
        promise.valueOf = function () {
          if (messages) {
            return promise
          }
          var nearerValue = nearer(resolvedPromise);
          if (isPromise(nearerValue)) {
            resolvedPromise = nearerValue  // shorten chain
          }
          return nearerValue
        };
        promise.inspect = function () {
          if (!resolvedPromise) {
            return { state: 'pending' }
          }
          return resolvedPromise.inspect()
        };
        if (Q.longStackSupport && hasStacks) {
          try {
            throw new Error
          } catch (e) {
            // NOTE: don't try to use `Error.captureStackTrace` or transfer the
            // accessor around; that causes memory leaks as per GH-111. Just
            // reify the stack trace as a string ASAP.
            //
            // At the same time, cut off the first line; it's always just
            // "[object Promise]\n", as per the `toString`.
            promise.stack = e.stack.substring(e.stack.indexOf('\n') + 1)
          }
        }
        // NOTE: we do the checks for `resolvedPromise` in each method, instead of
        // consolidating them into `become`, since otherwise we'd create new
        // promises with the lines `become(whatever(value))`. See e.g. GH-252.
        function become(newPromise) {
          resolvedPromise = newPromise;
          promise.source = newPromise;
          array_reduce(messages, function (undefined, message) {
            Q.nextTick(function () {
              newPromise.promiseDispatch.apply(newPromise, message)
            })
          }, void 0);
          messages = void 0;
          progressListeners = void 0
        }
        deferred.promise = promise;
        deferred.resolve = function (value) {
          if (resolvedPromise) {
            return
          }
          become(Q(value))
        };
        deferred.fulfill = function (value) {
          if (resolvedPromise) {
            return
          }
          become(fulfill(value))
        };
        deferred.reject = function (reason) {
          if (resolvedPromise) {
            return
          }
          become(reject(reason))
        };
        deferred.notify = function (progress) {
          if (resolvedPromise) {
            return
          }
          array_reduce(progressListeners, function (undefined, progressListener) {
            Q.nextTick(function () {
              progressListener(progress)
            })
          }, void 0)
        };
        return deferred
      }
      /**
 * Creates a Node-style callback that will resolve or reject the deferred
 * promise.
 * @returns a nodeback
 */
      defer.prototype.makeNodeResolver = function () {
        var self = this;
        return function (error, value) {
          if (error) {
            self.reject(error)
          } else if (arguments.length > 2) {
            self.resolve(array_slice(arguments, 1))
          } else {
            self.resolve(value)
          }
        }
      };
      /**
 * @param resolver {Function} a function that returns nothing and accepts
 * the resolve, reject, and notify functions for a deferred.
 * @returns a promise that may be resolved with the given resolve and reject
 * functions, or rejected by a thrown exception in resolver
 */
      Q.Promise = promise;
      // ES6
      Q.promise = promise;
      function promise(resolver) {
        if (typeof resolver !== 'function') {
          throw new TypeError('resolver must be a function.')
        }
        var deferred = defer();
        try {
          resolver(deferred.resolve, deferred.reject, deferred.notify)
        } catch (reason) {
          deferred.reject(reason)
        }
        return deferred.promise
      }
      promise.race = race;
      // ES6
      promise.all = all;
      // ES6
      promise.reject = reject;
      // ES6
      promise.resolve = Q;
      // ES6
      // XXX experimental.  This method is a way to denote that a local value is
      // serializable and should be immediately dispatched to a remote upon request,
      // instead of passing a reference.
      Q.passByCopy = function (object) {
        //freeze(object);
        //passByCopies.set(object, true);
        return object
      };
      Promise.prototype.passByCopy = function () {
        //freeze(object);
        //passByCopies.set(object, true);
        return this
      };
      /**
 * If two promises eventually fulfill to the same value, promises that value,
 * but otherwise rejects.
 * @param x {Any*}
 * @param y {Any*}
 * @returns {Any*} a promise for x and y if they are the same, but a rejection
 * otherwise.
 *
 */
      Q.join = function (x, y) {
        return Q(x).join(y)
      };
      Promise.prototype.join = function (that) {
        return Q([
          this,
          that
        ]).spread(function (x, y) {
          if (x === y) {
            // TODO: "===" should be Object.is or equiv
            return x
          } else {
            throw new Error("Can't join: not the same: " + x + ' ' + y)
          }
        })
      };
      /**
 * Returns a promise for the first of an array of promises to become settled.
 * @param answers {Array[Any*]} promises to race
 * @returns {Any*} the first promise to be settled
 */
      Q.race = race;
      function race(answerPs) {
        return promise(function (resolve, reject) {
          // Switch to this once we can assume at least ES5
          // answerPs.forEach(function (answerP) {
          //     Q(answerP).then(resolve, reject);
          // });
          // Use this in the meantime
          for (var i = 0, len = answerPs.length; i < len; i++) {
            Q(answerPs[i]).then(resolve, reject)
          }
        })
      }
      Promise.prototype.race = function () {
        return this.then(Q.race)
      };
      /**
 * Constructs a Promise with a promise descriptor object and optional fallback
 * function.  The descriptor contains methods like when(rejected), get(name),
 * set(name, value), post(name, args), and delete(name), which all
 * return either a value, a promise for a value, or a rejection.  The fallback
 * accepts the operation name, a resolver, and any further arguments that would
 * have been forwarded to the appropriate method above had a method been
 * provided with the proper name.  The API makes no guarantees about the nature
 * of the returned object, apart from that it is usable whereever promises are
 * bought and sold.
 */
      Q.makePromise = Promise;
      function Promise(descriptor, fallback, inspect) {
        if (fallback === void 0) {
          fallback = function (op) {
            return reject(new Error('Promise does not support operation: ' + op))
          }
        }
        if (inspect === void 0) {
          inspect = function () {
            return { state: 'unknown' }
          }
        }
        var promise = object_create(Promise.prototype);
        promise.promiseDispatch = function (resolve, op, args) {
          var result;
          try {
            if (descriptor[op]) {
              result = descriptor[op].apply(promise, args)
            } else {
              result = fallback.call(promise, op, args)
            }
          } catch (exception) {
            result = reject(exception)
          }
          if (resolve) {
            resolve(result)
          }
        };
        promise.inspect = inspect;
        // XXX deprecated `valueOf` and `exception` support
        if (inspect) {
          var inspected = inspect();
          if (inspected.state === 'rejected') {
            promise.exception = inspected.reason
          }
          promise.valueOf = function () {
            var inspected = inspect();
            if (inspected.state === 'pending' || inspected.state === 'rejected') {
              return promise
            }
            return inspected.value
          }
        }
        return promise
      }
      Promise.prototype.toString = function () {
        return '[object Promise]'
      };
      Promise.prototype.then = function (fulfilled, rejected, progressed) {
        var self = this;
        var deferred = defer();
        var done = false;
        // ensure the untrusted promise makes at most a
        // single call to one of the callbacks
        function _fulfilled(value) {
          try {
            return typeof fulfilled === 'function' ? fulfilled(value) : value
          } catch (exception) {
            return reject(exception)
          }
        }
        function _rejected(exception) {
          if (typeof rejected === 'function') {
            makeStackTraceLong(exception, self);
            try {
              return rejected(exception)
            } catch (newException) {
              return reject(newException)
            }
          }
          return reject(exception)
        }
        function _progressed(value) {
          return typeof progressed === 'function' ? progressed(value) : value
        }
        Q.nextTick(function () {
          self.promiseDispatch(function (value) {
            if (done) {
              return
            }
            done = true;
            deferred.resolve(_fulfilled(value))
          }, 'when', [function (exception) {
              if (done) {
                return
              }
              done = true;
              deferred.resolve(_rejected(exception))
            }])
        });
        // Progress propagator need to be attached in the current tick.
        self.promiseDispatch(void 0, 'when', [
          void 0,
          function (value) {
            var newValue;
            var threw = false;
            try {
              newValue = _progressed(value)
            } catch (e) {
              threw = true;
              if (Q.onerror) {
                Q.onerror(e)
              } else {
                throw e
              }
            }
            if (!threw) {
              deferred.notify(newValue)
            }
          }
        ]);
        return deferred.promise
      };
      Q.tap = function (promise, callback) {
        return Q(promise).tap(callback)
      };
      /**
 * Works almost like "finally", but not called for rejections.
 * Original resolution value is passed through callback unaffected.
 * Callback may return a promise that will be awaited for.
 * @param {Function} callback
 * @returns {Q.Promise}
 * @example
 * doSomething()
 *   .then(...)
 *   .tap(console.log)
 *   .then(...);
 */
      Promise.prototype.tap = function (callback) {
        callback = Q(callback);
        return this.then(function (value) {
          return callback.fcall(value).thenResolve(value)
        })
      };
      /**
 * Registers an observer on a promise.
 *
 * Guarantees:
 *
 * 1. that fulfilled and rejected will be called only once.
 * 2. that either the fulfilled callback or the rejected callback will be
 *    called, but not both.
 * 3. that fulfilled and rejected will not be called in this turn.
 *
 * @param value      promise or immediate reference to observe
 * @param fulfilled  function to be called with the fulfilled value
 * @param rejected   function to be called with the rejection exception
 * @param progressed function to be called on any progress notifications
 * @return promise for the return value from the invoked callback
 */
      Q.when = when;
      function when(value, fulfilled, rejected, progressed) {
        return Q(value).then(fulfilled, rejected, progressed)
      }
      Promise.prototype.thenResolve = function (value) {
        return this.then(function () {
          return value
        })
      };
      Q.thenResolve = function (promise, value) {
        return Q(promise).thenResolve(value)
      };
      Promise.prototype.thenReject = function (reason) {
        return this.then(function () {
          throw reason
        })
      };
      Q.thenReject = function (promise, reason) {
        return Q(promise).thenReject(reason)
      };
      /**
 * If an object is not a promise, it is as "near" as possible.
 * If a promise is rejected, it is as "near" as possible too.
 * If it’s a fulfilled promise, the fulfillment value is nearer.
 * If it’s a deferred promise and the deferred has been resolved, the
 * resolution is "nearer".
 * @param object
 * @returns most resolved (nearest) form of the object
 */
      // XXX should we re-do this?
      Q.nearer = nearer;
      function nearer(value) {
        if (isPromise(value)) {
          var inspected = value.inspect();
          if (inspected.state === 'fulfilled') {
            return inspected.value
          }
        }
        return value
      }
      /**
 * @returns whether the given object is a promise.
 * Otherwise it is a fulfilled value.
 */
      Q.isPromise = isPromise;
      function isPromise(object) {
        return object instanceof Promise
      }
      Q.isPromiseAlike = isPromiseAlike;
      function isPromiseAlike(object) {
        return isObject(object) && typeof object.then === 'function'
      }
      /**
 * @returns whether the given object is a pending promise, meaning not
 * fulfilled or rejected.
 */
      Q.isPending = isPending;
      function isPending(object) {
        return isPromise(object) && object.inspect().state === 'pending'
      }
      Promise.prototype.isPending = function () {
        return this.inspect().state === 'pending'
      };
      /**
 * @returns whether the given object is a value or fulfilled
 * promise.
 */
      Q.isFulfilled = isFulfilled;
      function isFulfilled(object) {
        return !isPromise(object) || object.inspect().state === 'fulfilled'
      }
      Promise.prototype.isFulfilled = function () {
        return this.inspect().state === 'fulfilled'
      };
      /**
 * @returns whether the given object is a rejected promise.
 */
      Q.isRejected = isRejected;
      function isRejected(object) {
        return isPromise(object) && object.inspect().state === 'rejected'
      }
      Promise.prototype.isRejected = function () {
        return this.inspect().state === 'rejected'
      };
      //// BEGIN UNHANDLED REJECTION TRACKING
      // This promise library consumes exceptions thrown in handlers so they can be
      // handled by a subsequent promise.  The exceptions get added to this array when
      // they are created, and removed when they are handled.  Note that in ES6 or
      // shimmed environments, this would naturally be a `Set`.
      var unhandledReasons = [];
      var unhandledRejections = [];
      var reportedUnhandledRejections = [];
      var trackUnhandledRejections = true;
      function resetUnhandledRejections() {
        unhandledReasons.length = 0;
        unhandledRejections.length = 0;
        if (!trackUnhandledRejections) {
          trackUnhandledRejections = true
        }
      }
      function trackRejection(promise, reason) {
        if (!trackUnhandledRejections) {
          return
        }
        if (typeof process === 'object' && typeof process.emit === 'function') {
          Q.nextTick.runAfter(function () {
            if (array_indexOf(unhandledRejections, promise) !== -1) {
              process.emit('unhandledRejection', reason, promise);
              reportedUnhandledRejections.push(promise)
            }
          })
        }
        unhandledRejections.push(promise);
        if (reason && typeof reason.stack !== 'undefined') {
          unhandledReasons.push(reason.stack)
        } else {
          unhandledReasons.push('(no stack) ' + reason)
        }
      }
      function untrackRejection(promise) {
        if (!trackUnhandledRejections) {
          return
        }
        var at = array_indexOf(unhandledRejections, promise);
        if (at !== -1) {
          if (typeof process === 'object' && typeof process.emit === 'function') {
            Q.nextTick.runAfter(function () {
              var atReport = array_indexOf(reportedUnhandledRejections, promise);
              if (atReport !== -1) {
                process.emit('rejectionHandled', unhandledReasons[at], promise);
                reportedUnhandledRejections.splice(atReport, 1)
              }
            })
          }
          unhandledRejections.splice(at, 1);
          unhandledReasons.splice(at, 1)
        }
      }
      Q.resetUnhandledRejections = resetUnhandledRejections;
      Q.getUnhandledReasons = function () {
        // Make a copy so that consumers can't interfere with our internal state.
        return unhandledReasons.slice()
      };
      Q.stopUnhandledRejectionTracking = function () {
        resetUnhandledRejections();
        trackUnhandledRejections = false
      };
      resetUnhandledRejections();
      //// END UNHANDLED REJECTION TRACKING
      /**
 * Constructs a rejected promise.
 * @param reason value describing the failure
 */
      Q.reject = reject;
      function reject(reason) {
        var rejection = Promise({
          'when': function (rejected) {
            // note that the error has been handled
            if (rejected) {
              untrackRejection(this)
            }
            return rejected ? rejected(reason) : this
          }
        }, function fallback() {
          return this
        }, function inspect() {
          return {
            state: 'rejected',
            reason: reason
          }
        });
        // Note that the reason has not been handled.
        trackRejection(rejection, reason);
        return rejection
      }
      /**
 * Constructs a fulfilled promise for an immediate reference.
 * @param value immediate reference
 */
      Q.fulfill = fulfill;
      function fulfill(value) {
        return Promise({
          'when': function () {
            return value
          },
          'get': function (name) {
            return value[name]
          },
          'set': function (name, rhs) {
            value[name] = rhs
          },
          'delete': function (name) {
            delete value[name]
          },
          'post': function (name, args) {
            // Mark Miller proposes that post with no name should apply a
            // promised function.
            if (name === null || name === void 0) {
              return value.apply(void 0, args)
            } else {
              return value[name].apply(value, args)
            }
          },
          'apply': function (thisp, args) {
            return value.apply(thisp, args)
          },
          'keys': function () {
            return object_keys(value)
          }
        }, void 0, function inspect() {
          return {
            state: 'fulfilled',
            value: value
          }
        })
      }
      /**
 * Converts thenables to Q promises.
 * @param promise thenable promise
 * @returns a Q promise
 */
      function coerce(promise) {
        var deferred = defer();
        Q.nextTick(function () {
          try {
            promise.then(deferred.resolve, deferred.reject, deferred.notify)
          } catch (exception) {
            deferred.reject(exception)
          }
        });
        return deferred.promise
      }
      /**
 * Annotates an object such that it will never be
 * transferred away from this process over any promise
 * communication channel.
 * @param object
 * @returns promise a wrapping of that object that
 * additionally responds to the "isDef" message
 * without a rejection.
 */
      Q.master = master;
      function master(object) {
        return Promise({
          'isDef': function () {
          }
        }, function fallback(op, args) {
          return dispatch(object, op, args)
        }, function () {
          return Q(object).inspect()
        })
      }
      /**
 * Spreads the values of a promised array of arguments into the
 * fulfillment callback.
 * @param fulfilled callback that receives variadic arguments from the
 * promised array
 * @param rejected callback that receives the exception if the promise
 * is rejected.
 * @returns a promise for the return value or thrown exception of
 * either callback.
 */
      Q.spread = spread;
      function spread(value, fulfilled, rejected) {
        return Q(value).spread(fulfilled, rejected)
      }
      Promise.prototype.spread = function (fulfilled, rejected) {
        return this.all().then(function (array) {
          return fulfilled.apply(void 0, array)
        }, rejected)
      };
      /**
 * The async function is a decorator for generator functions, turning
 * them into asynchronous generators.  Although generators are only part
 * of the newest ECMAScript 6 drafts, this code does not cause syntax
 * errors in older engines.  This code should continue to work and will
 * in fact improve over time as the language improves.
 *
 * ES6 generators are currently part of V8 version 3.19 with the
 * --harmony-generators runtime flag enabled.  SpiderMonkey has had them
 * for longer, but under an older Python-inspired form.  This function
 * works on both kinds of generators.
 *
 * Decorates a generator function such that:
 *  - it may yield promises
 *  - execution will continue when that promise is fulfilled
 *  - the value of the yield expression will be the fulfilled value
 *  - it returns a promise for the return value (when the generator
 *    stops iterating)
 *  - the decorated function returns a promise for the return value
 *    of the generator or the first rejected promise among those
 *    yielded.
 *  - if an error is thrown in the generator, it propagates through
 *    every following yield until it is caught, or until it escapes
 *    the generator function altogether, and is translated into a
 *    rejection for the promise returned by the decorated generator.
 */
      Q.async = async;
      function async(makeGenerator) {
        return function () {
          // when verb is "send", arg is a value
          // when verb is "throw", arg is an exception
          function continuer(verb, arg) {
            var result;
            // Until V8 3.19 / Chromium 29 is released, SpiderMonkey is the only
            // engine that has a deployed base of browsers that support generators.
            // However, SM's generators use the Python-inspired semantics of
            // outdated ES6 drafts.  We would like to support ES6, but we'd also
            // like to make it possible to use generators in deployed browsers, so
            // we also support Python-style generators.  At some point we can remove
            // this block.
            if (typeof StopIteration === 'undefined') {
              // ES6 Generators
              try {
                result = generator[verb](arg)
              } catch (exception) {
                return reject(exception)
              }
              if (result.done) {
                return Q(result.value)
              } else {
                return when(result.value, callback, errback)
              }
            } else {
              // SpiderMonkey Generators
              // FIXME: Remove this case when SM does ES6 generators.
              try {
                result = generator[verb](arg)
              } catch (exception) {
                if (isStopIteration(exception)) {
                  return Q(exception.value)
                } else {
                  return reject(exception)
                }
              }
              return when(result, callback, errback)
            }
          }
          var generator = makeGenerator.apply(this, arguments);
          var callback = continuer.bind(continuer, 'next');
          var errback = continuer.bind(continuer, 'throw');
          return callback()
        }
      }
      /**
 * The spawn function is a small wrapper around async that immediately
 * calls the generator and also ends the promise chain, so that any
 * unhandled errors are thrown instead of forwarded to the error
 * handler. This is useful because it's extremely common to run
 * generators at the top-level to work with libraries.
 */
      Q.spawn = spawn;
      function spawn(makeGenerator) {
        Q.done(Q.async(makeGenerator)())
      }
      // FIXME: Remove this interface once ES6 generators are in SpiderMonkey.
      /**
 * Throws a ReturnValue exception to stop an asynchronous generator.
 *
 * This interface is a stop-gap measure to support generator return
 * values in older Firefox/SpiderMonkey.  In browsers that support ES6
 * generators like Chromium 29, just use "return" in your generator
 * functions.
 *
 * @param value the return value for the surrounding generator
 * @throws ReturnValue exception with the value.
 * @example
 * // ES6 style
 * Q.async(function* () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      return foo + bar;
 * })
 * // Older SpiderMonkey style
 * Q.async(function () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      Q.return(foo + bar);
 * })
 */
      Q['return'] = _return;
      function _return(value) {
        throw new QReturnValue(value)
      }
      /**
 * The promised function decorator ensures that any promise arguments
 * are settled and passed as values (`this` is also settled and passed
 * as a value).  It will also ensure that the result of a function is
 * always a promise.
 *
 * @example
 * var add = Q.promised(function (a, b) {
 *     return a + b;
 * });
 * add(Q(a), Q(B));
 *
 * @param {function} callback The function to decorate
 * @returns {function} a function that has been decorated.
 */
      Q.promised = promised;
      function promised(callback) {
        return function () {
          return spread([
            this,
            all(arguments)
          ], function (self, args) {
            return callback.apply(self, args)
          })
        }
      }
      /**
 * sends a message to a value in a future turn
 * @param object* the recipient
 * @param op the name of the message operation, e.g., "when",
 * @param args further arguments to be forwarded to the operation
 * @returns result {Promise} a promise for the result of the operation
 */
      Q.dispatch = dispatch;
      function dispatch(object, op, args) {
        return Q(object).dispatch(op, args)
      }
      Promise.prototype.dispatch = function (op, args) {
        var self = this;
        var deferred = defer();
        Q.nextTick(function () {
          self.promiseDispatch(deferred.resolve, op, args)
        });
        return deferred.promise
      };
      /**
 * Gets the value of a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to get
 * @return promise for the property value
 */
      Q.get = function (object, key) {
        return Q(object).dispatch('get', [key])
      };
      Promise.prototype.get = function (key) {
        return this.dispatch('get', [key])
      };
      /**
 * Sets the value of a property in a future turn.
 * @param object    promise or immediate reference for object object
 * @param name      name of property to set
 * @param value     new value of property
 * @return promise for the return value
 */
      Q.set = function (object, key, value) {
        return Q(object).dispatch('set', [
          key,
          value
        ])
      };
      Promise.prototype.set = function (key, value) {
        return this.dispatch('set', [
          key,
          value
        ])
      };
      /**
 * Deletes a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to delete
 * @return promise for the return value
 */
      Q.del = // XXX legacy
      Q['delete'] = function (object, key) {
        return Q(object).dispatch('delete', [key])
      };
      Promise.prototype.del = // XXX legacy
      Promise.prototype['delete'] = function (key) {
        return this.dispatch('delete', [key])
      };
      /**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param value     a value to post, typically an array of
 *                  invocation arguments for promises that
 *                  are ultimately backed with `resolve` values,
 *                  as opposed to those backed with URLs
 *                  wherein the posted value can be any
 *                  JSON serializable object.
 * @return promise for the return value
 */
      // bound locally because it is used by other methods
      Q.mapply = // XXX As proposed by "Redsandro"
      Q.post = function (object, name, args) {
        return Q(object).dispatch('post', [
          name,
          args
        ])
      };
      Promise.prototype.mapply = // XXX As proposed by "Redsandro"
      Promise.prototype.post = function (name, args) {
        return this.dispatch('post', [
          name,
          args
        ])
      };
      /**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param ...args   array of invocation arguments
 * @return promise for the return value
 */
      Q.send = // XXX Mark Miller's proposed parlance
      Q.mcall = // XXX As proposed by "Redsandro"
      Q.invoke = function (object, name) {
        return Q(object).dispatch('post', [
          name,
          array_slice(arguments, 2)
        ])
      };
      Promise.prototype.send = // XXX Mark Miller's proposed parlance
      Promise.prototype.mcall = // XXX As proposed by "Redsandro"
      Promise.prototype.invoke = function (name) {
        return this.dispatch('post', [
          name,
          array_slice(arguments, 1)
        ])
      };
      /**
 * Applies the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param args      array of application arguments
 */
      Q.fapply = function (object, args) {
        return Q(object).dispatch('apply', [
          void 0,
          args
        ])
      };
      Promise.prototype.fapply = function (args) {
        return this.dispatch('apply', [
          void 0,
          args
        ])
      };
      /**
 * Calls the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
      Q['try'] = Q.fcall = function (object) {
        return Q(object).dispatch('apply', [
          void 0,
          array_slice(arguments, 1)
        ])
      };
      Promise.prototype.fcall = function () {
        return this.dispatch('apply', [
          void 0,
          array_slice(arguments)
        ])
      };
      /**
 * Binds the promised function, transforming return values into a fulfilled
 * promise and thrown errors into a rejected one.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
      Q.fbind = function (object) {
        var promise = Q(object);
        var args = array_slice(arguments, 1);
        return function fbound() {
          return promise.dispatch('apply', [
            this,
            args.concat(array_slice(arguments))
          ])
        }
      };
      Promise.prototype.fbind = function () {
        var promise = this;
        var args = array_slice(arguments);
        return function fbound() {
          return promise.dispatch('apply', [
            this,
            args.concat(array_slice(arguments))
          ])
        }
      };
      /**
 * Requests the names of the owned properties of a promised
 * object in a future turn.
 * @param object    promise or immediate reference for target object
 * @return promise for the keys of the eventually settled object
 */
      Q.keys = function (object) {
        return Q(object).dispatch('keys', [])
      };
      Promise.prototype.keys = function () {
        return this.dispatch('keys', [])
      };
      /**
 * Turns an array of promises into a promise for an array.  If any of
 * the promises gets rejected, the whole array is rejected immediately.
 * @param {Array*} an array (or promise for an array) of values (or
 * promises for values)
 * @returns a promise for an array of the corresponding values
 */
      // By Mark Miller
      // http://wiki.ecmascript.org/doku.php?id=strawman:concurrency&rev=1308776521#allfulfilled
      Q.all = all;
      function all(promises) {
        return when(promises, function (promises) {
          var pendingCount = 0;
          var deferred = defer();
          array_reduce(promises, function (undefined, promise, index) {
            var snapshot;
            if (isPromise(promise) && (snapshot = promise.inspect()).state === 'fulfilled') {
              promises[index] = snapshot.value
            } else {
              ++pendingCount;
              when(promise, function (value) {
                promises[index] = value;
                if (--pendingCount === 0) {
                  deferred.resolve(promises)
                }
              }, deferred.reject, function (progress) {
                deferred.notify({
                  index: index,
                  value: progress
                })
              })
            }
          }, void 0);
          if (pendingCount === 0) {
            deferred.resolve(promises)
          }
          return deferred.promise
        })
      }
      Promise.prototype.all = function () {
        return all(this)
      };
      /**
 * Returns the first resolved promise of an array. Prior rejected promises are
 * ignored.  Rejects only if all promises are rejected.
 * @param {Array*} an array containing values or promises for values
 * @returns a promise fulfilled with the value of the first resolved promise,
 * or a rejected promise if all promises are rejected.
 */
      Q.any = any;
      function any(promises) {
        if (promises.length === 0) {
          return Q.resolve()
        }
        var deferred = Q.defer();
        var pendingCount = 0;
        array_reduce(promises, function (prev, current, index) {
          var promise = promises[index];
          pendingCount++;
          when(promise, onFulfilled, onRejected, onProgress);
          function onFulfilled(result) {
            deferred.resolve(result)
          }
          function onRejected() {
            pendingCount--;
            if (pendingCount === 0) {
              deferred.reject(new Error("Can't get fulfillment value from any promise, all " + 'promises were rejected.'))
            }
          }
          function onProgress(progress) {
            deferred.notify({
              index: index,
              value: progress
            })
          }
        }, undefined);
        return deferred.promise
      }
      Promise.prototype.any = function () {
        return any(this)
      };
      /**
 * Waits for all promises to be settled, either fulfilled or
 * rejected.  This is distinct from `all` since that would stop
 * waiting at the first rejection.  The promise returned by
 * `allResolved` will never be rejected.
 * @param promises a promise for an array (or an array) of promises
 * (or values)
 * @return a promise for an array of promises
 */
      Q.allResolved = deprecate(allResolved, 'allResolved', 'allSettled');
      function allResolved(promises) {
        return when(promises, function (promises) {
          promises = array_map(promises, Q);
          return when(all(array_map(promises, function (promise) {
            return when(promise, noop, noop)
          })), function () {
            return promises
          })
        })
      }
      Promise.prototype.allResolved = function () {
        return allResolved(this)
      };
      /**
 * @see Promise#allSettled
 */
      Q.allSettled = allSettled;
      function allSettled(promises) {
        return Q(promises).allSettled()
      }
      /**
 * Turns an array of promises into a promise for an array of their states (as
 * returned by `inspect`) when they have all settled.
 * @param {Array[Any*]} values an array (or promise for an array) of values (or
 * promises for values)
 * @returns {Array[State]} an array of states for the respective values.
 */
      Promise.prototype.allSettled = function () {
        return this.then(function (promises) {
          return all(array_map(promises, function (promise) {
            promise = Q(promise);
            function regardless() {
              return promise.inspect()
            }
            return promise.then(regardless, regardless)
          }))
        })
      };
      /**
 * Captures the failure of a promise, giving an oportunity to recover
 * with a callback.  If the given promise is fulfilled, the returned
 * promise is fulfilled.
 * @param {Any*} promise for something
 * @param {Function} callback to fulfill the returned promise if the
 * given promise is rejected
 * @returns a promise for the return value of the callback
 */
      Q.fail = // XXX legacy
      Q['catch'] = function (object, rejected) {
        return Q(object).then(void 0, rejected)
      };
      Promise.prototype.fail = // XXX legacy
      Promise.prototype['catch'] = function (rejected) {
        return this.then(void 0, rejected)
      };
      /**
 * Attaches a listener that can respond to progress notifications from a
 * promise's originating deferred. This listener receives the exact arguments
 * passed to ``deferred.notify``.
 * @param {Any*} promise for something
 * @param {Function} callback to receive any progress notifications
 * @returns the given promise, unchanged
 */
      Q.progress = progress;
      function progress(object, progressed) {
        return Q(object).then(void 0, void 0, progressed)
      }
      Promise.prototype.progress = function (progressed) {
        return this.then(void 0, void 0, progressed)
      };
      /**
 * Provides an opportunity to observe the settling of a promise,
 * regardless of whether the promise is fulfilled or rejected.  Forwards
 * the resolution to the returned promise when the callback is done.
 * The callback can return a promise to defer completion.
 * @param {Any*} promise
 * @param {Function} callback to observe the resolution of the given
 * promise, takes no arguments.
 * @returns a promise for the resolution of the given promise when
 * ``fin`` is done.
 */
      Q.fin = // XXX legacy
      Q['finally'] = function (object, callback) {
        return Q(object)['finally'](callback)
      };
      Promise.prototype.fin = // XXX legacy
      Promise.prototype['finally'] = function (callback) {
        callback = Q(callback);
        return this.then(function (value) {
          return callback.fcall().then(function () {
            return value
          })
        }, function (reason) {
          // TODO attempt to recycle the rejection with "this".
          return callback.fcall().then(function () {
            throw reason
          })
        })
      };
      /**
 * Terminates a chain of promises, forcing rejections to be
 * thrown as exceptions.
 * @param {Any*} promise at the end of a chain of promises
 * @returns nothing
 */
      Q.done = function (object, fulfilled, rejected, progress) {
        return Q(object).done(fulfilled, rejected, progress)
      };
      Promise.prototype.done = function (fulfilled, rejected, progress) {
        var onUnhandledError = function (error) {
          // forward to a future turn so that ``when``
          // does not catch it and turn it into a rejection.
          Q.nextTick(function () {
            makeStackTraceLong(error, promise);
            if (Q.onerror) {
              Q.onerror(error)
            } else {
              throw error
            }
          })
        };
        // Avoid unnecessary `nextTick`ing via an unnecessary `when`.
        var promise = fulfilled || rejected || progress ? this.then(fulfilled, rejected, progress) : this;
        if (typeof process === 'object' && process && process.domain) {
          onUnhandledError = process.domain.bind(onUnhandledError)
        }
        promise.then(void 0, onUnhandledError)
      };
      /**
 * Causes a promise to be rejected if it does not get fulfilled before
 * some milliseconds time out.
 * @param {Any*} promise
 * @param {Number} milliseconds timeout
 * @param {Any*} custom error message or Error object (optional)
 * @returns a promise for the resolution of the given promise if it is
 * fulfilled before the timeout, otherwise rejected.
 */
      Q.timeout = function (object, ms, error) {
        return Q(object).timeout(ms, error)
      };
      Promise.prototype.timeout = function (ms, error) {
        var deferred = defer();
        var timeoutId = setTimeout(function () {
          if (!error || 'string' === typeof error) {
            error = new Error(error || 'Timed out after ' + ms + ' ms');
            error.code = 'ETIMEDOUT'
          }
          deferred.reject(error)
        }, ms);
        this.then(function (value) {
          clearTimeout(timeoutId);
          deferred.resolve(value)
        }, function (exception) {
          clearTimeout(timeoutId);
          deferred.reject(exception)
        }, deferred.notify);
        return deferred.promise
      };
      /**
 * Returns a promise for the given value (or promised value), some
 * milliseconds after it resolved. Passes rejections immediately.
 * @param {Any*} promise
 * @param {Number} milliseconds
 * @returns a promise for the resolution of the given promise after milliseconds
 * time has elapsed since the resolution of the given promise.
 * If the given promise rejects, that is passed immediately.
 */
      Q.delay = function (object, timeout) {
        if (timeout === void 0) {
          timeout = object;
          object = void 0
        }
        return Q(object).delay(timeout)
      };
      Promise.prototype.delay = function (timeout) {
        return this.then(function (value) {
          var deferred = defer();
          setTimeout(function () {
            deferred.resolve(value)
          }, timeout);
          return deferred.promise
        })
      };
      /**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided as an array, and returns a promise.
 *
 *      Q.nfapply(FS.readFile, [__filename])
 *      .then(function (content) {
 *      })
 *
 */
      Q.nfapply = function (callback, args) {
        return Q(callback).nfapply(args)
      };
      Promise.prototype.nfapply = function (args) {
        var deferred = defer();
        var nodeArgs = array_slice(args);
        nodeArgs.push(deferred.makeNodeResolver());
        this.fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise
      };
      /**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided individually, and returns a promise.
 * @example
 * Q.nfcall(FS.readFile, __filename)
 * .then(function (content) {
 * })
 *
 */
      Q.nfcall = function (callback) {
        var args = array_slice(arguments, 1);
        return Q(callback).nfapply(args)
      };
      Promise.prototype.nfcall = function () {
        var nodeArgs = array_slice(arguments);
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        this.fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise
      };
      /**
 * Wraps a NodeJS continuation passing function and returns an equivalent
 * version that returns a promise.
 * @example
 * Q.nfbind(FS.readFile, __filename)("utf-8")
 * .then(console.log)
 * .done()
 */
      Q.nfbind = Q.denodeify = function (callback) {
        var baseArgs = array_slice(arguments, 1);
        return function () {
          var nodeArgs = baseArgs.concat(array_slice(arguments));
          var deferred = defer();
          nodeArgs.push(deferred.makeNodeResolver());
          Q(callback).fapply(nodeArgs).fail(deferred.reject);
          return deferred.promise
        }
      };
      Promise.prototype.nfbind = Promise.prototype.denodeify = function () {
        var args = array_slice(arguments);
        args.unshift(this);
        return Q.denodeify.apply(void 0, args)
      };
      Q.nbind = function (callback, thisp) {
        var baseArgs = array_slice(arguments, 2);
        return function () {
          var nodeArgs = baseArgs.concat(array_slice(arguments));
          var deferred = defer();
          nodeArgs.push(deferred.makeNodeResolver());
          function bound() {
            return callback.apply(thisp, arguments)
          }
          Q(bound).fapply(nodeArgs).fail(deferred.reject);
          return deferred.promise
        }
      };
      Promise.prototype.nbind = function () {
        var args = array_slice(arguments, 0);
        args.unshift(this);
        return Q.nbind.apply(void 0, args)
      };
      /**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback with a given array of arguments, plus a provided callback.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param {Array} args arguments to pass to the method; the callback
 * will be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
      Q.nmapply = // XXX As proposed by "Redsandro"
      Q.npost = function (object, name, args) {
        return Q(object).npost(name, args)
      };
      Promise.prototype.nmapply = // XXX As proposed by "Redsandro"
      Promise.prototype.npost = function (name, args) {
        var nodeArgs = array_slice(args || []);
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        this.dispatch('post', [
          name,
          nodeArgs
        ]).fail(deferred.reject);
        return deferred.promise
      };
      /**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback, forwarding the given variadic arguments, plus a provided
 * callback argument.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param ...args arguments to pass to the method; the callback will
 * be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
      Q.nsend = // XXX Based on Mark Miller's proposed "send"
      Q.nmcall = // XXX Based on "Redsandro's" proposal
      Q.ninvoke = function (object, name) {
        var nodeArgs = array_slice(arguments, 2);
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        Q(object).dispatch('post', [
          name,
          nodeArgs
        ]).fail(deferred.reject);
        return deferred.promise
      };
      Promise.prototype.nsend = // XXX Based on Mark Miller's proposed "send"
      Promise.prototype.nmcall = // XXX Based on "Redsandro's" proposal
      Promise.prototype.ninvoke = function (name) {
        var nodeArgs = array_slice(arguments, 1);
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        this.dispatch('post', [
          name,
          nodeArgs
        ]).fail(deferred.reject);
        return deferred.promise
      };
      /**
 * If a function would like to support both Node continuation-passing-style and
 * promise-returning-style, it can end its internal promise chain with
 * `nodeify(nodeback)`, forwarding the optional nodeback argument.  If the user
 * elects to use a nodeback, the result will be sent there.  If they do not
 * pass a nodeback, they will receive the result promise.
 * @param object a result (or a promise for a result)
 * @param {Function} nodeback a Node.js-style callback
 * @returns either the promise or nothing
 */
      Q.nodeify = nodeify;
      function nodeify(object, nodeback) {
        return Q(object).nodeify(nodeback)
      }
      Promise.prototype.nodeify = function (nodeback) {
        if (nodeback) {
          this.then(function (value) {
            Q.nextTick(function () {
              nodeback(null, value)
            })
          }, function (error) {
            Q.nextTick(function () {
              nodeback(error)
            })
          })
        } else {
          return this
        }
      };
      Q.noConflict = function () {
        throw new Error('Q.noConflict only works when Q is used as a global')
      };
      // All code before this point will be filtered from stack traces.
      var qEndingLine = captureLine();
      return Q
    }))
  });
  // source: /Users/dtai/work/verus/crowdcontrol/src/data/api.coffee
  require.define('./data/api', function (module, exports, __dirname, __filename) {
    var Api, Q, ScheduledTask, ScheduledTaskType, _, config, log, requestAnimationFrame, utils;
    _ = require('underscore/underscore');
    Q = require('q/q');
    config = require('./config');
    utils = require('./utils');
    log = utils.log;
    requestAnimationFrame = utils.shim.requestAnimationFrame;
    ScheduledTaskType = {
      every: 'every',
      once: 'once'
    };
    ScheduledTask = function () {
      function ScheduledTask(type, fn1, millis1) {
        this.type = type;
        this.fn = fn1;
        this.millis = millis1;
        this.scheduledTime = _.now() + this.millis;
        this.kill = false
      }
      ScheduledTask.prototype.cancel = function () {
        return this.kill = true
      };
      return ScheduledTask
    }();
    Api = function () {
      Api.prototype.scheduledTasks = null;
      function Api(url1, token) {
        var url;
        this.url = url1;
        this.token = token;
        this.scheduledTasks = [];
        url = this.url;
        if (url[url.length - 1] === '/') {
          this.url = url.substring(0, url.length - 1)
        }
        if (config.api == null) {
          config.api = this
        }
      }
      Api.prototype.get = function (path) {
        var p;
        if (path[0] !== '/') {
          p = '/' + path
        }
        return Q.xhr({
          method: 'GET',
          headers: { Authorization: this.token },
          url: this.url + p
        })
      };
      Api.prototype.post = function (path, data) {
        var p;
        if (path[0] !== '/') {
          p = '/' + path
        }
        return Q.xhr({
          method: 'POST',
          headers: { Authorization: this.token },
          url: this.url + p,
          data: data
        })
      };
      Api.prototype.put = function (path, data) {
        var p;
        if (path[0] !== '/') {
          p = '/' + path
        }
        return Q.xhr({
          method: 'PUT',
          headers: { Authorization: this.token },
          url: this.url + p,
          data: data
        })
      };
      Api.prototype.patch = function (path, data) {
        var p;
        if (path[0] !== '/') {
          p = '/' + path
        }
        return Q.xhr({
          method: 'PATCH',
          headers: { Authorization: this.token },
          url: this.url + p,
          data: data
        })
      };
      Api.prototype['delete'] = function (path) {
        var p;
        if (path[0] !== '/') {
          p = '/' + path
        }
        return Q.xhr({
          method: 'DELETE',
          headers: { Authorization: this.token },
          url: this.url + p
        })
      };
      Api.prototype.scheduleOnce = function (fn, millis) {
        var task;
        task = new ScheduledTask(ScheduledTaskType.once, fn, millis);
        this.scheduledTasks.push(task);
        if (this.scheduledTasks.length === 1) {
          this.loop()
        }
        return task
      };
      Api.prototype.scheduleEvery = function (fn, millis, now) {
        var task;
        if (now == null) {
          now = false
        }
        task = new ScheduledTask(ScheduledTaskType.every, fn, millis);
        this.scheduledTasks.push(task);
        if (this.scheduledTasks.length === 1) {
          this.loop()
        }
        if (now) {
          log('API: scheduling for immediate execution');
          task = new ScheduledTask(ScheduledTaskType.once, fn, 0);
          this.scheduledTasks.push(task)
        }
        return task
      };
      Api.prototype.loop = function () {
        if (this.scheduledTasks.length > 0) {
          log('API: starting loop');
          return requestAnimationFrame(function (_this) {
            return function () {
              var i, length, now, sfn;
              now = _.now();
              i = 0;
              length = _this.scheduledTasks.length;
              while (i < length) {
                sfn = _this.scheduledTasks[i];
                if (sfn.scheduledTime <= now) {
                  if (!sfn.kill) {
                    sfn.fn(now)
                  }
                  if (sfn.kill || sfn.type === ScheduledTaskType.once) {
                    length--;
                    _this.scheduledTasks[i] = _this.scheduledTasks[length]
                  } else if (sfn.type === ScheduledTaskType.every) {
                    sfn.scheduledTime += sfn.millis
                  }
                } else {
                  i++
                }
              }
              _this.scheduledTasks.length = length;
              if (length > 0) {
                return _this.loop()
              }
            }
          }(this))
        }
      };
      return Api
    }();
    module.exports = Api
  });
  // source: /Users/dtai/work/verus/crowdcontrol/src/config.coffee
  require.define('./config', function (module, exports, __dirname, __filename) {
    module.exports = {}
  });
  // source: /Users/dtai/work/verus/crowdcontrol/src/utils/index.coffee
  require.define('./utils', function (module, exports, __dirname, __filename) {
    module.exports = {
      shim: require('./utils/shim'),
      log: require('./utils/log'),
      mediator: require('./utils/mediator')
    }
  });
  // source: /Users/dtai/work/verus/crowdcontrol/src/utils/shim.coffee
  require.define('./utils/shim', function (module, exports, __dirname, __filename) {
    var Q;
    Q = require('q/q');
    if (typeof XMLHttpRequest !== 'undefined' && XMLHttpRequest !== null) {
      require('q-xhr/q-xhr')(XMLHttpRequest, Q)
    } else {
      require('q-xhr/q-xhr')
    }
    Function.prototype.property = function (prop, desc) {
      return Object.defineProperty(this.prototype, prop, desc)
    };
    module.exports = {
      observable: function (obj) {
        return this.riot.observable(obj)
      },
      requestAnimationFrame: require('raf'),
      riot: typeof window !== 'undefined' && window !== null || {} ? window.riot : void 0
    }
  });
  // source: /Users/dtai/work/verus/crowdcontrol/node_modules/q-xhr/q-xhr.js
  require.define('q-xhr/q-xhr', function (module, exports, __dirname, __filename) {
    // Currently requires polyfills for
    // Array#forEach
    // Object.keys
    // String#trim
    (function (factory) {
      if (typeof define === 'function' && define.amd) {
        define(['q'], function (Q) {
          return factory(XMLHttpRequest, Q)
        })
      } else if (typeof exports === 'object' && typeof module === 'object') {
        // CommonJS, mainly for testing
        module.exports = factory
      } else {
        if (typeof Q !== 'undefined') {
          factory(XMLHttpRequest, Q)
        }
      }
    }(function (XHR, Q) {
      // shallow extend with varargs
      function extend(dst) {
        Array.prototype.forEach.call(arguments, function (obj) {
          if (obj && obj !== dst) {
            Object.keys(obj).forEach(function (key) {
              dst[key] = obj[key]
            })
          }
        });
        return dst
      }
      function lowercase(str) {
        return (str || '').toLowerCase()
      }
      function parseHeaders(headers) {
        var parsed = {}, key, val, i;
        if (!headers)
          return parsed;
        headers.split('\n').forEach(function (line) {
          i = line.indexOf(':');
          key = lowercase(line.substr(0, i).trim());
          val = line.substr(i + 1).trim();
          if (key) {
            if (parsed[key]) {
              parsed[key] += ', ' + val
            } else {
              parsed[key] = val
            }
          }
        });
        return parsed
      }
      function headersGetter(headers) {
        var headersObj = typeof headers === 'object' ? headers : undefined;
        return function (name) {
          if (!headersObj)
            headersObj = parseHeaders(headers);
          if (name) {
            return headersObj[lowercase(name)]
          }
          return headersObj
        }
      }
      function transformData(data, headers, fns) {
        if (typeof fns === 'function') {
          return fns(data, headers)
        }
        fns.forEach(function (fn) {
          data = fn(data, headers)
        });
        return data
      }
      function isSuccess(status) {
        return 200 <= status && status < 300
      }
      function forEach(obj, iterator, context) {
        var keys = Object.keys(obj);
        keys.forEach(function (key) {
          iterator.call(context, obj[key], key)
        });
        return keys
      }
      function forEachSorted(obj, iterator, context) {
        var keys = Object.keys(obj).sort();
        keys.forEach(function (key) {
          iterator.call(context, obj[key], key)
        });
        return keys
      }
      function buildUrl(url, params) {
        if (!params)
          return url;
        var parts = [];
        forEachSorted(params, function (value, key) {
          if (value == null)
            return;
          if (!Array.isArray(value))
            value = [value];
          value.forEach(function (v) {
            if (typeof v === 'object') {
              v = JSON.stringify(v)
            }
            parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(v))
          })
        });
        return url + (url.indexOf('?') == -1 ? '?' : '&') + parts.join('&')
      }
      Q.xhr = function (requestConfig) {
        var defaults = Q.xhr.defaults, config = {
            transformRequest: defaults.transformRequest,
            transformResponse: defaults.transformResponse
          }, mergeHeaders = function (config) {
            var defHeaders = defaults.headers, reqHeaders = extend({}, config.headers), defHeaderName, lowercaseDefHeaderName, reqHeaderName, execHeaders = function (headers) {
                forEach(headers, function (headerFn, header) {
                  if (typeof headerFn === 'function') {
                    var headerContent = headerFn();
                    if (headerContent != null) {
                      headers[header] = headerContent
                    } else {
                      delete headers[header]
                    }
                  }
                })
              };
            defHeaders = extend({}, defHeaders.common, defHeaders[lowercase(config.method)]);
            // execute if header value is function
            execHeaders(defHeaders);
            execHeaders(reqHeaders);
            // using for-in instead of forEach to avoid unecessary iteration after header has been found
            defaultHeadersIteration:
              for (defHeaderName in defHeaders) {
                lowercaseDefHeaderName = lowercase(defHeaderName);
                for (reqHeaderName in reqHeaders) {
                  if (lowercase(reqHeaderName) === lowercaseDefHeaderName) {
                    continue defaultHeadersIteration
                  }
                }
                reqHeaders[defHeaderName] = defHeaders[defHeaderName]
              }
            return reqHeaders
          }, headers = mergeHeaders(requestConfig);
        extend(config, requestConfig);
        config.headers = headers;
        config.method = (config.method || 'GET').toUpperCase();
        var serverRequest = function (config) {
            headers = config.headers;
            var reqData = transformData(config.data, headersGetter(headers), config.transformRequest);
            // strip content-type if data is undefined TODO does it really matter?
            if (config.data == null) {
              forEach(headers, function (value, header) {
                if (lowercase(header) === 'content-type') {
                  delete headers[header]
                }
              })
            }
            if (config.withCredentials == null && defaults.withCredentials != null) {
              config.withCredentials = defaults.withCredentials
            }
            // send request
            return sendReq(config, reqData, headers).then(transformResponse, transformResponse)
          }, transformResponse = function (response) {
            response.data = transformData(response.data, response.headers, config.transformResponse);
            return isSuccess(response.status) ? response : Q.reject(response)
          }, promise = Q.when(config);
        // build a promise chain with request interceptors first, then the request, and response interceptors
        Q.xhr.interceptors.filter(function (interceptor) {
          return !!interceptor.request || !!interceptor.requestError
        }).map(function (interceptor) {
          return {
            success: interceptor.request,
            failure: interceptor.requestError
          }
        }).concat({ success: serverRequest }).concat(Q.xhr.interceptors.filter(function (interceptor) {
          return !!interceptor.response || !!interceptor.responseError
        }).map(function (interceptor) {
          return {
            success: interceptor.response,
            failure: interceptor.responseError
          }
        })).forEach(function (then) {
          promise = promise.then(then.success, then.failure)
        });
        return promise
      };
      var contentTypeJson = { 'Content-Type': 'application/json;charset=utf-8' };
      Q.xhr.defaults = {
        transformResponse: [function (data, headers) {
            if (typeof data === 'string' && data.length && (headers('content-type') || '').indexOf('json') >= 0) {
              data = JSON.parse(data)
            }
            return data
          }],
        transformRequest: [function (data) {
            return !!data && typeof data === 'object' && data.toString() !== '[object File]' ? JSON.stringify(data) : data
          }],
        headers: {
          common: { 'Accept': 'application/json, text/plain, */*' },
          post: contentTypeJson,
          put: contentTypeJson,
          patch: contentTypeJson
        }
      };
      Q.xhr.interceptors = [];
      Q.xhr.pendingRequests = [];
      function sendReq(config, reqData, reqHeaders) {
        var deferred = Q.defer(), promise = deferred.promise, url = buildUrl(config.url, config.params), xhr = new XHR, aborted = -1, status, timeoutId;
        Q.xhr.pendingRequests.push(config);
        xhr.open(config.method, url, true);
        forEach(config.headers, function (value, key) {
          if (value) {
            xhr.setRequestHeader(key, value)
          }
        });
        xhr.onreadystatechange = function () {
          if (xhr.readyState == 4) {
            var response, responseHeaders;
            if (status !== aborted) {
              responseHeaders = xhr.getAllResponseHeaders();
              // responseText is the old-school way of retrieving response (supported by IE8 & 9)
              // response/responseType properties were introduced in XHR Level2 spec (supported by IE10)
              response = xhr.responseType ? xhr.response : xhr.responseText
            }
            // cancel timeout and subsequent timeout promise resolution
            timeoutId && clearTimeout(timeoutId);
            status = status || xhr.status;
            xhr = null;
            // normalize status, including accounting for IE bug (http://bugs.jquery.com/ticket/1450)
            status = Math.max(status == 1223 ? 204 : status, 0);
            var idx = Q.xhr.pendingRequests.indexOf(config);
            if (idx !== -1)
              Q.xhr.pendingRequests.splice(idx, 1);
            (isSuccess(status) ? deferred.resolve : deferred.reject)({
              data: response,
              status: status,
              headers: headersGetter(responseHeaders),
              config: config
            })
          }
        };
        xhr.onprogress = function (progress) {
          deferred.notify(progress)
        };
        if (config.withCredentials) {
          xhr.withCredentials = true
        }
        if (config.responseType) {
          xhr.responseType = config.responseType
        }
        xhr.send(reqData || null);
        if (config.timeout > 0) {
          timeoutId = setTimeout(function () {
            status = aborted;
            xhr && xhr.abort()
          }, config.timeout)
        }
        return promise
      }
      [
        'get',
        'delete',
        'head'
      ].forEach(function (name) {
        Q.xhr[name] = function (url, config) {
          return Q.xhr(extend(config || {}, {
            method: name,
            url: url
          }))
        }
      });
      [
        'post',
        'put',
        'patch'
      ].forEach(function (name) {
        Q.xhr[name] = function (url, data, config) {
          return Q.xhr(extend(config || {}, {
            method: name,
            url: url,
            data: data
          }))
        }
      });
      return Q
    }))
  });
  // source: /Users/dtai/work/verus/crowdcontrol/node_modules/raf/index.js
  require.define('raf', function (module, exports, __dirname, __filename) {
    var now = require('raf/node_modules/performance-now/lib/performance-now'), global = typeof window === 'undefined' ? {} : window, vendors = [
        'moz',
        'webkit'
      ], suffix = 'AnimationFrame', raf = global['request' + suffix], caf = global['cancel' + suffix] || global['cancelRequest' + suffix];
    for (var i = 0; i < vendors.length && !raf; i++) {
      raf = global[vendors[i] + 'Request' + suffix];
      caf = global[vendors[i] + 'Cancel' + suffix] || global[vendors[i] + 'CancelRequest' + suffix]
    }
    // Some versions of FF have rAF but not cAF
    if (!raf || !caf) {
      var last = 0, id = 0, queue = [], frameDuration = 1000 / 60;
      raf = function (callback) {
        if (queue.length === 0) {
          var _now = now(), next = Math.max(0, frameDuration - (_now - last));
          last = next + _now;
          setTimeout(function () {
            var cp = queue.slice(0);
            // Clear queue here to prevent
            // callbacks from appending listeners
            // to the current frame's queue
            queue.length = 0;
            for (var i = 0; i < cp.length; i++) {
              if (!cp[i].cancelled) {
                try {
                  cp[i].callback(last)
                } catch (e) {
                  setTimeout(function () {
                    throw e
                  }, 0)
                }
              }
            }
          }, Math.round(next))
        }
        queue.push({
          handle: ++id,
          callback: callback,
          cancelled: false
        });
        return id
      };
      caf = function (handle) {
        for (var i = 0; i < queue.length; i++) {
          if (queue[i].handle === handle) {
            queue[i].cancelled = true
          }
        }
      }
    }
    module.exports = function (fn) {
      // Wrap in a new function to prevent
      // `cancel` potentially being assigned
      // to the native rAF function
      return raf.call(global, fn)
    };
    module.exports.cancel = function () {
      caf.apply(global, arguments)
    }
  });
  // source: /Users/dtai/work/verus/crowdcontrol/node_modules/raf/node_modules/performance-now/lib/performance-now.js
  require.define('raf/node_modules/performance-now/lib/performance-now', function (module, exports, __dirname, __filename) {
    // Generated by CoffeeScript 1.6.3
    (function () {
      var getNanoSeconds, hrtime, loadTime;
      if (typeof performance !== 'undefined' && performance !== null && performance.now) {
        module.exports = function () {
          return performance.now()
        }
      } else if (typeof process !== 'undefined' && process !== null && process.hrtime) {
        module.exports = function () {
          return (getNanoSeconds() - loadTime) / 1000000
        };
        hrtime = process.hrtime;
        getNanoSeconds = function () {
          var hr;
          hr = hrtime();
          return hr[0] * 1000000000 + hr[1]
        };
        loadTime = getNanoSeconds()
      } else if (Date.now) {
        module.exports = function () {
          return Date.now() - loadTime
        };
        loadTime = Date.now()
      } else {
        module.exports = function () {
          return new Date().getTime() - loadTime
        };
        loadTime = new Date().getTime()
      }
    }.call(this))  /*
//@ sourceMappingURL=performance-now.map
*/
  });
  // source: /Users/dtai/work/verus/crowdcontrol/src/utils/log.coffee
  require.define('./utils/log', function (module, exports, __dirname, __filename) {
    var log;
    log = function () {
      if (log.DEBUG) {
        return console.log.apply(console, arguments)
      }
    };
    log.DEBUG = false;
    log.debug = log;
    log.info = function () {
      return console.log.apply(console, arguments)
    };
    log.warn = function () {
      console.log('WARN:');
      return console.log.apply(console, arguments)
    };
    log.error = function () {
      console.log('ERROR:');
      console.log.apply(console, arguments);
      throw new arguments[0]
    };
    module.exports = log
  });
  // source: /Users/dtai/work/verus/crowdcontrol/src/utils/mediator.coffee
  require.define('./utils/mediator', function (module, exports, __dirname, __filename) {
    var mediator, riot;
    riot = require('./utils/shim').riot;
    mediator = {};
    riot.observable(mediator);
    module.exports = mediator
  });
  // source: /Users/dtai/work/verus/crowdcontrol/src/data/source.coffee
  require.define('./data/source', function (module, exports, __dirname, __filename) {
    var Events, Policy, Q, Source, _, config, log, requestAnimationFrame, utils;
    _ = require('underscore/underscore');
    Q = require('q/q');
    config = '../config';
    utils = require('./utils');
    requestAnimationFrame = utils.shim.requestAnimationFrame;
    log = utils.log;
    Policy = require('./data/policy').Policy;
    Events = {
      Loading: 'Loading',
      LoadData: 'LoadData',
      LoadError: 'LoadError',
      LoadDataPartial: 'LoadDataPartial'
    };
    Source = function () {
      Source.Events = Events;
      /* Basic Info */
      Source.prototype.name = '';
      /* Static Data */
      Source.prototype.data = null;
      /* Dynamic Data */
      Source.prototype.api = null;
      Source.prototype.path = '';
      Source.prototype._policy = null;
      Source.property('policy', {
        get: function () {
          return this._policy
        },
        set: function (value) {
          log('Set Policy', this.policy);
          if (this._policy != null) {
            this._policy.source = null
          }
          this.stop();
          this._policy = value || Policy.Once;
          if (this._policy != null) {
            this._policy.source = this
          }
          return this.start()
        }
      });
      Source.prototype._task = null;
      Source.prototype._mediator = utils.mediator;
      function Source(options) {
        var policy;
        this.options = options;
        policy = this.options.policy || Policy.Once;
        delete this.options.policy;
        _.extend(this, this.options);
        if (this.api == null) {
          this.api = config.api
        }
        this.policy = policy
      }
      Source.prototype.start = function () {
        var policy;
        if (this.api != null) {
          policy = this.policy;
          if (policy.intervalTime === Infinity) {
            return this._task = this.api.scheduleOnce(function (_this) {
              return function () {
                return _this._load()
              }
            }(this), 0)
          } else {
            return this._task = this.api.scheduleEvery(function (_this) {
              return function () {
                return _this._load()
              }
            }(this), policy.intervalTime, true)
          }
        } else {
          return requestAnimationFrame(function (_this) {
            return function () {
              return _this._load()
            }
          }(this))
        }
      };
      Source.prototype.stop = function () {
        if (this._task != null) {
          this._task.cancel()
        }
        return this._task = null
      };
      Source.prototype._load = function () {
        var d, error, fail, load, progress, success;
        this.policy.unload();
        if (this.api != null) {
          this.trigger(Events.Loading);
          success = function (_this) {
            return function (data) {
              _this.trigger(Events.LoadData, data);
              return _this.data = data
            }
          }(this);
          error = function (_this) {
            return function (err) {
              return _this.trigger(Events.LoadError, err)
            }
          }(this);
          progress = function (_this) {
            return function (data) {
              _this.trigger(Events.LoadDataPartial, data);
              return _this.data = data
            }
          }(this);
          load = function (_this) {
            return function (res) {
              return _this.policy.load(res).done(success, error, progress)
            }
          }(this);
          fail = function (_this) {
            return function (res) {
              return _this.trigger(Events.LoadError, res.message)
            }
          }(this);
          return this.api.get(this.path).then(load, fail)
        } else {
          d = Q.defer();
          requestAnimationFrame(function (_this) {
            return function () {
              _this.trigger(Events.LoadData, _this.data);
              return d.resolve(_this.data)
            }
          }(this));
          return d.promise
        }
      };
      Source.prototype.eventName = function (event) {
        return this.name + '.' + event.trim().replace(' ', ' ' + this.name + '.')
      };
      Source.prototype.on = function (event, fn) {
        return this._mediator.on(this.eventName(event), fn)
      };
      Source.prototype.once = function (event, fn) {
        return this._mediator.one(this.eventName(event), fn)
      };
      Source.prototype.off = function (event, fn) {
        return this._mediator.off(this.eventName(event), fn)
      };
      Source.prototype.trigger = function (event) {
        var args;
        args = Array.prototype.slice.call(arguments);
        args.shift();
        args.unshift(this.eventName(event));
        return this._mediator.trigger.apply(this, args)
      };
      return Source
    }();
    module.exports = Source
  });
  // source: /Users/dtai/work/verus/crowdcontrol/src/view/index.coffee
  require.define('./view', function (module, exports, __dirname, __filename) {
    module.exports = {
      form: require('./view/form'),
      View: require('./view/view')
    }
  });
  // source: /Users/dtai/work/verus/crowdcontrol/src/view/form.coffee
  require.define('./view/form', function (module, exports, __dirname, __filename) {
    var FormView, FormViewEvents, Input, InputCondition, InputConfig, InputView, InputViewEvents, Q, ValidatorCondition, View, _, helpers, log, riot, utils, extend = function (child, parent) {
        for (var key in parent) {
          if (hasProp.call(parent, key))
            child[key] = parent[key]
        }
        function ctor() {
          this.constructor = child
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor;
        child.__super__ = parent.prototype;
        return child
      }, hasProp = {}.hasOwnProperty;
    utils = require('./utils');
    log = utils.log;
    riot = utils.shim.riot;
    _ = require('underscore/underscore');
    Q = require('q/q');
    View = require('./view/view');
    InputConfig = function () {
      InputConfig.prototype.name = '';
      InputConfig.prototype['default'] = '';
      InputConfig.prototype.placeholder = '';
      InputConfig.prototype.hints = '';
      function InputConfig(name1, _default, placeholder, hints) {
        this.name = name1;
        this['default'] = _default != null ? _default : '';
        this.placeholder = placeholder != null ? placeholder : '';
        this.hints = hints != null ? hints : ''
      }
      return InputConfig
    }();
    Input = function () {
      Input.prototype.tag = '';
      Input.prototype.model = {};
      Input.prototype.validator = function () {
      };
      function Input(tag1, model1, validator1) {
        this.tag = tag1;
        this.model = model1;
        this.validator = validator1
      }
      return Input
    }();
    ValidatorCondition = function () {
      function ValidatorCondition(predicate1, validatorFn1) {
        this.predicate = predicate1;
        this.validatorFn = validatorFn1
      }
      return ValidatorCondition
    }();
    InputCondition = function () {
      function InputCondition(predicate1, tagName1) {
        this.predicate = predicate1;
        this.tagName = tagName1
      }
      return InputCondition
    }();
    helpers = {
      tagLookup: [],
      validatorLookup: [],
      defaultTagName: 'form-input',
      errorTag: 'form-error',
      registerValidator: function (predicate, validatorFn) {
        if (_.isFunction(validatorFn)) {
          return this.validatorLookup.push(new ValidatorCondition(predicate, validatorFn))
        }
      },
      registerTag: function (predicate, tagName) {
        return this.tagLookup.push(new InputCondition(predicate, tagName))
      },
      deleteTag: function (tagName) {
        var i, j, len, lookup, ref, results1;
        ref = this.tagLookup;
        results1 = [];
        for (i = j = 0, len = ref.length; j < len; i = ++j) {
          lookup = ref[i];
          if (lookup.tagName === tagName) {
            results1.push(this.tagLookup[i] = null)
          } else {
            results1.push(void 0)
          }
        }
        return results1
      },
      deleteValidator: function (predicate, validatorFn) {
        var i, j, len, lookup, ref, results1;
        ref = this.validatorLookup;
        results1 = [];
        for (i = j = 0, len = ref.length; j < len; i = ++j) {
          lookup = ref[i];
          if (lookup.validatorFn === validatorFn) {
            results1.push(this.validatorLookup[i] = null)
          } else {
            results1.push(void 0)
          }
        }
        return results1
      },
      render: function (inputCfgs) {
        var fn, i, inputCfg, inputs, j, len, validators;
        inputs = {};
        fn = function (_this) {
          return function (validators) {
            var found, k, l, len1, len2, lookup, model, ref, ref1, tag, validator, validatorFn;
            ref = _this.validatorLookup;
            for (k = 0, len1 = ref.length; k < len1; k++) {
              lookup = ref[k];
              if (lookup.predicate(inputCfg)) {
                validatorFn = lookup.validatorFn;
                (function (validatorFn) {
                  return validators.push(function (pair) {
                    var model, name, p;
                    model = pair[0], name = pair[1];
                    return p = Q(pair).then(function (pair) {
                      return validatorFn(pair[0], pair[1])
                    }).then(function (v) {
                      var d;
                      model[name] = v;
                      d = Q.defer();
                      d.resolve(pair);
                      return d.promise
                    })
                  })
                }(validatorFn))
              }
            }
            validators.push(function (pair) {
              var d, model, name;
              model = pair[0], name = pair[1];
              d = Q.defer();
              d.resolve(model[name]);
              return d.promise
            });
            validator = function (model, name) {
              var l, len2, result;
              result = Q([
                model,
                name
              ]);
              for (l = 0, len2 = validators.length; l < len2; l++) {
                validatorFn = validators[l];
                result = result.then(validatorFn)
              }
              return result
            };
            found = false;
            ref1 = _this.tagLookup;
            for (l = 0, len2 = ref1.length; l < len2; l++) {
              lookup = ref1[l];
              if (lookup == null) {
                continue
              }
              if (lookup.predicate(inputCfg)) {
                tag = lookup.tagName;
                found = true;
                break
              }
            }
            if (!found) {
              tag = _this.defaultTagName
            }
            model = {
              name: inputCfg.name,
              value: inputCfg['default'],
              placeholder: inputCfg.placeholder
            };
            return inputs[inputCfg.name] = new Input(tag, model, validator)
          }
        }(this);
        for (i = j = 0, len = inputCfgs.length; j < len; i = ++j) {
          inputCfg = inputCfgs[i];
          if (inputCfg == null) {
            continue
          }
          validators = [];
          fn(validators)
        }
        return inputs
      }
    };
    InputViewEvents = {
      Set: 'set',
      Change: 'change',
      Error: 'error',
      ClearError: 'clear-error'
    };
    InputView = function (superClass) {
      var obj;
      extend(InputView, superClass);
      function InputView() {
        return InputView.__super__.constructor.apply(this, arguments)
      }
      InputView.Events = InputViewEvents;
      InputView.prototype.getValue = function (el) {
        return el.value
      };
      InputView.prototype.errorHtml = '<div class="error-container" if="{ hasError() }">\n  <div class="error-message">{ error }</div>\n</div>';
      InputView.prototype.init = function () {
        return this.html += this.errorHtml
      };
      InputView.prototype.events = (obj = {}, obj['' + InputViewEvents.Set] = function (name, value) {
        if (name === this.model.name) {
          this.clearError();
          this.model.value = value;
          return this.update()
        }
      }, obj['' + InputViewEvents.Error] = function (name, message) {
        if (name === this.model.name) {
          this.setError(message);
          return this.update()
        }
      }, obj['' + InputViewEvents.ClearError] = function (name) {
        if (name === this.model.name) {
          this.clearError();
          return this.update()
        }
      }, obj);
      InputView.prototype.mixins = {
        change: function (event) {
          var newValue;
          newValue = this.view.getValue(event.target);
          return this.obs.trigger(InputViewEvents.Change, this.model.name, newValue)
        },
        hasError: function () {
          var error;
          error = this.error;
          return error != null && error.length != null && error.length > 0
        },
        setError: function (message) {
          return this.error = message
        },
        clearError: function () {
          return this.setError(null)
        }
      };
      InputView.prototype.js = function (opts) {
        return this.model = opts.input.model
      };
      return InputView
    }(View);
    riot.tag('control', '', function (opts) {
      var input, obs;
      input = opts.input;
      obs = opts.obs;
      return riot.mount(this.root, input.tag, opts)
    });
    FormViewEvents = {
      Submit: 'submit',
      SubmitFailed: 'submit-failed'
    };
    FormView = function (superClass) {
      var obj;
      extend(FormView, superClass);
      function FormView() {
        return FormView.__super__.constructor.apply(this, arguments)
      }
      FormView.Events = FormViewEvents;
      FormView.prototype.inputConfigs = null;
      FormView.prototype.inputs = {};
      FormView.prototype.init = function () {
        if (this.inputConfigs != null) {
          this.inputs = helpers.render(this.inputConfigs)
        }
        return this.fullyValidated = false
      };
      FormView.prototype.events = (obj = {}, obj['' + InputViewEvents.Change] = function (name, newValue) {
        var input, oldValue;
        oldValue = this.model[name];
        if (oldValue === newValue) {
          this.obs.trigger(InputViewEvents.ClearError, name);
          return
        }
        this.fullyValidated = false;
        this.model[name] = newValue;
        input = this.inputs[name];
        return input.validator(this.model, name).done(function (_this) {
          return function (value) {
            return _this.obs.trigger(InputViewEvents.Set, name, value)
          }
        }(this), function (_this) {
          return function (err) {
            log('Validation error has occured', err.stack);
            _this.model[name] = oldValue;
            return _this.obs.trigger(InputViewEvents.Error, name, err.message)
          }
        }(this))
      }, obj);
      FormView.prototype.mixins = {
        submit: function (event) {
          var input, name, names, promises, ref;
          if (this.fullyValidated) {
            return true
          }
          event.preventDefault();
          names = [];
          promises = [];
          ref = this.view.inputs;
          for (name in ref) {
            input = ref[name];
            names.push(name);
            promises.push(input.validator(this.model, name))
          }
          return Q.allSettled(promises).done(function (_this) {
            return function (results) {
              var i, j, len, rejected, result;
              rejected = false;
              for (i = j = 0, len = results.length; j < len; i = ++j) {
                result = results[i];
                if (result.state === 'rejected') {
                  rejected = true;
                  _this.obs.trigger(InputViewEvents.Error, names[i], result.reason.message)
                }
              }
              if (rejected) {
                _this.obs.trigger(FormViewEvents.SubmitFailed, _this.model);
                return
              }
              _this.fullyValidated = true;
              _this.obs.trigger(FormViewEvents.Submit, _this.model);
              return _this.view.submit()
            }
          }(this))
        }
      };
      FormView.prototype.submit = function () {
      };
      FormView.prototype.js = function () {
        return this.view.initFormGroup.apply(this)
      };
      FormView.prototype.initFormGroup = function () {
        var inputs, key, ref, results1, value;
        this.inputs = inputs = this.view.inputs;
        ref = this.model;
        results1 = [];
        for (key in ref) {
          value = ref[key];
          if (inputs[key] != null) {
            results1.push(inputs[key].model.value = value)
          } else {
            results1.push(void 0)
          }
        }
        return results1
      };
      return FormView
    }(View);
    module.exports = {
      helpers: helpers,
      FormView: FormView,
      InputView: InputView,
      Input: Input,
      InputConfig: InputConfig
    }
  });
  // source: /Users/dtai/work/verus/crowdcontrol/src/view/view.coffee
  require.define('./view/view', function (module, exports, __dirname, __filename) {
    var View, _, riot, utils;
    _ = require('underscore/underscore');
    utils = require('./utils');
    riot = utils.shim.riot;
    View = function () {
      View.prototype.tag = '';
      View.prototype.html = '';
      View.prototype.css = '';
      View.prototype.attrs = '';
      View.prototype.events = null;
      View.prototype.mixins = null;
      View.prototype.model = null;
      View.prototype.js = function () {
      };
      function View(options) {
        var parentProto, proto, view;
        this.options = options;
        _.extend(this, this.options);
        proto = Object.getPrototypeOf(this);
        parentProto = proto;
        while (parentProto !== View.prototype) {
          parentProto = Object.getPrototypeOf(proto);
          proto.events = _.extend(parentProto.events, proto.events);
          proto.mixins = _.extend(parentProto.mixins, proto.mixins);
          proto = parentProto
        }
        view = this;
        this.init();
        riot.tag(this.tag, this.html, this.css, this.attrs, function (opts) {
          var fn, fn1, fn2, handler, k, name, obs, optsP, ref, ref1, v;
          optsP = Object.getPrototypeOf(opts);
          for (k in opts) {
            v = opts[k];
            if (optsP[k] != null && v == null) {
              opts[k] = optsP[k]
            }
          }
          this.view = view;
          view.ctx = this;
          this.model = opts.model || view.model;
          if (this.model == null) {
            this.model = {}
          }
          obs = this.obs = opts.obs;
          if (this.obs == null) {
            obs = this.obs = {};
            utils.shim.observable(obs)
          }
          if (view.events != null) {
            ref = view.events;
            fn1 = function (_this) {
              return function (name, handler) {
                return obs.on(name, function () {
                  return handler.apply(_this, arguments)
                })
              }
            }(this);
            for (name in ref) {
              handler = ref[name];
              fn1(name, handler)
            }
          }
          if (view.mixins != null) {
            ref1 = view.mixins;
            fn2 = function (_this) {
              return function (fn) {
                return _this[name] = function () {
                  return fn.apply(_this, arguments)
                }
              }
            }(this);
            for (name in ref1) {
              fn = ref1[name];
              fn2(fn)
            }
          }
          return this.view.js.call(this, opts)
        })
      }
      View.prototype.init = function () {
      };
      return View
    }();
    module.exports = View
  });
  // source: /Users/dtai/work/verus/crowdcontrol/src/index.coffee
  require.define('./index', function (module, exports, __dirname, __filename) {
    module.exports = {
      data: require('./data'),
      utils: require('./utils'),
      view: require('./view'),
      config: require('./config'),
      start: function () {
        return this.utils.shim.riot.mount('*')
      }
    };
    if (typeof window !== 'undefined' && window !== null) {
      window.crowdcontrol = module.exports
    }
  });
  require('./index')
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImRhdGEvaW5kZXguY29mZmVlIiwiZGF0YS9wb2xpY3kuY29mZmVlIiwibm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUvdW5kZXJzY29yZS5qcyIsIm5vZGVfbW9kdWxlcy9xL3EuanMiLCJkYXRhL2FwaS5jb2ZmZWUiLCJjb25maWcuY29mZmVlIiwidXRpbHMvaW5kZXguY29mZmVlIiwidXRpbHMvc2hpbS5jb2ZmZWUiLCJub2RlX21vZHVsZXMvcS14aHIvcS14aHIuanMiLCJub2RlX21vZHVsZXMvcmFmL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3JhZi9ub2RlX21vZHVsZXMvcGVyZm9ybWFuY2Utbm93L2xpYi9wZXJmb3JtYW5jZS1ub3cuanMiLCJ1dGlscy9sb2cuY29mZmVlIiwidXRpbHMvbWVkaWF0b3IuY29mZmVlIiwiZGF0YS9zb3VyY2UuY29mZmVlIiwidmlldy9pbmRleC5jb2ZmZWUiLCJ2aWV3L2Zvcm0uY29mZmVlIiwidmlldy92aWV3LmNvZmZlZSIsImluZGV4LmNvZmZlZSJdLCJuYW1lcyI6WyJwb2xpY3kiLCJyZXF1aXJlIiwibW9kdWxlIiwiZXhwb3J0cyIsIkFwaSIsIlNvdXJjZSIsIlBvbGljeSIsIlRhYnVsYXJSZXN0ZnVsU3RyZWFtaW5nUG9saWN5IiwiUSIsIl8iLCJleHRlbmQiLCJjaGlsZCIsInBhcmVudCIsImtleSIsImhhc1Byb3AiLCJjYWxsIiwiY3RvciIsImNvbnN0cnVjdG9yIiwicHJvdG90eXBlIiwiX19zdXBlcl9fIiwiaGFzT3duUHJvcGVydHkiLCJpbnRlcnZhbFRpbWUiLCJJbmZpbml0eSIsInNvdXJjZSIsImV2ZW50cyIsInVubG9hZCIsImxvYWQiLCJyZXMiLCJkIiwiZGF0YSIsImRlZmVyIiwicmVzb2x2ZSIsInByb21pc2UiLCJvcHRpb25zIiwiT25jZSIsInN1cGVyQ2xhc3MiLCJhcHBseSIsImFyZ3VtZW50cyIsImZhaWwiLCJmYWlsZWQiLCJpIiwiaWQiLCJqIiwibGVuIiwidG9nbyIsImlzQXJyYXkiLCJyZWplY3QiLCJtZXNzYWdlIiwibGVuZ3RoIiwiaXNPYmplY3QiLCJfdGhpcyIsInN1Y2Nlc3MiLCJkYXR1bSIsImsiLCJsZW4xIiwicGFydGlhbERhdGEiLCJwdXNoIiwibm90aWZ5IiwiYXBpIiwiZ2V0IiwicGF0aCIsInRoZW4iLCJyb290IiwicHJldmlvdXNVbmRlcnNjb3JlIiwiQXJyYXlQcm90byIsIkFycmF5IiwiT2JqUHJvdG8iLCJPYmplY3QiLCJGdW5jUHJvdG8iLCJGdW5jdGlvbiIsInNsaWNlIiwidG9TdHJpbmciLCJuYXRpdmVJc0FycmF5IiwibmF0aXZlS2V5cyIsImtleXMiLCJuYXRpdmVCaW5kIiwiYmluZCIsIm5hdGl2ZUNyZWF0ZSIsImNyZWF0ZSIsIkN0b3IiLCJvYmoiLCJfd3JhcHBlZCIsIlZFUlNJT04iLCJvcHRpbWl6ZUNiIiwiZnVuYyIsImNvbnRleHQiLCJhcmdDb3VudCIsInZhbHVlIiwib3RoZXIiLCJpbmRleCIsImNvbGxlY3Rpb24iLCJhY2N1bXVsYXRvciIsImNiIiwiaWRlbnRpdHkiLCJpc0Z1bmN0aW9uIiwibWF0Y2hlciIsInByb3BlcnR5IiwiaXRlcmF0ZWUiLCJjcmVhdGVBc3NpZ25lciIsImtleXNGdW5jIiwidW5kZWZpbmVkT25seSIsImwiLCJiYXNlQ3JlYXRlIiwicmVzdWx0IiwiTUFYX0FSUkFZX0lOREVYIiwiTWF0aCIsInBvdyIsImdldExlbmd0aCIsImlzQXJyYXlMaWtlIiwiZWFjaCIsImZvckVhY2giLCJtYXAiLCJjb2xsZWN0IiwicmVzdWx0cyIsImN1cnJlbnRLZXkiLCJjcmVhdGVSZWR1Y2UiLCJkaXIiLCJpdGVyYXRvciIsIm1lbW8iLCJyZWR1Y2UiLCJmb2xkbCIsImluamVjdCIsInJlZHVjZVJpZ2h0IiwiZm9sZHIiLCJmaW5kIiwiZGV0ZWN0IiwicHJlZGljYXRlIiwiZmluZEluZGV4IiwiZmluZEtleSIsImZpbHRlciIsInNlbGVjdCIsImxpc3QiLCJuZWdhdGUiLCJldmVyeSIsImFsbCIsInNvbWUiLCJhbnkiLCJjb250YWlucyIsImluY2x1ZGVzIiwiaW5jbHVkZSIsIml0ZW0iLCJmcm9tSW5kZXgiLCJndWFyZCIsInZhbHVlcyIsImluZGV4T2YiLCJpbnZva2UiLCJtZXRob2QiLCJhcmdzIiwiaXNGdW5jIiwicGx1Y2siLCJ3aGVyZSIsImF0dHJzIiwiZmluZFdoZXJlIiwibWF4IiwibGFzdENvbXB1dGVkIiwiY29tcHV0ZWQiLCJtaW4iLCJzaHVmZmxlIiwic2V0Iiwic2h1ZmZsZWQiLCJyYW5kIiwicmFuZG9tIiwic2FtcGxlIiwibiIsInNvcnRCeSIsImNyaXRlcmlhIiwic29ydCIsImxlZnQiLCJyaWdodCIsImEiLCJiIiwiZ3JvdXAiLCJiZWhhdmlvciIsImdyb3VwQnkiLCJoYXMiLCJpbmRleEJ5IiwiY291bnRCeSIsInRvQXJyYXkiLCJzaXplIiwicGFydGl0aW9uIiwicGFzcyIsImZpcnN0IiwiaGVhZCIsInRha2UiLCJhcnJheSIsImluaXRpYWwiLCJsYXN0IiwicmVzdCIsInRhaWwiLCJkcm9wIiwiY29tcGFjdCIsImZsYXR0ZW4iLCJpbnB1dCIsInNoYWxsb3ciLCJzdHJpY3QiLCJzdGFydEluZGV4Iiwib3V0cHV0IiwiaWR4IiwiaXNBcmd1bWVudHMiLCJ3aXRob3V0IiwiZGlmZmVyZW5jZSIsInVuaXEiLCJ1bmlxdWUiLCJpc1NvcnRlZCIsImlzQm9vbGVhbiIsInNlZW4iLCJ1bmlvbiIsImludGVyc2VjdGlvbiIsImFyZ3NMZW5ndGgiLCJ6aXAiLCJ1bnppcCIsIm9iamVjdCIsImNyZWF0ZVByZWRpY2F0ZUluZGV4RmluZGVyIiwiZmluZExhc3RJbmRleCIsInNvcnRlZEluZGV4IiwibG93IiwiaGlnaCIsIm1pZCIsImZsb29yIiwiY3JlYXRlSW5kZXhGaW5kZXIiLCJwcmVkaWNhdGVGaW5kIiwiaXNOYU4iLCJsYXN0SW5kZXhPZiIsInJhbmdlIiwic3RhcnQiLCJzdG9wIiwic3RlcCIsImNlaWwiLCJleGVjdXRlQm91bmQiLCJzb3VyY2VGdW5jIiwiYm91bmRGdW5jIiwiY2FsbGluZ0NvbnRleHQiLCJzZWxmIiwiVHlwZUVycm9yIiwiYm91bmQiLCJjb25jYXQiLCJwYXJ0aWFsIiwiYm91bmRBcmdzIiwicG9zaXRpb24iLCJiaW5kQWxsIiwiRXJyb3IiLCJtZW1vaXplIiwiaGFzaGVyIiwiY2FjaGUiLCJhZGRyZXNzIiwiZGVsYXkiLCJ3YWl0Iiwic2V0VGltZW91dCIsInRocm90dGxlIiwidGltZW91dCIsInByZXZpb3VzIiwibGF0ZXIiLCJsZWFkaW5nIiwibm93IiwicmVtYWluaW5nIiwiY2xlYXJUaW1lb3V0IiwidHJhaWxpbmciLCJkZWJvdW5jZSIsImltbWVkaWF0ZSIsInRpbWVzdGFtcCIsImNhbGxOb3ciLCJ3cmFwIiwid3JhcHBlciIsImNvbXBvc2UiLCJhZnRlciIsInRpbWVzIiwiYmVmb3JlIiwib25jZSIsImhhc0VudW1CdWciLCJwcm9wZXJ0eUlzRW51bWVyYWJsZSIsIm5vbkVudW1lcmFibGVQcm9wcyIsImNvbGxlY3ROb25FbnVtUHJvcHMiLCJub25FbnVtSWR4IiwicHJvdG8iLCJwcm9wIiwiYWxsS2V5cyIsIm1hcE9iamVjdCIsInBhaXJzIiwiaW52ZXJ0IiwiZnVuY3Rpb25zIiwibWV0aG9kcyIsIm5hbWVzIiwiZXh0ZW5kT3duIiwiYXNzaWduIiwicGljayIsIm9pdGVyYXRlZSIsIm9taXQiLCJTdHJpbmciLCJkZWZhdWx0cyIsInByb3BzIiwiY2xvbmUiLCJ0YXAiLCJpbnRlcmNlcHRvciIsImlzTWF0Y2giLCJlcSIsImFTdGFjayIsImJTdGFjayIsImNsYXNzTmFtZSIsImFyZUFycmF5cyIsImFDdG9yIiwiYkN0b3IiLCJwb3AiLCJpc0VxdWFsIiwiaXNFbXB0eSIsImlzU3RyaW5nIiwiaXNFbGVtZW50Iiwibm9kZVR5cGUiLCJ0eXBlIiwibmFtZSIsIkludDhBcnJheSIsImlzRmluaXRlIiwicGFyc2VGbG9hdCIsImlzTnVtYmVyIiwiaXNOdWxsIiwiaXNVbmRlZmluZWQiLCJub0NvbmZsaWN0IiwiY29uc3RhbnQiLCJub29wIiwicHJvcGVydHlPZiIsIm1hdGNoZXMiLCJhY2N1bSIsIkRhdGUiLCJnZXRUaW1lIiwiZXNjYXBlTWFwIiwidW5lc2NhcGVNYXAiLCJjcmVhdGVFc2NhcGVyIiwiZXNjYXBlciIsIm1hdGNoIiwiam9pbiIsInRlc3RSZWdleHAiLCJSZWdFeHAiLCJyZXBsYWNlUmVnZXhwIiwic3RyaW5nIiwidGVzdCIsInJlcGxhY2UiLCJlc2NhcGUiLCJ1bmVzY2FwZSIsImZhbGxiYWNrIiwiaWRDb3VudGVyIiwidW5pcXVlSWQiLCJwcmVmaXgiLCJ0ZW1wbGF0ZVNldHRpbmdzIiwiZXZhbHVhdGUiLCJpbnRlcnBvbGF0ZSIsIm5vTWF0Y2giLCJlc2NhcGVzIiwiZXNjYXBlQ2hhciIsInRlbXBsYXRlIiwidGV4dCIsInNldHRpbmdzIiwib2xkU2V0dGluZ3MiLCJvZmZzZXQiLCJ2YXJpYWJsZSIsInJlbmRlciIsImUiLCJhcmd1bWVudCIsImNoYWluIiwiaW5zdGFuY2UiLCJfY2hhaW4iLCJtaXhpbiIsInZhbHVlT2YiLCJ0b0pTT04iLCJkZWZpbmUiLCJhbWQiLCJkZWZpbml0aW9uIiwiYm9vdHN0cmFwIiwic2VzIiwib2siLCJtYWtlUSIsIndpbmRvdyIsImdsb2JhbCIsInByZXZpb3VzUSIsImhhc1N0YWNrcyIsInN0YWNrIiwicVN0YXJ0aW5nTGluZSIsImNhcHR1cmVMaW5lIiwicUZpbGVOYW1lIiwibmV4dFRpY2siLCJ0YXNrIiwibmV4dCIsImZsdXNoaW5nIiwicmVxdWVzdFRpY2siLCJpc05vZGVKUyIsImxhdGVyUXVldWUiLCJmbHVzaCIsImRvbWFpbiIsImVudGVyIiwicnVuU2luZ2xlIiwiZXhpdCIsInByb2Nlc3MiLCJzZXRJbW1lZGlhdGUiLCJNZXNzYWdlQ2hhbm5lbCIsImNoYW5uZWwiLCJwb3J0MSIsIm9ubWVzc2FnZSIsInJlcXVlc3RQb3J0VGljayIsInBvcnQyIiwicG9zdE1lc3NhZ2UiLCJydW5BZnRlciIsInVuY3VycnlUaGlzIiwiZiIsImFycmF5X3NsaWNlIiwiYXJyYXlfcmVkdWNlIiwiY2FsbGJhY2siLCJiYXNpcyIsImFycmF5X2luZGV4T2YiLCJhcnJheV9tYXAiLCJ0aGlzcCIsInVuZGVmaW5lZCIsIm9iamVjdF9jcmVhdGUiLCJUeXBlIiwib2JqZWN0X2hhc093blByb3BlcnR5Iiwib2JqZWN0X2tleXMiLCJvYmplY3RfdG9TdHJpbmciLCJpc1N0b3BJdGVyYXRpb24iLCJleGNlcHRpb24iLCJRUmV0dXJuVmFsdWUiLCJSZXR1cm5WYWx1ZSIsIlNUQUNLX0pVTVBfU0VQQVJBVE9SIiwibWFrZVN0YWNrVHJhY2VMb25nIiwiZXJyb3IiLCJzdGFja3MiLCJwIiwidW5zaGlmdCIsImNvbmNhdGVkU3RhY2tzIiwiZmlsdGVyU3RhY2tTdHJpbmciLCJzdGFja1N0cmluZyIsImxpbmVzIiwic3BsaXQiLCJkZXNpcmVkTGluZXMiLCJsaW5lIiwiaXNJbnRlcm5hbEZyYW1lIiwiaXNOb2RlRnJhbWUiLCJzdGFja0xpbmUiLCJnZXRGaWxlTmFtZUFuZExpbmVOdW1iZXIiLCJhdHRlbXB0MSIsImV4ZWMiLCJOdW1iZXIiLCJhdHRlbXB0MiIsImF0dGVtcHQzIiwiZmlsZU5hbWVBbmRMaW5lTnVtYmVyIiwiZmlsZU5hbWUiLCJsaW5lTnVtYmVyIiwicUVuZGluZ0xpbmUiLCJmaXJzdExpbmUiLCJkZXByZWNhdGUiLCJhbHRlcm5hdGl2ZSIsImNvbnNvbGUiLCJ3YXJuIiwiUHJvbWlzZSIsImlzUHJvbWlzZUFsaWtlIiwiY29lcmNlIiwiZnVsZmlsbCIsImxvbmdTdGFja1N1cHBvcnQiLCJlbnYiLCJRX0RFQlVHIiwibWVzc2FnZXMiLCJwcm9ncmVzc0xpc3RlbmVycyIsInJlc29sdmVkUHJvbWlzZSIsImRlZmVycmVkIiwicHJvbWlzZURpc3BhdGNoIiwib3AiLCJvcGVyYW5kcyIsIm5lYXJlclZhbHVlIiwibmVhcmVyIiwiaXNQcm9taXNlIiwiaW5zcGVjdCIsInN0YXRlIiwic3Vic3RyaW5nIiwiYmVjb21lIiwibmV3UHJvbWlzZSIsInJlYXNvbiIsInByb2dyZXNzIiwicHJvZ3Jlc3NMaXN0ZW5lciIsIm1ha2VOb2RlUmVzb2x2ZXIiLCJyZXNvbHZlciIsInJhY2UiLCJwYXNzQnlDb3B5IiwieCIsInkiLCJ0aGF0Iiwic3ByZWFkIiwiYW5zd2VyUHMiLCJtYWtlUHJvbWlzZSIsImRlc2NyaXB0b3IiLCJpbnNwZWN0ZWQiLCJmdWxmaWxsZWQiLCJyZWplY3RlZCIsInByb2dyZXNzZWQiLCJkb25lIiwiX2Z1bGZpbGxlZCIsIl9yZWplY3RlZCIsIm5ld0V4Y2VwdGlvbiIsIl9wcm9ncmVzc2VkIiwibmV3VmFsdWUiLCJ0aHJldyIsIm9uZXJyb3IiLCJmY2FsbCIsInRoZW5SZXNvbHZlIiwid2hlbiIsInRoZW5SZWplY3QiLCJpc1BlbmRpbmciLCJpc0Z1bGZpbGxlZCIsImlzUmVqZWN0ZWQiLCJ1bmhhbmRsZWRSZWFzb25zIiwidW5oYW5kbGVkUmVqZWN0aW9ucyIsInJlcG9ydGVkVW5oYW5kbGVkUmVqZWN0aW9ucyIsInRyYWNrVW5oYW5kbGVkUmVqZWN0aW9ucyIsInJlc2V0VW5oYW5kbGVkUmVqZWN0aW9ucyIsInRyYWNrUmVqZWN0aW9uIiwiZW1pdCIsInVudHJhY2tSZWplY3Rpb24iLCJhdCIsImF0UmVwb3J0Iiwic3BsaWNlIiwiZ2V0VW5oYW5kbGVkUmVhc29ucyIsInN0b3BVbmhhbmRsZWRSZWplY3Rpb25UcmFja2luZyIsInJlamVjdGlvbiIsInJocyIsIm1hc3RlciIsImRpc3BhdGNoIiwiYXN5bmMiLCJtYWtlR2VuZXJhdG9yIiwiY29udGludWVyIiwidmVyYiIsImFyZyIsIlN0b3BJdGVyYXRpb24iLCJnZW5lcmF0b3IiLCJlcnJiYWNrIiwic3Bhd24iLCJfcmV0dXJuIiwicHJvbWlzZWQiLCJkZWwiLCJtYXBwbHkiLCJwb3N0Iiwic2VuZCIsIm1jYWxsIiwiZmFwcGx5IiwiZmJpbmQiLCJmYm91bmQiLCJwcm9taXNlcyIsInBlbmRpbmdDb3VudCIsInNuYXBzaG90IiwicHJldiIsImN1cnJlbnQiLCJvbkZ1bGZpbGxlZCIsIm9uUmVqZWN0ZWQiLCJvblByb2dyZXNzIiwiYWxsUmVzb2x2ZWQiLCJhbGxTZXR0bGVkIiwicmVnYXJkbGVzcyIsImZpbiIsIm9uVW5oYW5kbGVkRXJyb3IiLCJtcyIsInRpbWVvdXRJZCIsImNvZGUiLCJuZmFwcGx5Iiwibm9kZUFyZ3MiLCJuZmNhbGwiLCJuZmJpbmQiLCJkZW5vZGVpZnkiLCJiYXNlQXJncyIsIm5iaW5kIiwibm1hcHBseSIsIm5wb3N0IiwibnNlbmQiLCJubWNhbGwiLCJuaW52b2tlIiwibm9kZWlmeSIsIm5vZGViYWNrIiwiU2NoZWR1bGVkVGFzayIsIlNjaGVkdWxlZFRhc2tUeXBlIiwiY29uZmlnIiwibG9nIiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwidXRpbHMiLCJzaGltIiwiZm4xIiwibWlsbGlzMSIsImZuIiwibWlsbGlzIiwic2NoZWR1bGVkVGltZSIsImtpbGwiLCJjYW5jZWwiLCJzY2hlZHVsZWRUYXNrcyIsInVybDEiLCJ0b2tlbiIsInVybCIsInhociIsImhlYWRlcnMiLCJBdXRob3JpemF0aW9uIiwicHV0IiwicGF0Y2giLCJzY2hlZHVsZU9uY2UiLCJsb29wIiwic2NoZWR1bGVFdmVyeSIsInNmbiIsIm1lZGlhdG9yIiwiWE1MSHR0cFJlcXVlc3QiLCJkZXNjIiwiZGVmaW5lUHJvcGVydHkiLCJvYnNlcnZhYmxlIiwicmlvdCIsImZhY3RvcnkiLCJYSFIiLCJkc3QiLCJsb3dlcmNhc2UiLCJzdHIiLCJ0b0xvd2VyQ2FzZSIsInBhcnNlSGVhZGVycyIsInBhcnNlZCIsInZhbCIsInN1YnN0ciIsInRyaW0iLCJoZWFkZXJzR2V0dGVyIiwiaGVhZGVyc09iaiIsInRyYW5zZm9ybURhdGEiLCJmbnMiLCJpc1N1Y2Nlc3MiLCJzdGF0dXMiLCJmb3JFYWNoU29ydGVkIiwiYnVpbGRVcmwiLCJwYXJhbXMiLCJwYXJ0cyIsInYiLCJKU09OIiwic3RyaW5naWZ5IiwiZW5jb2RlVVJJQ29tcG9uZW50IiwicmVxdWVzdENvbmZpZyIsInRyYW5zZm9ybVJlcXVlc3QiLCJ0cmFuc2Zvcm1SZXNwb25zZSIsIm1lcmdlSGVhZGVycyIsImRlZkhlYWRlcnMiLCJyZXFIZWFkZXJzIiwiZGVmSGVhZGVyTmFtZSIsImxvd2VyY2FzZURlZkhlYWRlck5hbWUiLCJyZXFIZWFkZXJOYW1lIiwiZXhlY0hlYWRlcnMiLCJoZWFkZXJGbiIsImhlYWRlciIsImhlYWRlckNvbnRlbnQiLCJjb21tb24iLCJ0b1VwcGVyQ2FzZSIsInNlcnZlclJlcXVlc3QiLCJyZXFEYXRhIiwid2l0aENyZWRlbnRpYWxzIiwic2VuZFJlcSIsInJlc3BvbnNlIiwiaW50ZXJjZXB0b3JzIiwicmVxdWVzdCIsInJlcXVlc3RFcnJvciIsImZhaWx1cmUiLCJyZXNwb25zZUVycm9yIiwiY29udGVudFR5cGVKc29uIiwicGFyc2UiLCJwZW5kaW5nUmVxdWVzdHMiLCJhYm9ydGVkIiwib3BlbiIsInNldFJlcXVlc3RIZWFkZXIiLCJvbnJlYWR5c3RhdGVjaGFuZ2UiLCJyZWFkeVN0YXRlIiwicmVzcG9uc2VIZWFkZXJzIiwiZ2V0QWxsUmVzcG9uc2VIZWFkZXJzIiwicmVzcG9uc2VUeXBlIiwicmVzcG9uc2VUZXh0Iiwib25wcm9ncmVzcyIsImFib3J0IiwidmVuZG9ycyIsInN1ZmZpeCIsInJhZiIsImNhZiIsInF1ZXVlIiwiZnJhbWVEdXJhdGlvbiIsIl9ub3ciLCJjcCIsImNhbmNlbGxlZCIsInJvdW5kIiwiaGFuZGxlIiwiZ2V0TmFub1NlY29uZHMiLCJocnRpbWUiLCJsb2FkVGltZSIsInBlcmZvcm1hbmNlIiwiaHIiLCJERUJVRyIsImRlYnVnIiwiaW5mbyIsIkV2ZW50cyIsIkxvYWRpbmciLCJMb2FkRGF0YSIsIkxvYWRFcnJvciIsIkxvYWREYXRhUGFydGlhbCIsIl9wb2xpY3kiLCJfdGFzayIsIl9tZWRpYXRvciIsIl9sb2FkIiwidHJpZ2dlciIsImVyciIsImV2ZW50TmFtZSIsImV2ZW50Iiwib24iLCJvbmUiLCJvZmYiLCJzaGlmdCIsImZvcm0iLCJWaWV3IiwiRm9ybVZpZXciLCJGb3JtVmlld0V2ZW50cyIsIklucHV0IiwiSW5wdXRDb25kaXRpb24iLCJJbnB1dENvbmZpZyIsIklucHV0VmlldyIsIklucHV0Vmlld0V2ZW50cyIsIlZhbGlkYXRvckNvbmRpdGlvbiIsImhlbHBlcnMiLCJwbGFjZWhvbGRlciIsImhpbnRzIiwibmFtZTEiLCJfZGVmYXVsdCIsInRhZyIsIm1vZGVsIiwidmFsaWRhdG9yIiwidGFnMSIsIm1vZGVsMSIsInZhbGlkYXRvcjEiLCJwcmVkaWNhdGUxIiwidmFsaWRhdG9yRm4xIiwidmFsaWRhdG9yRm4iLCJ0YWdOYW1lMSIsInRhZ05hbWUiLCJ0YWdMb29rdXAiLCJ2YWxpZGF0b3JMb29rdXAiLCJkZWZhdWx0VGFnTmFtZSIsImVycm9yVGFnIiwicmVnaXN0ZXJWYWxpZGF0b3IiLCJyZWdpc3RlclRhZyIsImRlbGV0ZVRhZyIsImxvb2t1cCIsInJlZiIsInJlc3VsdHMxIiwiZGVsZXRlVmFsaWRhdG9yIiwiaW5wdXRDZmdzIiwiaW5wdXRDZmciLCJpbnB1dHMiLCJ2YWxpZGF0b3JzIiwiZm91bmQiLCJsZW4yIiwicmVmMSIsInBhaXIiLCJTZXQiLCJDaGFuZ2UiLCJDbGVhckVycm9yIiwiZ2V0VmFsdWUiLCJlbCIsImVycm9ySHRtbCIsImluaXQiLCJodG1sIiwiY2xlYXJFcnJvciIsInVwZGF0ZSIsInNldEVycm9yIiwibWl4aW5zIiwiY2hhbmdlIiwidmlldyIsInRhcmdldCIsIm9icyIsImhhc0Vycm9yIiwianMiLCJvcHRzIiwibW91bnQiLCJTdWJtaXQiLCJTdWJtaXRGYWlsZWQiLCJpbnB1dENvbmZpZ3MiLCJmdWxseVZhbGlkYXRlZCIsIm9sZFZhbHVlIiwic3VibWl0IiwicHJldmVudERlZmF1bHQiLCJpbml0Rm9ybUdyb3VwIiwiY3NzIiwicGFyZW50UHJvdG8iLCJnZXRQcm90b3R5cGVPZiIsImZuMiIsImhhbmRsZXIiLCJvcHRzUCIsImN0eCIsImNyb3dkY29udHJvbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBQUEsSUFBSUEsTUFBSixDO0lBRUFBLE1BQUEsR0FBU0MsT0FBQSxD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