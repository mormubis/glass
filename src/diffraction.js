import {Refraction} from './refraction';

const $DiffractionBehavior = {
  define(target, id, executor) {
    target.dataset.set(`diffractions.${id}`, executor(target));

    return target;
  }
};

const DiffractionHandler = {
  get(target, key) {
    if (key in $DiffractionBehavior) {
      return $DiffractionBehavior[key].bind(undefined, target);
    }

    if (target.dataset.has(`diffractions.${key}`)) {
      return target.dataset.get(`diffrations.${key}`);
    }

    if (key === 'dataset') { return target.dataset; }

    return undefined;
  }
};

export const Diffraction = new Proxy(class {}, {
  construct(ignore, [component]) {
    return new Proxy(new Refraction(component), DiffractionHandler);
  }
});
