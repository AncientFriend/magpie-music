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

  this.dispatcher;

  Singleton.prototype.setDispatcher = (dispatcher) => {
    try {
      this.dispatcher = dispatcher;
      return true;
    } catch (e) {
      console.log('ERROR - setDispatcher', e);
      return false;
    }
  };

  Singleton.prototype.getDispatcher = () => {
    try {
      return this.dispatcher;
    } catch (e) {
      console.log('ERROR - setDispatcher', e);
      return false;
    }
  };

  Singleton.prototype.resume = () => {
    try {
      this.dispatcher.resume();
      return true;
    } catch (e) {
      console.log('ERROR - resume', e);
      return false;
    }
  };

  Singleton.prototype.end = () => {
    try {
      this.dispatcher.end();
      return true;
    } catch (e) {
      console.log('ERROR - destroy', e);
      return false;
    }
  };

  Singleton.prototype.end = () => {
    try {
      this.dispatcher.destroy();
      return true;
    } catch (e) {
      console.log('ERROR - end', e);
      return false;
    }
  };

  Singleton.prototype.getPaused = () => {
    try {
      return this.dispatcher ? this.dispatcher.paused : false;
    } catch (e) {
      console.log('ERROR - getPaused', e);
      return false;
    }
  };

  Singleton.prototype.pause = () => {
    try {
      this.dispatcher.pause();
    } catch (e) {
      console.log('ERROR - getPaused', e);
      return false;
    }
  };

  Singleton.prototype.resume = () => {
    try {
      this.dispatcher.resume();
    } catch (e) {
      console.log('ERROR - getPaused', e);
      return false;
    }
  };

  Singleton.prototype.getPlaying = () => {
    try {
      return this.dispatcher.playing;
    } catch (e) {
      return false;
    }
  };

  Singleton.prototype.on = (eventName, event) => {
    try {
      return this.dispatcher.on(eventName, event);
    } catch (e) {
      return false;
    }
  };

  return Singleton;
}());
