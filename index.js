"use strict";

// A deep cloning utility to give us smart deep clones.
var clone = require('./clone');

// Use a Symbol to store default properties on prototypes so we are the only code
// that has access to a prototype's default properties
const DEFAULTS = Symbol('Defaults');
const APPLY_DEFAULTS = Symbol('Apply Defaults');

function constructor(){
  var data = this[DEFAULTS]();
  for(let key in data){
    if(!data.hasOwnProperty(key)){ continue; }
    Object.defineProperty(this, key, Object.getOwnPropertyDescriptor(data, key))
  }
}

class ClassProperties {

  // Constructor functionality has been put in a static method so we can share
  // it with child classes made in `extend`. See below.
  constructor(){
    this.constructor[APPLY_DEFAULTS].apply(this, arguments)
  };

  // On the root object in the prototype chain, return a new empty object. By
  // returning a new object, each time, and populating it on the way up the
  // prototype chain (see below), we keep the defaults object passed to the
  // defaults method at any layer is kept clean.
  [DEFAULTS](){ return {}; };

  // Gets this instance's default properties and copy all of them to our instance.
  // This runs as the base constructor for every class that inherits from us – aka,
  // it will always run before any sub-class's constructor methods. This ensures that
  // by the time any layer sees the `this` object, it will already be seeded with
  // default values.
  static [APPLY_DEFAULTS](){
    var data = this[DEFAULTS]();
    for(let key in data){
      if(!data.hasOwnProperty(key)){ continue; }
      Object.defineProperty(this, key, Object.getOwnPropertyDescriptor(data, key))
    }
  };

  // When the `defaults` method is called on a class, return a new class that extends
  // `this` (the class in question) and add a getter that recursively fetches the
  // `super`'s default properties and mixes them in with this layer's defaults.
  // This returns the inherited unique default attributes that should be set on any
  // class derived from this base class.
  static defaults(defaults){
    defaults || (defaults = {}); // TODO: Node doesn't yet support default arguments
    return class DefaultsProxy extends this {
      [DEFAULTS](){
        var newDefaults = clone(defaults), obj = super[DEFAULTS]();
        for(let key in newDefaults){
          if(!newDefaults.hasOwnProperty(key)){ continue; }
          Object.defineProperty(obj, key, Object.getOwnPropertyDescriptor(newDefaults, key));
        }
        return obj;
      }
    }
  };

  // If you don't want, or aren't able, to have ClassProperties be the base class
  // of your inheritance chain, you can call `ClassProperties.extend` and pass it
  // a base class that it should inherit from. It will operate the same was as
  // the original ClassProperties, but with all the functionality of your extra class.
  static extends(BaseClass){
    class ClassPropertiesProxy extends BaseClass {
      constructor(){
        super(...arguments);
        this.constructor[APPLY_DEFAULTS].apply(this, arguments)
      };
      [DEFAULTS](){ return {}; };
    };
    ClassPropertiesProxy.defaults = ClassProperties.defaults;
    ClassPropertiesProxy[APPLY_DEFAULTS] = ClassProperties[APPLY_DEFAULTS];
    return ClassPropertiesProxy;
  }
}

module.exports = ClassProperties; // TODO: Node doesn't yet support ES2015 modules