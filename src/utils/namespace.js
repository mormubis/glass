import {Registry} from './registry';

const DOT = '.';

export class Namespace extends Registry {
  get(key) {
    key = key.split(DOT).filter(value => value != false);

    return key.reduce(function(result, value) {
      if (result[value] === undefined) {
        result[value] = {};
      }

      return result[value];
    }, this.store);
  }

  remove(key) {
    let nodes = key.split(DOT);

    delete this.get(this.constructor.parent(key))[nodes.pop()];
  }

  set(key, value) {
    let nodes = key.split(DOT);

    this.get(this.constructor.parent(key))[nodes.pop()] = value;
  }

  static parent(key) {
    let nodes = key.split(DOT);

    return nodes.slice(0, -1).join(DOT);
  }
}
