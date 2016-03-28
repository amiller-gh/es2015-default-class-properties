# ES2015 Default Class Properties
### Add inheritable default properties to your es2015 classes!

It is notoriously difficult to add static properties to an ES2015 javascript class definition, and many frameworks and users have been struggling to adapt to the new standard. For more context on the problem, and for other proposed solutions, please read Ben McCormick's wonderful blog post on the issue: [http://benmccormick.org/2015/07/06/backbone-and-es6-classes-revisited/](http://benmccormick.org/2015/07/06/backbone-and-es6-classes-revisited/)

In leu of a syntactically beautiful way to easily do this with vanilla JS classes, and new JavaScript features (decorators & class properties) at least two to three years away from approval and implementation in browsers, I created __es2015-default-class-properties__.

Inherit from this base class and make sure every instance created has the same default values set on it before any constructors run. The default properties are deeply cloned and placed directly on each instance, not the prototype, so nothing is shared between them. Sub-classes inherit their parents' default properties and are able to declare their own.

This works [wherever ES2015 classes are supported](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes), including Node, and can be easily transpiled for ES5 support. Once the final decorators spec lands this can be easily ported while retaining backwards compatability.

## How to Use
1) Install __es2015-default-class-properties__:
```bash
$ npm install --save es2015-default-class-properties
```

2) Import it at the top of any js file that creates a class.
```javascript
import ClassProperties from "es2015-default-class-properties";
```
3) Extend any class with `ClassProperties` to help define default properties on it and all of its sub classes.
```javascript
class Model extends ClassProperties { }
```

## API
`ClassProperties` exposes just two static class methods that let you easily define default properties on your classes.

#### ClassProperties.defaults
Pass a single object with the properties you want defined on every instance of this class and its derived sub classes. Every sub-class of `ClassProperties` will also have the `defaults` method on it. You are not required to call `defaults` when extending, its entirely optional!

Defaults are inherited from parent classes and can be overridden by sub-classes. They are all applied directly to the instance, they are not on the prototype. Objects passes as defaults are deeply cloned, so no two instances ever share an object reference!

It is important to note however, that __objects passed as defaults are cloned, but not merged__. If a parent and child both define a default of the same name, the child class' default will take replace the parent's.

Feel free to run `example.js` to see this example in action:
```javascript

class Root extends ClassProperties.defaults({
  layer: 0,
  root: true,
  obj: {foo: 'bar'}
}) {
  // Define any methods, getters and setters here
}

// Calling `defaults` is entirely optional!
class Child extends Root {
  constructor(){
    super()
    // Defaults are set on the instance before constructors have access to `this`
    this.layer = 1;
    this.child = true;
  }
  // Define any methods, getters and setters here
}

// Any sub-class of `ClassProperties` also has the `defaults` method
class GrandChild extends Child.defaults({
  layer: 2,
  grandchild: true,
  obj: {biz: 'baz'}
}) {
  // Define any methods, getters and setters here
}

console.log(new Root());
// LOG: Root {layer: 0, root: true, obj: {foo: 'bar'}}

console.log(new Child());
// LOG: Child {layer: 1, root: true, child: true, obj: {foo: 'bar'}}

console.log(new GrandChild());
// LOG: GrandChild {layer: 2, root: true, child: true, grandchild: true, obj: {biz: 'baz'}}

```

#### ClassProperties.extends
If you don't want, or aren't able, to have `ClassProperties` be the base class of your inheritance chain, you can call `ClassProperties.extend` and provide `ClassProperties` a class that it will inherit from. Everything operate the same was as the original `ClassProperties`, but with all the added functionality of your new base class. Feel free to provide defaults after calling `extends` if you so wish.

Feel free to run `example.js` to see this example in action:
```javascript
class StarShip {
  firePhotonTorpedoes(){
    console.log('Its a direct hit!');
  }
}

class Enterprise extends ClassProperties.extends(StarShip).defaults({
  captain: 'James T. Kirk'
}) {

}

const enterprise = new Enterprise();

console.log(enterprise.captain)
// LOG: James T.Kirk

enterprise.firePhotonTorpedoes();
// LOG: Its a direct hit!
```

## One More Example
Something a little more complex to show off the features of ClassProperties. Feel free to run `example.js` to see this in action:

```javascript
import ClassProperties from "es2015-default-class-properties";

class Model extends ClassProperties {
  // All objects that inherit Model can accept instance specific properties.
  // Any default properties are assigned to the instance before child classes have access to `this`.
  constructor(data){
    super();
    Object.assign(this, data);
  }
}

// Lets Create a Normal Person class that has some sensible default properties set. How boring!
class NormalPerson extends Model.defaults({
  type: 'Boring...',
  firstName: 'Joe',
  middleName: '',
  lastName: 'Schmo'
}){

  get fullName(){
    return `${this.firstName} ${this.lastName}`;
  }

}

// Pokemon Trainers are just like Normal People, but more awesome!
class PokemonTrainer extends NormalPerson.defaults({
  type: 'Awesome!',
  pokemon: []
}){

  get fullName(){
    return `Pokemon Trainer ${this.firstName} ${this.lastName}`;
  }

  catch(mon){
    console.log(`${this.fullName} caught a ${mon}!`);
    this.pokemon.push(mon)
  };

}

// Lets make our population and see what they are like.
var person = new NormalPerson();
var trainer1 = new PokemonTrainer({firstName: 'Adam', lastName: 'Miller'});
var trainer2 = new PokemonTrainer({firstName: 'Trevor', lastName: 'Fayle'});

// Like I said, Regular People are boring.
console.log(`Regular person ${person.fullName} is ${person.type}`);

// Pokemon Trainers are awesome! Even when they don't have any Pokemon
console.log(`Pokemon Trainer ${trainer1.fullName} is ${trainer1.type}`);
console.log(`Pokemon Trainer ${trainer1.fullName} has ${trainer1.pokemon.length} Pokemon`);
console.log(`Pokemon Trainer ${trainer2.fullName} has ${trainer2.pokemon.length} Pokemon`);

// Default properties are deeply cloned to each instance! They aren't
// on the prototype and multiple instances never share a data object.
// If they didn't, Trevor and Adam here would have to share every
// Pokemon they caught – we can't have that, now can we?
trainer1.catch('Blazakin');
console.log(`Pokemon Trainer ${trainer1.fullName} has ${trainer1.pokemon.length} Pokemon`);
console.log(`Pokemon Trainer ${trainer2.fullName} has ${trainer2.pokemon.length} Pokemon`);

```

