/*
 * Copyright 2014, Mozilla Foundation and contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
