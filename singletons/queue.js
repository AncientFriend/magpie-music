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

  this.queue = [];

  Singleton.prototype.addToQueue = (value) => {
    try {
      this.queue.push(value);
      return true;
    } catch (e) {
      console.log('ERROR - addToQueue', e);
      return false;
    }
  };

  Singleton.prototype.getQueue = () => {
    try {
      return this.queue;
    } catch (e) {
      console.log('ERROR - getQueue', e);
      return false;
    }
  };

  Singleton.prototype.deleteFromQueue = (index) => {
    try {
      this.queue.splice(index - 1, 1);
      return true;
    } catch (e) {
      console.log('ERROR - deleteFromQueue', e);
      return false;
    }
  };

  Singleton.prototype.getNextTitle = () => {
    try {
      return this.queue.shift();
    } catch (e) {
      console.log('ERROR - getNextTitle', e);
      return false;
    }
  };

  Singleton.prototype.clear = () => {
    try {
      this.queue.length = 0;
      return true;
    } catch (e) {
      console.log('ERROR - clear', e);
      return false;
    }
  };

  Singleton.prototype.isEmpty = () => {
    try {
      console.warn('returning:', this.queue.length < 1, this.queue.length);
      return this.queue.length < 1;
    } catch (e) {
      console.log('ERROR - isEmpty', e);
      return false;
    }
  };

  Singleton.prototype.addMultiple = (titleArray) => {
    try {
      titleArray.forEach(item => {
        this.queue.push(item);
      });
      return true;
    } catch (e) {
      console.log('ERROR - addMultiple', e);
      return false;
    }
  };

  Singleton.prototype.deleteMultiple = (indexArray) => {
    try {
      indexArray.forEach(index => {
        this.queue.slice(index - 1, 1);
      });
      return true;
    } catch (e) {
      console.log('ERROR - deleteMultiple', e);
      return false;
    }
  };

  Singleton.prototype.exportQueue = () => {
    try {
      return JSON.stringify(this.queue);
    } catch (e) {
      console.log('ERROR - exportQueue', e);
      return false;
    }
  };

  Singleton.prototype.importQueue = (queueJson) => {
    try {
      this.queue = JSON.parse(queueJson);
      return true;
    } catch (e) {
      console.log('ERROR - importQueue', e);
      return false;
    }
  };

  return Singleton;
}());
