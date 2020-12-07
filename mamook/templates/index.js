var DEBUG=true;
var mamook_handler = {
  QR : function(payload) {
    var url = "{{ url_for('landing', _external='true') }}";
    var alternate = "{{ url_for('manual', _external='true') }}";
    var code = document.cookie.substr(document.cookie.indexOf('=') + 1);
    document.getElementById("workarea").innerHTML = "<p>Please scan the following QR code from your mobile device to begin:</p><div id='qrcode'></div><p>Alternatively, you can go to <a href='" + alternate + "'>" + alternate +"</a> and enter the code " + code + "</p>";
    new QRCode(document.getElementById("qrcode"), url + "?nonce=" + code);
  },

  START : function(payload) {
    document.getElementById("workarea").innerHTML = '<video id="video" width="320" height="240" muted="true"><source src="' + payload.video + '" type="video/mp4">Your browser does not support the video tag.</video>' + (DEBUG?"<button id='skip'>Skip</button>":"");
   // enabling audio will be a problem
    // https://stackoverflow.com/questions/49930680/how-to-handle-uncaught-in-promise-domexception-play-failed-because-the-use
    document.getElementById("video").play();
    document.getElementById("video").onended = function(){
      mamook_event({ 'event' : "finishedvideo" });
    };
    if(DEBUG){
          document.getElementById("skip").onclick = document.getElementById("video").onended;
    }
  },

  CHOOSE_ARTIST : function(payload) {
    var html = '<h1>Please choose an artist to trade with</h1><ol>';
    for( var idx=0; idx<payload.artists.length; idx++){
        html += '<li>' + payload.artists[idx].name + ' <img src="' + payload.artists[idx].photo +'"></li>';
    }
    html += '</ol>';
    document.getElementById("workarea").innerHTML = html;
  },

  CHOOSE_ITEM : function(payload) {
    var html = '<h1>For artist ' + payload.artist.name + ' choose an item to trade for</h1><ol>';
    for( var idx=0; idx<payload.items.length; idx++){
        html += '<li>' + payload.items[idx].name + ' <img src="' + payload.items[idx].photo +'"><br/>' +
            payload.items[idx].description + '</li>';
    }
    html += '</ol>';
    document.getElementById("workarea").innerHTML = html;
  },
    
  REVIEW : function(payload) {
    document.getElementById("workarea").innerHTML = '<h1>Do you want to trade with artist ' + payload.artist.name +
          ' for item ' + payload.item.name +'?</h1>' +
          '<br/><img src="' + payload.item.photo + '"/>';
  },
    
  ASK_EXCHANGE : function(payload) {
    document.getElementById("workarea").innerHTML = '<video id="video" width="320" height="240" muted="true"><source src="' + payload.video + '" type="video/mp4">Your browser does not support the video tag.</video>';
    document.getElementById("video").play();
    document.getElementById("video").onended = function(){
      mamook_event({ 'event' : "finishedvideo" });
    };
  },

  GET_OFFER : function(payload) {
    document.getElementById("workarea").innerHTML = '<h1>What do you offer artist ' + payload.artist.name +
          ' in exchange for item ' + payload.item.name +'?</h1>' +
          '<br/><img src="' + payload.item.photo + '"/>';
  }
    
};
