var mamook_handler = {
  QR : function(payload) {
     mamook_event({ "event" : "scanned" });
  },

  START : function(payload) {
     document.getElementById("workarea").innerHTML = "<p>Please watch the video.</p>";
  },

  CHOOSE_ARTIST : function(payload) {
    var html = '<ol>';
    for( var idx=0; idx<payload.artists.length; idx++){
        html += '<li><button onclick="mamook_event({\'event\': \'pick\', \'value\' : ' + idx + '}); return true;">' + payload.artists[idx].name + '</button></li>';
    }
    html += '</ol>';
    document.getElementById("workarea").innerHTML = html;
  }
    
};
