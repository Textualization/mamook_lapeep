window.mamook_state   = "";
window.mamook_payload = "";

function mamook_event(event){
  $.ajax({    
    type: "POST",
    url: "{{ url_for( 'event') }}",
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
  window.mamook_check();
}

function mamook_retrieve(){
  $.ajax({
    url: "{{ url_for( 'payload') }}",
    cache: false,
    success: function(payload){
      eval('payload = ' + payload +";");
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
    success: function(state){
      if(window.mamook_state != state){
        mamook_retrieve();
      }else{
        window.setTimeout(window.mamook_check, 1000);
      }
    }
  });
}

window.mamook_check();
