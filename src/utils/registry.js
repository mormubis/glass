export class Registry {
  constructor() {
    this.store = {};
  }

  get(key) {
    return this.store[key];
  }

  has(key) {
    return this.get(key) !== undefined;
  }

  remove(key) {
    delete this.store[key];
  }

  set(key, value) {
    this.store[key] = value;
  }
}
