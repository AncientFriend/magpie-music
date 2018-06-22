export default class Queue {
  static instance = this.instance == null ? new Queue() : this.instance;

  static queue = [];

  addToQueue(value) {
    try {
      this.queue.push(value);
      return true;
    } catch (e) {
      console.log('ERROR - addToQueue', e);
      return false;
    }
  }

  getQueue() {
    try {
      return this.queue;
    } catch (e) {
      console.log('ERROR - getQueue', e);
      return false;
    }
  }

  deleteFromQueue(index) {
    try {
      this.queue.splice(index - 1, 1);
      return true;
    } catch (e) {
      console.log('ERROR - deleteFromQueue', e);
      return false;
    }
  }

  getNextTitle() {
    try {
      return this.queue.shift();
    } catch (e) {
      console.log('ERROR - getNextTitle', e);
      return false;
    }
  }

  clear() {
    try {
      this.queue.length = 0
      return true
    } catch (e) {
      console.log('ERROR - clear', e);
      return false
    }
  }

  isEmpty() {
    try {
      return this.queue.isEmpty()
    } catch (e) {
      console.log('ERROR - isEmpty', e);
      return false;
    }
  }

  addMultiple(titleArray) {
    try {
      titleArray.forEach(item) {
        this.queue.push(item)
      }
      return true
    } catch (e) {
      console.log('ERROR - addMultiple', e);
      return false;
    }

  }

  deleteMultiple(indexArray) {
    try {
      indexArray.forEach(index) {
        this.queue.slice(index - 1, 1)
      }
      return true
    } catch (e) {
      console.log('ERROR - deleteMultiple', e);
      return false;
    }
  }

  exportQueue() {
    try {
      return JSON.stringify(this.queue)
    } catch (e) {
      console.log('ERROR - exportQueue', e);
      return false;
    }
  }

  importQueue(queueJson) {
    try {
      this.queue = JSON.parse(queueJson)
      return true
    } catch (e) {
      console.log('ERROR - importQueue', e);
      return false;
    }
  }

}
