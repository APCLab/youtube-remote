(function(app) {
  var ws;
  var ws_trace = {
    status: false,  // true for connected; vice versa
  };

  ws_connect = function(){
    if (ws && !ws.readyState)
      return

    console.log('connect...')
    ws = new WebSocket('ws://'+ window.location.host +'/ws')

    ws.send_obj = function(obj){
      ws.send(JSON.stringify(obj))
    }

    ws.onopen = function(){
      console.log("ws opend!")
      ws_trace.status = true
      ws.send_obj({
        client: "name",
        action: "join"
      })

    }
    ws.onmessage = function(e){
      console.log(e.data)
    }

    ws.onerror = function(e){
      console.log(e)
      setTimeout(ws_connect, 1000)
      ws_trace.status = false
    }

    ws.onclose = function(e){
      console.log('ws closed!')
      setTimeout(ws_connect, 1000)
      ws_trace.status = false
    }
  }
  ws_connect()

  app.ConnStatusComponent = ng.core
  .Component({
    selector: 'connect-status',
    templateUrl: '/static/templates/connect_stat.html',
  })
  .Class({
    constructor: function() {
      this.ws_trace = ws_trace;
    }
  });

  document.addEventListener('DOMContentLoaded', function() {
    // angular bootstrap
    ng.platform.browser.bootstrap(app.ConnStatusComponent);

    $('#play-btn').click(function(){
      var playload = {
        client: "name",
        action: "play"
      }

      ws.send(JSON.stringify(playload))
    })

    $('#pause-btn').click(function(){
      var playload = {
        client: "name",
        action: "pause"
      }

      ws.send(JSON.stringify(playload))
    })

    $('#stop-btn').click(function(){
      var playload = {
        client: "name",
        action: "stop"
      }

      ws.send(JSON.stringify(playload))
    })

    $('#add-btn').click(function(){
      var link = $('#new-link').val()

      if (!link)
        return

      console.log("Add link: " + link)

      var playload = {
        client: "name",
        action: "add",
        link: link
      }

      ws.send(JSON.stringify(playload))
    })
  });
})(window.app || (window.app = {}));
