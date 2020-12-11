var mamook_handler = {
  QR : function(payload) {
     mamook_event({ "event" : "scanned" });
  },

  START : function(payload) {
    document.getElementById("controlarea").innerHTML = "<p>Please watch the video.</p><button id='skip'>SKIP</button>";
    document.getElementById("skip").onclick = function(evt) {
      document.getElementById("skip").disabled = true; mamook_event( { "event": "skip" } ); return true;
    };
  },

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
  }
};
