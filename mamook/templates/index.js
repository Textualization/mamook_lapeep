var mamook_handler = {
  showvideo : function(payload) {
    document.getElementById("video").src = payload.video;
    document.getElementById("workarea").innerHTML = "";
    document.getElementById("videoarea").style.display = 'block';
    document.getElementById("video").play();
    document.getElementById("video").onended = function(){
      mamook_event({ 'event' : "finishedvideo" });
    };
  },
  
  QR : function(payload) {
    document.getElementById("videoarea").style.display = 'none';
    document.getElementById("video").pause();
    var url = "{{ url_for('landing', _external='true') }}";
    var alternate = "{{ url_for('manual', _external='true') }}";
    var code = document.cookie.substr(document.cookie.indexOf('=') + 1);
    document.getElementById("workarea").innerHTML = "<p>Please scan the following QR code from your mobile device to begin:</p>" +
      "<div id='qrcode'></div>" +
      "<p>Alternatively, you can go to <a href='" + alternate + "'>" + alternate +"</a> and enter the code " + code + "</p>";
    new QRCode(document.getElementById("qrcode"), url + "?nonce=" + code);
  },

  START : function(payload) { this.showvideo(payload); },

  CHOOSE_ARTIST : function(payload) {
    document.getElementById("videoarea").style.display = 'none';
    document.getElementById("video").pause();
    var html = '<h1>Please choose an artist to trade with</h1><ol>';
    for( var idx=0; idx<payload.artists.length; idx++){
        html += '<li>' + payload.artists[idx].name + ' <img src="' + payload.artists[idx].photo +'"></li>';
    }
    html += '</ol>';
    document.getElementById("workarea").innerHTML = html;
  },

  CHOOSE_ITEM : function(payload) {
    document.getElementById("videoarea").style.display = 'none';
    document.getElementById("video").pause();
    var html = '<h1>For artist ' + payload.artist.name + ' choose an item to trade for</h1><ol>';
    for( var idx=0; idx<payload.items.length; idx++){
        html += '<li>' + payload.items[idx].name + ' <img src="' + payload.items[idx].photo +'"><br/>' +
            payload.items[idx].description + '</li>';
    }
    html += '</ol>';
    document.getElementById("workarea").innerHTML = html;
  },
    
  REVIEW : function(payload) {
    document.getElementById("videoarea").style.display = 'none';
    document.getElementById("video").pause();
    document.getElementById("workarea").innerHTML = '<h1>Do you want to trade with artist ' + payload.artist.name +
          ' for item ' + payload.item.name +'?</h1>' +
          '<br/><img src="' + payload.item.photo + '"/>';
  },
    
  ASK_EXCHANGE : function(payload) {
    document.getElementById("video").src = payload.video;
    document.getElementById("workarea").innerHTML = "";
    document.getElementById("videoarea").style.display = 'block';
    document.getElementById("video").play();
    document.getElementById("video").onended = function(){
      mamook_event({ 'event' : "finishedvideo" });
    };
  },

  GET_OFFER : function(payload) {
    document.getElementById("videoarea").style.display = 'none';
    document.getElementById("video").pause();
    document.getElementById("workarea").innerHTML = '<h1>What do you offer artist ' + payload.artist.name +
          ' in exchange for item ' + payload.item.name +'?</h1>' +
          '<br/><img src="' + payload.item.photo + '"/>';
  },

  AI : function(payload) {
    document.getElementById("videoarea").style.display = 'none';
    document.getElementById("video").pause();
    payload.count = 0;
    function checkML() {
      $.ajax({    
        type: "POST",
        url: payload.classifier, // cross-site headers needed or same host server
        cache: false,
        data: JSON.stringify({ "offer" : payload.offer, "item" : payload.item.id, "artist" : payload.artist.id, "count" : payload.count }),
        success: function(result){
          if(result == "YES"){
            document.getElementById("workarea").innerHTML = "YES";
            mamook_event({ 'event' : "classifieryes" });
          }else if(result == "NO"){
            document.getElementById("workarea").innerHTML = "NO";
            mamook_event({ 'event' : "classifierno" });
          }else { // SVG
            document.getElementById("workarea").innerHTML = result;
            payload.count++;
            window.setTimeout(function() { checkML() }, 3000);
          }
        },
        dataType: "text",
        contentType: "application/json"
      });
    }
    checkML();
  },

  REJECTED :   function(payload) { this.showvideo(payload) },
  
  ACCEPTED :   function(payload) { this.showvideo(payload) },

  RETRY :      function(payload) { this.showvideo(payload) },

  AI2 :        function(payload) { this.AI(payload); },
  
  GET_OFFER2 : function(payload) { this.GET_OFFER(payload); },
  
  REJECTED2 :  function(payload) { this.showvideo(payload) },
  
  GUIDED :  function(payload) {
    document.getElementById("videoarea").style.display = 'none';
    document.getElementById("video").pause();
    var html = '<h1>' + payload.artist.name + ' is interested in the following items to trade for</h1><ol>';
    for( var idx=0; idx<payload.options.length; idx++){
        html += '<li>' + payload.options[idx] + '</li>';
    }
    html += '</ol>';
    document.getElementById("workarea").innerHTML = html;    
  },

  COLLECT :  function(payload) {
    document.getElementById("videoarea").style.display = 'none';
    document.getElementById("video").pause();
    var html = '<p>Do you want to record your trade <b>now</b> or do it <b>later</b> (honour system).</p>';
    document.getElementById("workarea").innerHTML = html;    
  },

  NOW :  function(payload) {
    document.getElementById("videoarea").style.display = 'none';
    document.getElementById("video").pause();
    var html = '<p>Please record your trade.</p>';
    document.getElementById("workarea").innerHTML = html;    
  },

  LATER : function(payload) { this.showvideo(payload) },
  
  DELIVER : function(payload) { this.showvideo(payload) },
  
  END : function(payload) { this.showvideo(payload) }
  
};
