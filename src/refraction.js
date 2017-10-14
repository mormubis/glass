import {Reflection} from './reflection';

const hidden = Symbol('hidden');

function aspect(reflection, Aspect) {
  const prototype = Aspect.prototype;

  Object
    .keys(prototype)
    .forEach(function(key) {
      if (!reflection.get(key).advisable) {
        const handler = reflection.get(key);
        const advisor = function() {
          reflection.get(key).before.forEach(value => value(...arguments));
          handler(...arguments);
          reflection.get(key).after.forEach(value => value(...arguments));

          reflection.get(key)
            .around
            .forEach(value => value(handler, ...arguments));
        };

        advisor.before = [];
        advisor.after = [];
        advisor.around = [];
        advisor.advisable = true;

        reflection.set(key, advisor);
      }

      reflection.get(key)[Aspect[key] || 'after'].push(prototype[key]);
    });

  reflection.dataset.set(`aspects.${Aspect.name}`, Aspect);

  return reflection;
}

aspect.static = function(reflection, Aspect) {
  return aspect(reflection.getPrototypeOf(), Aspect);
};

function behavior(reflection, Behavior) {
  const prototype = Behavior.prototype;

  Object.keys(prototype).forEach(key => reflection.set(key, prototype[key]));

  reflection.dataset.set(`behavior.${Behavior.name}`, Behavior);

  return reflection;
}

behavior.static = function(reflection, Behavior) {
  class base extends reflection[hidden] {}

  Object.assign(base.prototype, Behavior.prototype);

  reflection.dataset.set(`behavior.${Behavior.name}`, Behavior);

  return new Reflection(base);
};

function role(reflection, Role) {
  class Aspect {
    disconnectedCallback() {
      reflection.dataset.get(`roles.${Role.name}`).disconnect();
    }
  }

  reflection.dataset.set(`roles.${Role.name}`, new Role(reflection[hidden]));

  aspect(reflection, Aspect);
}

role.static = function(reflection, Role) {
  class Aspect {
    static get constructor() { return 'before'; }

    constructor() {
      reflection.dataset.set(`roles.${Role.name}`, new Role(this));
    }

    disconnectedCallback() {
      reflection.dataset.get(`roles.${Role.name}`).disconnect();
    }
  }

  aspect.static(reflection, Aspect);
};

const ExtensionTypes = {aspect, behavior, role};

const RefractionHandler = {
  get(target, key) {
    const isInstance = !target.has('name');
    const type = ExtensionTypes[key];
    const handler = isInstance ? type : type.static;

    if (type !== undefined) {
      return function(extension) {
        target.dataset.set(`${type}.${extension.name}`, extension);
        return new Refraction(handler.call(undefined, target, extension));
      };
    }

    if (key === 'dataset') { return target.dataset; }

    return undefined;
  }
};

export const Refraction = new Proxy(class {}, {
  construct(ignore, [component]) {
    const reflection = new Reflection(component);

    reflection[hidden] = component;

    return new Proxy(reflection, RefractionHandler);
  }
});
