module.exports = (function () {
  let instance; // prevent modification of "instance" variable
  function Singleton () {
    if (instance) {
      return instance;
    }
    instance = this;
        // Singleton initialization code
  }
    // instance accessor
  Singleton.getInstance = () => {
    return instance || new Singleton();
  };

  // TODO check if cache is valid format
  Singleton.prototype.setCache = (cache) => {
    console.log('2');
    try {
      this.cache = cache;
      return true;
    } catch (e) {
      console.log('ERROR - setCache', e);
      return false;
    }
  };

  Singleton.prototype.getCache = () => {
    try {
      return this.cache;
    } catch (e) {
      console.log('ERROR - setCache', e);
      return false;
    }
  };

  Singleton.prototype.isEmpty = () => {
    try {
      return this.cache.length > 0;
    } catch (e) {
      console.log('ERROR - isEmpty', e);
    }
  };

  Singleton.prototype.clearCache = () => {
    try {
      this.cache.length = 0;
      return true;
    } catch (e) {
      console.log('ERROR - clearCache', e);
      return false;
    }
  };

  return Singleton;
}());
