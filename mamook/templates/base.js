window.mamook_state   = "";
window.mamook_payload = "";

function mamook_event(event){
  $.ajax({    
    type: "POST",
    url: "{{ url_for( 'event') }}",
    contentType: "application/json; charset=utf-8",
    cache: false,
    data: JSON.stringify(event),
    success: function(){
    },    
    contentType: "application/json"
  });  
}

// initialize mamook_handler object
{% if ui == 'base' %}
{% include 'index.js' %}
{% else %}
{% include 'control.js' %}
{% endif %}


function mamook_refresh(){
  if (window.mamook_state in mamook_handler){
    mamook_handler[window.mamook_state]( window.mamook_payload );
  }else{
    $("workarea").innerHTML = "MISSING: " + window.mamook_state;
  }
  {% if ui == 'base' %}
  window.mamook_check();
  {% else %}
  if(window.mamook_state != 'END'){
    window.mamook_check();
  }
  {% endif %}
}

function mamook_retrieve(){
  $.ajax({
    url: "{{ url_for( 'payload') }}",
    cache: false,
    dataType: "json",
    success: function(payload){
      window.mamook_state   = payload.state;
      console.log(window.mamook_state);
      window.mamook_payload = payload;
      mamook_refresh();
    }
  });
}

window.mamook_check = function() {
  $.ajax({
    url: "{{ url_for( 'state') }}",
    cache: false,
    dataType: "text",
    success: function(state){
      if(window.mamook_state != state){
        mamook_retrieve();
      }else{
        window.setTimeout(window.mamook_check, 1000);
      }
    }
  });
}

{% if ui == 'base' %}
document.getElementById("videoarea").innerHTML = '<video id="video" width="320" height="240"><source src="{{ static }}/sample/lorem.mp4" type="video/mp4">Your browser does not support the video tag.</video>';
document.getElementById("workarea").innerHTML = "<p>This is a demo of the technology behind the Mamook Lapeep installation. This installation is intended to be used from two devices, a desktop computer and a mobile device. If you are reading this in a mobile device, then you experience this demo. If you are reading this on a desktop computer, after pressing "START" you will see a QR code, please scan it from your mobile device and control the desktop computer's webpage from it.</p><p>At the start of the shift at the art gallery, the desktop machine will need to be prepared by somebody pressing this button. Otherwise the web browser won't allow for videos to autoplay with sound:</p><button id='start'>START</button>";
document.getElementById("start").onclick = function(evt) {
  document.getElementById("video").play();
  window.setTimeout(function(){
    document.getElementById("video").pause();
    document.getElementById("videoarea").style.display = 'none';
  }, 1000);
  document.getElementById("workarea").innerHTML = "";
  window.mamook_check();
}
{% else %}
window.mamook_check();
{% endif %}
