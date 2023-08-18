var isPromise = p => typeof(p) === 'object' && typeof(p.then) === 'function';

var interval = function(f, wait, times, done, clear) {
  done = done || (function(){});

  if (times === 0) {
    return;
  }

  if (clear == null) {
    var cleared = false;
    clear = function() {
      cleared = true;
    }
    clear.cleared = () => cleared;
  }

  if (clear.cleared()) {
    return;
  }

  var result = f();

  if (!isPromise(result)) {
    result = Promise.resolve();
  }

  result.then(() => {
    var nextTimes = times == null ? times : times - 1;
    setTimeout(() => interval(f, wait, nextTimes, done, clear), wait);
  });

  return clear;
};

module.exports = {
  isPromise: isPromise,
  interval: interval
}
