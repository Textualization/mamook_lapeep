var mamook_handler = {
  QR : function(payload) {
     mamook_event({ "event" : "scanned" });
  },

  watchskip : function(payload) {
    document.getElementById("controlarea").innerHTML = "<p>Please watch the video.</p><button id='skip'>SKIP</button>";
    document.getElementById("skip").onclick = function(evt) {
      document.getElementById("skip").disabled = true; mamook_event( { "event": "skip" } ); return true;
    };
  },    

  START : function(payload) { this.watchskip(payload); },

  CHOOSE_ARTIST : function(payload) {
    var html = '<ol>';
    for( var idx=0; idx<payload.artists.length; idx++ ){
        html += '<li><button id="pick_' + idx + '">' + payload.artists[idx].name + '</button></li>';
    }
    html += '</ol>';
    document.getElementById("controlarea").innerHTML = html;
    function disableAll() {
        for( var idx=0; idx<payload.artists.length; idx++ ){
            document.getElementById("pick_" + idx).disabled = true;
        }
    }
    for( var idx=0; idx<payload.artists.length; idx++ ){
        const thisIdx = idx;          
        document.getElementById("pick_" + idx).onclick = function(evt) {
            disableAll(); mamook_event( { "event": "pick", "value" : thisIdx } ); return true;
        };
    }
  },
    
  CHOOSE_ITEM : function(payload) {
    var html = '<ol>';
    for( var idx=0; idx<payload.items.length; idx++ ){
        html += '<li><button id="pick_' + idx + '">' + payload.items[idx].name + '</button></li>';
    } 
    html += '<li><button id="goback">GO BACK</button></li>';
    html += '</ol>';
    document.getElementById("controlarea").innerHTML = html;
    function disableAll() {
        for( var idx=0; idx<payload.items.length; idx++ ){
            document.getElementById("pick_" + idx).disabled = true;
        }
        document.getElementById("goback").disabled = true;
    }
    for( var idx=0; idx<payload.items.length; idx++ ){
        const thisId = payload.items[idx].id;
        document.getElementById("pick_" + idx).onclick = function(evt) {
            disableAll(); mamook_event( { "event": "pick", "value" : thisId } ); return true;
        };
    } 
    document.getElementById("goback").onclick = function(evt) {
        disableAll(); mamook_event( { "event": "goback" } ); return true;
    };
  },
    
  REVIEW : function(payload) {
    var html = '<ol>';
    html += '<li><button id="confirm">YES</button></li>';
    html += '<li><button id="goback">GO BACK</button></li>';
    html += '</ol>';
    document.getElementById("controlarea").innerHTML = html;
    function disableAll() {
        document.getElementById("confirm").disabled = true;
        document.getElementById("goback").disabled = true;
    }
    document.getElementById("confirm").onclick = function(evt) {
        disableAll(); mamook_event( { "event": "confirm" } ); return true;
    };
    document.getElementById("goback").onclick = function(evt) {
        disableAll(); mamook_event( { "event": "goback" } ); return true;
    };
  },
    
  ASK_EXCHANGE : function(payload) {
    var html = '<p>Please watch the video.</p><ol>';
    html += '<li><button id="skip">SKIP</button></li>';
    html += '<li><button id="goback">GO BACK</button></li>';
    html += '</ol>';
    document.getElementById("controlarea").innerHTML = html;
    function disableAll() {
        document.getElementById("skip").disabled = true;
        document.getElementById("goback").disabled = true;
    }
    document.getElementById("goback").onclick = function(evt) {
        disableAll(); mamook_event( { "event": "goback" } ); return true;
    };
    document.getElementById("skip").onclick = function(evt) {
        disableAll(); mamook_event( { "event": "skip" } ); return true;
    };
  },
    
  GET_OFFER : function(payload) {
    var html = '<p>You offer: <input type"text" id="offered" name="offered"></input><br/>'+
        '<button id="offer">Make Offer</button><br/>'+
        '<button id="goback">GO BACK</button></p>';
    document.getElementById("controlarea").innerHTML = html;
    function disableAll() {
        document.getElementById("offer").disabled = true;
        document.getElementById("goback").disabled = true;
    }
    document.getElementById("offer").onclick = function(evt) {
        disableAll(); mamook_event( { "event": "offer", "value" : document.getElementById("offered").value } ); return true;
    };
    document.getElementById("goback").onclick = function(evt) {
        disableAll(); mamook_event( { "event": "goback" } ); return true;
    };
  },

  AI : function(payload){
    document.getElementById("controlarea").innerHTML = '<p>Please wait while the offer is assessed.</p>';
  },

  ACCEPTED : function(payload) { this.watchskip(payload); },

  REJECTED : function(payload) {
    var html = '<p>Please watch the video and retry. Or try these options:</p><ol>';
    html += '<li><button id="restart">RESTART</button></li>';
    html += '<li><button id="help">HELP</button></li>';
    html += '<li><button id="skip">SKIP</button></li>';
    html += '</ol>';
    document.getElementById("controlarea").innerHTML = html;
    function disableAll() {
        document.getElementById("skip").disabled = true;
        document.getElementById("restart").disabled = true;
        document.getElementById("help").disabled = true;
    }
    document.getElementById("restart").onclick = function(evt) {
        disableAll(); mamook_event( { "event": "restart" } ); return true;
    };
    document.getElementById("help").onclick = function(evt) {
        disableAll(); mamook_event( { "event": "help" } ); return true;
    };
    document.getElementById("skip").onclick = function(evt) {
        disableAll(); mamook_event( { "event": "skip" } ); return true;
    };
  },
  
  RETRY : function(payload) { this.watchskip(payload); },

  GET_OFFER2 : function(payload) { this.GET_OFFER(payload); },
  
  AI2 : function(payload) { this.AI(payload); },

  REJECTED2 : function(payload) { this.watchskip(payload); },

  GUIDED : function(payload) {
    var html = '<ol>';
    for( var idx=0; idx<payload.options.length; idx++ ){
        html += '<li><button id="pick_' + idx + '">' + idx + '</button></li>';
    }
    html += '</ol>';
    document.getElementById("controlarea").innerHTML = html;
    function disableAll() {
        for( var idx=0; idx<payload.artists.length; idx++ ){
            document.getElementById("pick_" + idx).disabled = true;
        }
    }
    for( var idx=0; idx<payload.artists.length; idx++ ){
        const thisIdx = idx;
        document.getElementById("pick_" + idx).onclick = function(evt) {
            disableAll(); mamook_event( { "event": "pick", "value" : thisIdx } ); return true;
        };
    }
  },

  COLLECT : function(payload) {
    var html = '<ol>';
    html += '<li><button id="now">NOW</button></li>';
    html += '<li><button id="later">LATER</button></li>';
    html += '</ol>';
    document.getElementById("controlarea").innerHTML = html;
    function disableAll() {
        document.getElementById("now").disabled = true;
        document.getElementById("later").disabled = true;
    }
    document.getElementById("now").onclick = function(evt) {
        disableAll(); mamook_event( { "event": "picknow" } ); return true;
    };
    document.getElementById("later").onclick = function(evt) {
        disableAll(); mamook_event( { "event": "picklater" } ); return true;
    };
  },
    
  NOW : function(payload) {
    if(!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)){
      document.getElementById("controlarea").innerHTML = '<p>Your device cannot record, we will take your word for it.</p>';
      //TODO enable file upload instead and leave the "picklater" as a button
      window.setTimeout(function() { mamook_event({ 'event' : "picklater" }); }, 2000);
    }else{
      
      // this code is adapted from https://github.com/webrtc/samples/blob/gh-pages/src/content/getusermedia/record/js/main.js

      document.getElementById("controlarea").innerHTML = '<video id="video" playsinline autoplay muted></video><video id="recorded" playsinline loop></video><div><button id="start">Start camera</button><button id="record" disabled>Start Recording</button><button id="play" disabled>Play</button><button id="upload" disabled>Upload</button></div>';

      let mediaRecorder;
      let recordedBlobs;

      const video         = document.getElementById("video");
      const recordedVideo = document.getElementById("recorded");
      const recordButton  = document.getElementById("record");
      const uploadButton  = document.getElementById("upload");
      const playButton    = document.getElementById("play");
      const startButton   = document.getElementById("start");

      function startRecording() {
        recordedBlobs = [];
        let options = {mimeType: 'video/webm;codecs=vp9,opus'};
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          console.error(`${options.mimeType} is not supported`);
          options = {mimeType: 'video/webm;codecs=vp8,opus'};
          if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            console.error(`${options.mimeType} is not supported`);
            options = {mimeType: 'video/webm'};
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
              console.error(`${options.mimeType} is not supported`);
              options = {mimeType: ''};
            }
          }
        }

        try {
          mediaRecorder = new MediaRecorder(window.stream, options);
        } catch (e) {
          console.error('Exception while creating MediaRecorder:', e);
          //errorMsgElement.innerHTML = `Exception while creating MediaRecorder: ${JSON.stringify(e)}`;
          return;
        }

        console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
        recordButton.textContent = 'Stop Recording';
        playButton.disabled = true;
        downloadButton.disabled = true;
        mediaRecorder.onstop = function(event) {
          console.log('Recorder stopped: ', event);
          console.log('Recorded Blobs: ', recordedBlobs);
        };
        mediaRecorder.ondataavailable = handleDataAvailable;
        mediaRecorder.start();
        console.log('MediaRecorder started', mediaRecorder);
      }

      function stopRecording() {
        mediaRecorder.stop();
      }

      function handleSuccess(stream) {
        recordButton.disabled = false;
        console.log('getUserMedia() got stream:', stream);
        window.stream   = stream;
        video.srcObject = stream;
      }

      async function init(constraints) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          handleSuccess(stream);
        } catch (e) {
          console.error('navigator.getUserMedia error:', e);
          //errorMsgElement.innerHTML = `navigator.getUserMedia error:${e.toString()}`;
        }
      }

      startButton.addEventListener('click', async () => {
        const constraints = {
          audio: true,
          video: {  width: { min: 320, max: 800 }, height: { min: 240, max: 600 } }
        };

        console.log('Using media constraints:', constraints);
        await init(constraints);
      });
      
      recordButton.onclick = function(evt) {
        if (recordButton.textContent === 'Start Recording') {
          startRecording();
        } else {
          stopRecording();
          recordButton.textContent = 'Start Recording';
          playButton.disabled   = false;
          uploadButton.disabled = false;
        }
      };
  
      playButton.onclick = function(evt) {
        const superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});
        recordedVideo.src = null;
        recordedVideo.srcObject = null;
        recordedVideo.src = window.URL.createObjectURL(superBuffer);
        recordedVideo.controls = true;
        recordedVideo.play();
      };
  
      uploadButton.onclick = function(evt) {
        const blob = new Blob(recordedBlobs, {type: 'video/webm'});

        $.ajax({
          type: 'POST',
          url: '{{ url_for("upload") }}',
          data: blob,
          contentType: 'video/webm',
          processData: false
        });
      };

      function handleDataAvailable(event) {
        if (event.data && event.data.size > 0) {
          recordedBlobs.push(event.data);
        }
      }
    }
  },
  
  LATER   : function(payload) { this.watchskip(payload); },
  
  DELIVER : function(payload) { this.watchskip(payload); },

  END     : function(payload) { this.watchskip(payload); }
  
};
