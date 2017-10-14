export function Property(refraction) {
  return function(property) {
    refraction.dataset.set(`properties.${property.name}`, property.default);

  };
}
