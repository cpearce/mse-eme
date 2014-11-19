
function e(id) {
  return document.getElementById(id);
}

function log(msg) {
  var log_pane = e('log');
  log_pane.appendChild(document.createTextNode(msg));
  log_pane.appendChild(document.createElement("br"));
}

function bail(message)
{
  return function(err) {
    log(message + (err ? " " + err : ""));
  }
}

function ArrayBufferToString(arr)
{
  var str = '';
  var view = new Uint8Array(arr);
  for (var i = 0; i < view.length; i++) {
    str += String.fromCharCode(view[i]);
  }
  return str;
}

function StringToArrayBuffer(str)
{
  var arr = new ArrayBuffer(str.length);
  var view = new Uint8Array(arr);
  for (var i = 0; i < str.length; i++) {
    view[i] = str.charCodeAt(i);
  }
  return arr;
}

function Base64ToHex(str)
{
  var bin = window.atob(str.replace(/-/g, "+").replace(/_/g, "/"));
  var res = "";
  for (var i = 0; i < bin.length; i++) {
    res += ("0" + bin.charCodeAt(i).toString(16)).substr(-2);
  }
  return res;
}

function HexToBase64(hex)
{
  var bin = "";
  for (var i = 0; i < hex.length; i += 2) {
    bin += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  return window.btoa(bin).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function TimeStamp(token) {
  function pad(x) {
    return (x < 10) ? "0" + x : x;
  }
  var now = new Date();
  var ms = now.getMilliseconds();
  var time = "[" +
             pad(now.getHours()) + ":" +
             pad(now.getMinutes()) + ":" +
             pad(now.getSeconds()) + "." +
             ms +
             "]" +
             (ms < 10 ? "  " : (ms < 100 ? " " : ""));
  return token ? (time + " " + token) : time;
}

function Log(token, msg) {
  info(TimeStamp(token) + " " + msg);
}

function UpdateSessionFunc(name, keys) {
  return function(ev) {
    var msgStr = ArrayBufferToString(ev.message);
    var msg = JSON.parse(msgStr);

    log(name + " got message from CDM: " + msgStr);

    var outKeys = [];

    for (var i = 0; i < msg.kids.length; i++) {
      var id64 = msg.kids[i];
      var idHex = Base64ToHex(msg.kids[i]).toLowerCase();
      var key = keys[idHex];

      if (key) {
        log(name + " found key " + key + " for key id " + idHex);
        outKeys.push({
          "kty":"oct",
          "alg":"A128KW",
          "kid":id64,
          "k":HexToBase64(key)
        });
      } else {
        bail(name + " couldn't find key for key id " + idHex);
      }
    }

    var update = JSON.stringify({
      "keys" : outKeys,
      "type" : msg.type
    });
    log(name + " sending update message to CDM: " + update);

    ev.target.update(StringToArrayBuffer(update)).then(function() {
      log(name + " MediaKeySession update ok!");
    }, bail(name + " MediaKeySession update failed"));
  }
}

function KeysChange(event) {
  var session = event.target;
  session.getUsableKeyIds().then(function(keyIds) {
    for (var k = 0; k < keyIds.length; k++) {
      var kid = Base64ToHex(window.btoa(ArrayBufferToString(keyIds[k])));
      log("have key " + kid);
    }
  }, bail("Failed to get keyIds"));

}

function polyfillRequestMediaKeySystemAccess(keySystem, options) {
  return new Promise(function(resolve, reject) {
    if (!MediaKeys.isTypeSupported(keySystem)) {
      log("!MediaKeys.IsTypeSupported(), rejecting...");
      reject();
    }
    // An object that implements MediaKeySystemAccess's interface.
    resolve(
      {
        createMediaKeys : function() {
          return MediaKeys.create(keySystem);
        }
      });
    });
}

var ensurePromise;

function EnsureMediaKeysCreated(video, keySystem, options, encryptedEvent) {
  // We may already have a MediaKeys object if we initialized EME for a
  // different MSE SourceBuffer's "encrypted" event, or the initialization
  // may still be in progress.
  if (ensurePromise) {
    return ensurePromise;
  }

  var p;
  options.initDataType = encryptedEvent.initDataType;
  if (navigator.requestMediaKeySystemAccess) {
    p = navigator.requestMediaKeySystemAccess(keySystem, options);
  } else {
    // If mozilla bug 1095257 hasn't landed, we need to use the older
    // MediaKeys.isTypeSupported/create pattern.
    p = polyfillRequestMediaKeySystemAccess(keySystem, options);
  }

  ensurePromise = p
    .then(function(keySystemAccess) {
      return keySystemAccess.createMediaKeys();
    }, bail(name + " Failed to request key system access."))

    .then(function(mediaKeys) {
      log(name + " created MediaKeys object ok");
      return video.setMediaKeys(mediaKeys);
    }, bail(name + " failed to create MediaKeys object"))
}

function SetupEME(video, keySystem, name, keys, options)
{

  if (MediaKeys.isTypeSupported) {
    log("MediaKeys.isTypeSupported(" + keySystem + ")='" + MediaKeys.isTypeSupported(keySystem) + "'");
  } else {
    log("MediaKeys.isTypeSupported not defined, we'll use navigator.requestMediaKeySystemAccess");
  }

  video.addEventListener("encrypted", function(ev) {
    log(name + " got encrypted event");

    EnsureMediaKeysCreated(video, keySystem, options, ev)
      .then(function() {
        log(name + " ensured MediaKeys available on HTMLMediaElement");
        var session = video.mediaKeys.createSession();
        session.addEventListener("message", UpdateSessionFunc(name, keys));
        session.addEventListener("keyschange", KeysChange);
        return session.generateRequest(ev.initDataType, ev.initData);
      }, bail(name + " failed to ensure MediaKeys on HTMLMediaElement"))

      .then(function() {
        log(name + " generated request");
      }, bail(name + " Failed to generate request."));
  });
}
