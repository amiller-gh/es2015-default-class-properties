"use strict";

var clone = require('./clone.js');
var Defaults = require('./index.js');
var assert = require('chai').assert;


suite('Deep Clone');

test('Deep Clone - Types', function(){
  var symbol = Symbol('test');
  var orig = {
    str: 'bar',
    num: 1,
    bool: true,
    date: new Date(),
    regexp: /asdf/,
    // symbol: symbol
  };
  var dup = clone(orig);
  assert.deepEqual(orig, dup, 'Deep clone works on all different types of data types');
})

test('Deep Clone - Objects', function() {
  var orig = {a: 1, obj: { b: 2, obj: { c: 2 }}};
  var dup = clone(orig);
  assert.deepEqual(orig, dup, 'Deep clone works on objects');
  assert.ok(orig.obj.b === dup.obj.b, 'Deep clone created new objects for each layer');
});

test('Deep Clone - Arrays', function() {
  var orig = [1, 2, 3, [4, 5, [6]]];
  var dup = clone(orig);
  assert.deepEqual(orig, dup, 'Deep clone works on arrays');
  assert.ok(orig[3] !== dup[3], 'Deep clone created new array for each layer');
  assert.ok(Array.isArray(dup[3]), 'Arrays are searalized as Array');
});

test('Deep Clone - Functions', function() {
  var func = function(){ return 1; }
  var orig = {func: func};
  var dup = clone(orig);
  assert.deepEqual(orig, dup, 'Deep clone works on objects with functions');
  assert.equal(orig.func(), dup.func(), 'Copied functions are still callable');
  assert.ok(dup.func === orig.func, 'Functions are kept the same');
});

test('Deep Clone - Getters and Setters', function() {
  var orig = {get getter(){return 1;}, set setter(val){ this._setter = val; }};
  var dup = clone(orig);
  assert.deepEqual(orig, dup, 'Deep clone works on objects containing getters and setters');
  assert.ok(typeof Object.getOwnPropertyDescriptor(dup, 'getter').get === 'function', 'Copied getters are still getters and not evaluated.');
  assert.ok(typeof Object.getOwnPropertyDescriptor(dup, 'setter').set === 'function', 'Copied setters are still setters and not evaluated.');
});

test('Deep Clone - Maps', function() {
  var map = new Map();
  map.set('test', 1);
  map.set('obj', {test: 1});
  var orig = {map: map};
  var dup = clone(orig);
  assert.deepEqual(orig, dup, 'Deep clone works on objects containing Maps');
  assert.equal(orig.map.get('test'), dup.map.get('test'), 'Copied Maps retain data');
  assert.ok(dup.map !== orig.map, 'Deep copies of Maps are made');
  // TODO: assert.ok(dup.map.get('obj') !== orig.map.get('obj'), "Deep copies of Maps' internals are made");
});


test('Deep Clone - Sets', function() {
  var set = new Set();
  set.add('test');
  set.add({test: 1});
  var orig = {set: set};
  var dup = clone(orig);
  assert.deepEqual(orig, dup, 'Deep clone works on objects containing Sets');
  assert.deepEqual(orig.set.entries(), dup.set.entries(), 'Copied Sets retain data');
  assert.ok(dup.set !== orig.set, 'Deep copies of Sets are made');
  // TODO: assert.ok([...dup.set][1] !== [...orig.set][1], "Deep copies of Set' internals are made");
});

test('Deep Clone - Cyclic Deps', function() {
  var orig = { a: {b: {}}};
  orig.a.b.a = orig.a;
  var dup = clone(orig);
  assert.deepEqual(orig, dup, 'Deep clone works on objects containing cyclic dependancies');
  assert.ok(orig !== dup, 'Deep clone makes a new instance');
  assert.ok(dup.a.b.a !== orig.a, 'Deep clone makes a new instance of the cyclic dependancy');
  assert.ok(dup.a.b.a === dup.a, 'Deep clone keeps cyclic dependnacies internal to the clone');

});


suite('Inheritance');

test('Direct Extension – Without Defaults', function() {

  class Base extends Defaults {
    constructor(data){
      super();
      for(var key in data){ this[key] = data[key]; }
    }
  	classMethod0(){};
  }

  var obj = new Base({biz: 0});

  assert.deepEqual(obj, {biz: 0}, 'Classes are able to extend Defaults without providing default properties.');
  assert.equal(Base.defaults, Defaults.defaults, 'Classes extending Defaults without providing default properties inherit the `defaults` method.');
  assert.ok(typeof obj.classMethod0 === 'function', 'Classes extending Defaults without providing default properties still inherit methods.');
});


test('Direct Extension – With Defaults', function() {

  class Base extends Defaults.defaults({
    foo: 'bar',
    biz: 'THIS GETS OVERWRITTEN'
  }) {
    constructor(data){
      super();
      for(var key in data){ this[key] = data[key]; }
    }
  	classMethod0(){};
  }

  var obj = new Base({biz: 'baz'});

  assert.deepEqual(obj, {biz: 'baz', foo: 'bar'}, 'Classes are able to extend Defaults and providing default properties.');
  assert.deepEqual(obj.biz, 'baz', 'Defaults are applied before constructors are run.');
  assert.equal(Base.defaults,  Defaults.defaults, 'Classes extending Defaults and providing default properties inherit the `defaults` method.');
  assert.ok(typeof obj.classMethod0 === 'function', 'Classes extending Defaults and providing default properties still inherit methods.');
});



test('Secondary Class Extension – Without Defaults', function() {

  class Base extends Defaults.defaults({
    foo: 0
  }) {
    constructor(data){
      super();
      for(var key in data){ this[key] = data[key]; }
    }
  	classMethod0(){};
  }

  class Child extends Base {
    classMethod1(){}
  }

  var obj = new Child({biz: 'baz'});

  assert.deepEqual(obj, {biz: 'baz', foo: 0}, 'Secondary Class Extension inherit its parent\'s default properties.');
  assert.equal(Child.defaults, Defaults.defaults, 'Secondary Class Extensions, without its own defaults, inherit the `defaults` method.');
  assert.ok(typeof obj.classMethod0 === 'function', "Secondary Class Extensions inherit its parent's methods.");
  assert.ok(typeof obj.classMethod1 === 'function', "Secondary Class Extensions have access to its own methods.");

});




test('Secondary Class Extension – With Defaults', function() {

  class Base extends Defaults.defaults({
    foo: 0
  }) {
    constructor(data){
      super();
      for(var key in data){ this[key] = data[key]; }
    }
  	classMethod0(){};
  }

  class Child extends Base.defaults({
    bar: 1
  }) {
    classMethod1(){}
  }

  var obj = new Child({biz: 'baz'});

  assert.deepEqual(obj, {biz: 'baz', foo: 0, bar: 1}, "Secondary Class Extension inherit its parent\'s default properties before applying its own.");
  assert.equal(Child.defaults, Defaults.defaults, 'Secondary Class Extensions, with its own defaults, inherit the `defaults` method.');
  assert.ok(typeof obj.classMethod0 === 'function', "Secondary Class Extensions inherit its parent's methods.");
  assert.ok(typeof obj.classMethod1 === 'function', "Secondary Class Extensions have access to its own methods.");

});


test('N+1 Class Extension', function() {

  class Base extends Defaults.defaults({
    foo: 0,
    bar: 0,
    biz: 0
  }) {
    constructor(data){
      super();
      for(var key in data){ this[key] = data[key]; }
    }
  	classMethod0(){};
  }


  class Child extends Base.defaults({
    foo: 1,
    bar: 1
  }) {
  	classMethod1(){};
  }

  class GrandChild extends Child.defaults({
    foo: 2
  }) {
    classMethod2(){}
  }

  var obj = new GrandChild({baz: 3});

  assert.deepEqual(obj, { baz: 3, foo: 2, bar: 1, biz: 0 }, "Secondary Class Extension inherit its parents' default properties before applying its own.");
  assert.equal(GrandChild.defaults, Defaults.defaults, 'Secondary Class Extensions, with its own defaults, inherit the `defaults` method.');
  assert.ok((typeof obj.classMethod0 === 'function' && typeof obj.classMethod1 === 'function'), "Secondary Class Extensions inherit its parents' methods.");
  assert.ok(typeof obj.classMethod2 === 'function', "Secondary Class Extensions have access to its own methods.");

});


test('Default Property Type Preservation', function() {

  class TypesTest extends Defaults.defaults({

    str: 'bar',
    num: 1,
    bool: true,
    date: new Date(),
    regexp: /asdf/,
    func(){
      return 1;
    },
    get getandset(){ return this.str; },
    set getandset(val){ return this.str = val; }

  }) {
    constructor(){
      super();
    }
  }

  var obj = new TypesTest();

  assert.equal(obj.str, 'bar', 'Strings can be passed as defaults.');
  assert.equal(obj.num, 1, 'Numbers can be passed as defaults.');
  assert.equal(obj.bool, true, 'Booleans can be passed as defaults.');
  assert.ok(obj.date instanceof Date, 'Date objects can be passed as defaults.');
  assert.ok(obj.regexp instanceof RegExp, 'Regular Expressions can be passed as defaults.');
  assert.equal(obj.getandset, 'bar', 'Getters can be passed as defaults.');
  assert.ok(typeof Object.getOwnPropertyDescriptor(obj, 'getandset').get === 'function', 'Getters are preserved as functions in defaults.');
  assert.ok(typeof Object.getOwnPropertyDescriptor(obj, 'getandset').set === 'function', 'Setters are preserved as functions in defaults.');

});



test('Deep Default Property Inheritance', function() {

  var values = {
    val: 'Initial',
    obj: {
      val: 'Initial'
    }
  };

  class Base extends Defaults.defaults({
    arr: [1, 2, 3, 4, 5],
    obj: {
      z: {
        y: {
          x: 1
        }
      }
    }
  }) { }

  class Child extends Base.defaults({
    arr: [],
    obj: {}
  }) { }

  class GrandChild extends Child.defaults({
    arr: [8, 7, 6, 5, 4, 3, 2, 1],
    obj: {
      a: {
        b: {
          c: 1
        }
      }
    }
  }) { }


  var instance = new Child();

  // Object Properties
  assert.deepEqual(instance.arr, [], "Overriding a parent's default array property replaces the object entirely, values inside aren't merged.");
  assert.deepEqual(instance.obj, {}, "Overriding a parent's default object property replaces the object entirely, values inside aren't merged.");

  var instance = new GrandChild();

  // Object Properties
  assert.deepEqual(instance.arr, [8, 7, 6, 5, 4, 3, 2, 1], "Overriding a parent's overridden array property replaces the object entirely, values inside aren't merged.");
  assert.deepEqual(instance.obj, { a: { b: { c: 1 } } }, "Overriding a parent's overridden object property replaces the object entirely, values inside aren't merged.");

});


test('Default Property Mutibility', function() {

  var values = {
    val: 'Initial',
    obj: {
      val: 'Initial'
    },
    get prop(){ return this.val; },
    set prop(val){ this.val = val; }
  };

  class MutibilityTest extends Defaults.defaults(values) { }

  var instance = new MutibilityTest();

  // Direct Properties
  values.val = "Modified-0";
  assert.equal(instance.val, 'Initial', "Modifying the original values object's direct properties DOES NOT modify instance defaults.");
  assert.equal((new MutibilityTest()).val, 'Modified-0', "Modifying the original values object's direct properties DOES modify subsequent instance defaults.");

  instance.val = "Modified-1";
  assert.equal(values.val, 'Modified-0', "Modifying the instance's direct properties values object DOES NOT modify the original value object.");

  // Nested Properties
  values.obj.val = "Modified-0";
  assert.equal(instance.obj.val, 'Initial', "Modifying the original values object's direct properties DOES NOT modify nested instance defaults.");
  assert.equal((new MutibilityTest()).obj.val, 'Modified-0', "Modifying the original values object's direct properties DOES modify subsequent instance defaults.");

  instance.obj.val = "Modified-1";
  assert.equal(values.obj.val, 'Modified-0', "Modifying the instance's nested properties values object DOES NOT modify the original value object's nested propertyies.");

});


test('Adding a Base Class', function() {

  class BaseClass {
    get foo(){
      return true;
    }
  }

  assert.ok(Defaults.extends(BaseClass).defaults === Defaults.defaults, 'Extended ClassProperties instances still have a `defaults` method');

  class BaseTest extends Defaults.extends(BaseClass).defaults({
    biz: 'baz'
  }) { }

  var instance = new BaseTest();

  // Inherited Properties
  assert.ok(BaseTest.defaults === Defaults.defaults, "Classes from an extended ClassProperties still have the `defaults` method");
  assert.ok(BaseTest.extends === undefined, "Classes from an extended ClassProperties do not have the `extends` method");
  assert.equal(instance.foo, true, "Instances inherit from BaseClass");
  assert.equal(instance.biz, 'baz', "Instances inherit default properties");

});
