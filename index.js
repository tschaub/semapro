function create(limit) {
  const queue = [];
  let pending = 0;

  function process() {
    if (queue.length === 0) {
      return;
    }

    ++pending;
    const item = queue.shift();
    item
      .work()
      .then(function (result) {
        --pending;
        item.resolve(result);
        process();
      })
      .catch(function (error) {
        --pending;
        item.reject(error);
        process();
      });
  }

  return function (work) {
    return new Promise(function (resolve, reject) {
      queue.push({work: work, resolve: resolve, reject: reject});
      if (pending < limit) {
        process();
      }
    });
  };
}

module.exports = create;
