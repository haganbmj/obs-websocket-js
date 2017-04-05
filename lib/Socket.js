var WebSocket = require('ws');
var EventEmitter = require('events');
var log = require('loglevel');

var DEFAULT_PORT = 4444;
var _socket;

function camelCaseKeys(obj) {
  obj = obj || {};
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      var camelCasedKey = key.replace( /-([a-z])/gi, function ( $0, $1 ) { return $1.toUpperCase(); } );
      obj[camelCasedKey] = obj[key];
    }
  }

  return obj;
}

class Socket extends EventEmitter {
  constructor(address = 'localhost', password = '') {
    super();
    this._connected = false;
    this._address = '';

    this.connect(address, password)
      .then(function() {
        log.info('Connection successful.');
      })
      .catch(function() {
        log.error('Connection failed.');
      });
  }

  connect(address) {
    address += address.indexOf(':') > 0 ? '' : ':' + DEFAULT_PORT;

    if (this._connected) {
      _socket.close();
      this._connected = false;
    }

    return new Promise((resolve, reject) => {
      log.info('Attempting to connect to:', address);
      _socket = new WebSocket('ws://' + address);

      _socket.onopen = () => {
        this._connected = true;
        this._address = address;
        resolve();
      };

      _socket.onclose = () => {
        log.info('Connection closed:', address);
        this._connected = false;
        this._address = false;
      };

      _socket.onerror = (evt) => {
        log.error('Connected failed.', evt.code);
        this._connected = false;
        this._address = false;
        reject(evt);
      };

      _socket.onmessage = (msg) => {
        var data = JSON.parse(msg.data);
        data = camelCaseKeys(data);
        log.debug('[Message]', data);

        // Emit the message with ID if available, otherwise default to a non-messageId driven event.
        if (data.messageId) {
          log.debug('[Socket]', 'EMIT:', 'obs:internal:message:id-' + data.messageId, data);
          this.emit('obs:internal:message:id-' + data.messageId, data);
        } else {
          log.debug('[Socket]', 'EMIT:', 'obs:internal:event', data);
          this.emit('obs:internal:event', data);
        }
      };
    });
  }

  /**
   * Close and disconnect the WebSocket connection.
   *
   * @function
   * @category request
   */
  disconnect() {
    log.debug('Disconnect requested.');
    _socket.close();
  }

  send(messageId, args) {
    log.debug('[Request]', 'Args:', args);
    _socket.send(JSON.stringify(args));
  }
}

module.exports = Socket;
