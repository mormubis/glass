import {Namespace} from './utils/namespace';

const metadata = Symbol('metadata');

function accessor(target) {
  if (target[metadata] === undefined) { target[metadata] = new Namespace(); }

  return target[metadata];
}

function dataset(component) {
  const metadata = accessor(component);

  return Object.assign({}, metadata, {
    get(key) {
      let results = metadata.get(key);

      for (
        let proto = component.prototype;
        proto !== undefined;
        proto = proto.prototype
      ) {
        results = Object.assign({}, accessor(proto).get(key), results);
      }

      return results;
    }
  });
}

const $ReflectionBehavior = {
  dataset(component) {
    return dataset(component);
  },

  get() {
    return Reflect.get(...arguments);
  },

  getPrototypeOf(component) {
    return new Reflection(Reflect.getPrototypeOf(component));
  }
};

const $Reflection = Object.assign({}, Reflect, $ReflectionBehavior);

const fluentKeys = [
  'apply',
  'defineProperty',
  'deleteProperty',
  'set',
  'setPrototypeOf'
];
const ReflectionHandler = {
  get(target, key) {
    if (key in $Reflection) { return $Reflection[key].bind(undefined, target); }

    if (key in fluentKeys) {
      return function() {
        Reflect[key](...arguments);
        return target;
      };
    }

    return undefined;
  }
};

export const Reflection = new Proxy(class {}, {
  construct(ignore, [component]) {
    return new Proxy(component, ReflectionHandler);
  }
});
