var ws;
var ws_trace = {
  status: 'close',
}
var player_info = {
   'id':            null,
   'title':         null,
   'author':        null,
   'volume':        null, 
   'player_state':  null,
   'current_time':  null,
   'duration':      null,
   'muted':         null,
   'user':          null,
}

Vue.config.delimiters = ['[[', ']]']

ws_connect = function(){
  if (ws && !ws.readyState)
    return

  console.log('connect...')
  ws = new WebSocket('ws://'+ window.location.host +'/ws')

  ws.send_obj = function(obj){
    obj.client = obj.client || 'name'

    ws.send(JSON.stringify(obj))
  }

  ws.onopen = function(){
    console.log("ws opend!")
    ws_trace.status = 'open'

    ws.send_obj({
      client: "name",
      action: "join"
    })
    ws.get_info()
  }
  ws.onmessage = function(e){
    console.log(JSON.parse(e.data))

    var d = JSON.parse(e.data)
    if (d.action === 'get_info') {
      jQuery.extend(player_info, d.data)
    }
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

  ws.get_info = function(name){
    name = name || ['id', 'title', 'author', 'volume', 'player_state',
                    'current_time', 'duration', 'muted', 'user']

    ws.send_obj({
      action: 'get_info',
      name: name,
    })
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
      action: "add",
      link: link
    }

    ws.send_obj(playload)
    ws.get_info()
  })

  var connectStatus = new Vue({
    el: '#connect-status',
    data: ws_trace,
  })

  var infoPanel = new Vue({
    el: '#info-panel',
    data: player_info,
  })
});
