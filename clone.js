"use strict";

  // Constants
const VALUE = 'value',
      CLONE = {'Date': 1, 'RegExp': 1, 'Map': 1, 'Set': 1, 'WeakMap': 1, 'WeakSet': 1},
      CLONED = Symbol('Cloned'),
      O = Object;


  // Cross browser method shims
var gOPS     = O.getOwnPropertySymbols || function (o) { return []; },
    ownKeys  = (typeof Reflect !== typeof oK) && Reflect.ownKeys || function (o) { return gOPS(o).concat(O.getOwnPropertyNames(o)); },

  // Used to avoid recursions in deep copy
    clones   = [];

// Given a property descriptor, create a deep copy of its value if we need to.
module.exports = function clone(source) {

  // If the source is an object, we should clone it
  if(source !== null && typeof source === 'object'){

    // If we've already seen this object in the data tree (cyclic dependancy), return its saved clone
    if(source.hasOwnProperty(CLONED)){ return clones[source[CLONED]]; }

    // Otherwise, mark as known, clone, and copy all properties over
    // Create a new object using the same constructor. Use the original value if needed.
    var C = source.constructor;
    var copy = clones[(source[CLONED] = clones.length)] = (CLONE[C.name] ? new C(source) : new C());
    var keys = ownKeys(source);

    // For each key on the source, copy the property over – if we can
    // Be sure to try and clone each value as we come across it. Yay recursion!
    for (let i = keys.length; i--;) {
      let key = keys[i],
          descriptor = O.getOwnPropertyDescriptor(source, key),
          tdescriptor = O.getOwnPropertyDescriptor(copy, key) || {};
      if (VALUE in descriptor){ descriptor[VALUE] = clone(descriptor[VALUE]); }
      if(tdescriptor.writable === false || tdescriptor.configurable === false){ continue; }
      O.defineProperty(copy, key, descriptor);
    }

    // Clean up
    delete clones[source[CLONED]];
    delete source[CLONED];

    // Return our clone
    return copy
  }

  // If we're not cloning, just return the value
  return source;
}
