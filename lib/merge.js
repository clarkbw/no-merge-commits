module.exports = ({ parents }) => {
  const isMerge = parents && parents.length > 1;
  return isMerge;
};
