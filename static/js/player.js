var player
var ws
var status_map = {
  '-1': 'unstarted',
  0: 'ended',
  1: 'playing',
  2: 'paused',
  3: 'buffering',
  5: 'cued',
}

var action = {
  play: function(){
    player.playVideo()
  },
  pause: function(){
    player.pauseVideo()
  },
  stop: function() {
    player.stopVideo()
  },
  add: function(link){
    console.log("[add handler]")
    console.log(link)

    if (link.v) {
      player.loadVideoById({videoId: link.v})
    }
    else if (link.list) {
      player.loadPlaylist({list: link.list[0]})
    }
  },
}

var action_handler = function(action_type, data){
  console.log("[action handler] " + action_type)
  console.log(action_type === 'pause')

  if (action_type === 'play') {
    action.play()
  }
  else if (action_type === 'pause') {
    action.pause()
  }
  else if (action_type=== 'stop') {
    action.stop()
  }
  else if (action_type === 'add') {
    action.add(data.link)
  }
}

var ws_connect = function(){
  if (ws && !ws.readyState)
    return

  console.log('connect...')
  ws = new WebSocket('ws://' + window.location.host + '/ws')

  ws.send_obj = function(obj){
    ws.send(JSON.stringify(obj))
  }

  ws.onopen = function(){
    console.log("ws opend!")
    ws.send_obj({
      audio: "XD",
      action: "join",
    })
  }

  ws.onmessage = function(e){
    console.log(e.data)
    data = JSON.parse(e.data)
    console.log(data)
    if (data.action) {
      action_handler(data.action, data)
    }
  }

  ws.onerror = function(e){
    console.log(e)
    setTimeout(ws_connect, 1000)
  }

  ws.onclose = function(e){
    console.log('ws closed!')
    setTimeout(ws_connect, 1000)
  }
}
ws_connect()

function onPlayerReady(event) {
  event.target.playVideo();
}

function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '390',
    width: '640',
    // videoId: 'M7lc1UVf-VE',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

function onPlayerStateChange(event) {
  status = event.data
  
  ws.send_obj({
    audio: "XD",
    action: "status_change",
    data: status_map[status]
  })
}

// youtube iframe api
var tag = document.createElement('script');
tag.src = 'http://www.youtube.com/iframe_api';
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
