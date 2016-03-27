"use strict";

var ClassProperties = require('./index');

console.log('Example One:')
console.log('----------------------------------\n');

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


console.log('\nExample Two:');
console.log('----------------------------------');

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

console.log(`Captain: ${enterprise.captain}`);
// LOG: James T.Kirk

enterprise.firePhotonTorpedoes();
// LOG: Its a direct hit!


console.log('\nExample Three:')
console.log('----------------------------------');

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
