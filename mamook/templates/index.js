var mamook_handler = {
  QR : function(payload) {
    var url = "{{ url_for('landing', _external='true') }}";
    var alternate = "{{ url_for('manual', _external='true') }}";
    var code = document.cookie.substr(document.cookie.indexOf('=') + 1);
    document.getElementById("workarea").innerHTML = "<p>Please scan the following QR code from your mobile device to begin:</p><div id='qrcode'></div><p>Alternatively, you can go to <a href='" + alternate + "'>" + alternate +"</a> and enter the code " + code + "</p>";
    new QRCode(document.getElementById("qrcode"), url + "?nonce=" + code);
  },

  START : function(payload) {
    document.getElementById("workarea").innerHTML = '<video id="video" width="320" height="240" muted="true"><source src="' + payload.video + '" type="video/mp4">Your browser does not support the video tag.</video>';
    // enabling audio will be a problem
    // https://stackoverflow.com/questions/49930680/how-to-handle-uncaught-in-promise-domexception-play-failed-because-the-use
    document.getElementById("video").play();
    document.getElementById("video").onended = function(){
      mamook_event({ 'event' : "finishedvideo" });
    }
  }
}

