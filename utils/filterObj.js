export const filterObj = (obj, fn) =>
  Object.fromEntries(
    Object.entries(obj).filter(([key, value]) => fn(key, value))
  );
