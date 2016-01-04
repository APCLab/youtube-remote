var ws;
var ws_trace = {
  status: 'close',
}

Vue.config.delimiters = ['[[', ']]']

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
    ws_trace.status = 'open'
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
    ws_trace.status = 'close'
  }

  ws.onclose = function(e){
    console.log('ws closed!')
    setTimeout(ws_connect, 1000)
    ws_trace.status = 'close'
  }
}
ws_connect()


$(document).ready(function() {
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

  var connectStatus = new Vue({
    el: '#connect-status',
    data: ws_trace,
  })
});
