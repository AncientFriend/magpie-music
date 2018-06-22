export default class Dispatcher {
  static instance = this.instance == null ? new Dispatcher() : this.instance;

  static dispatcher;

  setDispatcher(dispatcher) {
    try {
      this.dispatcher = dispatcher;
      return true;
    } catch (e) {
      console.log('ERROR - setDispatcher', e);
      return false;
    }
  }

  resume() {
    try {
      this.dispatcher.resume()
      return true;
    } catch (e) {
      console.log('ERROR - resume', e);
      return false;
    }
  }

  destroy() {
    try {
      this.dispatcher.destroy()
      return true;
    } catch (e) {
      console.log('ERROR - destroy', e);
      return false;
    }
  }

  end() {
    try {
      this.dispatcher.end()
      return true;
    } catch (e) {
      console.log('ERROR - end', e);
      return false;
    }
  }


  getPaused() {
    try {
      return this.dispatcher.paused
    } catch (e) {
      console.log('ERROR - getPaused', e);
      return false;
    }
  }

  getPlaying() {
    try {
      return this.dispatcher.playing
    } catch (e) {
      return false;
    }
  }


  //TODO think how u do this
  // this.dispatcher.on('end', end => {
  //   try {
  //     if (queue.length === 0) {
  //       voiceChannel.leave();
  //       dispatcher = dispatcher.destroy;
  //       isRdy = true;
  //     } else {
  //       dispatcher = openConnection.playStream(Ytdl(queue.shift(), {filter: 'audioonly'}));
  //     }
  //   } catch (e) {
  //     console.log('ERROR - onEnd', e);
  //   } 
  // });

}
