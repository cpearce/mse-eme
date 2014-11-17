function MSELoadTrack(fragments, type, mediaSource, name, progressCallback) {
  return new Promise(function(resolve, reject) {
    var sourceBuffer;
    var curFragment = 0;

    function addNextFragment() {
      //log(name + " mediaSource.readyState=" + mediaSource.readyState);
      if (mediaSource.readyState == "closed") {
        return;
      }
      if (curFragment >= fragments.length) {
        //log(name + " addNextFragment() end of stream");
        resolve();
        progressCallback(100);
        return;
      }

      var fragmentFile = fragments[curFragment++];

      var req = new XMLHttpRequest();
      req.open("GET", fragmentFile);
      req.responseType = "arraybuffer";

      req.addEventListener("load", function() {
        //log(name + " fetch of " + fragmentFile + " complete, appending");
        progressCallback(Math.round(curFragment / fragments.length * 100));
        sourceBuffer.appendBuffer(new Uint8Array(req.response));
      });

      req.addEventListener("error", function(){log(name + " error fetching " + fragmentFile); reject();});
      req.addEventListener("abort", function(){log(name + " aborted fetching " + fragmentFile);  reject();});

      //log(name + " addNextFragment() fetching next fragment " + fragmentFile);
      req.send(null);
    }

    sourceBuffer = mediaSource.addSourceBuffer(type);
    sourceBuffer.addEventListener("updateend", addNextFragment);
    addNextFragment();

  });
}
