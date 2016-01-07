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
  add: function(link, user){
    if (link.list) {
      player.loadPlaylist({list: link.list[0]})
    }
    else if (link.v) {
      player.loadVideoById({videoId: link.v})
    }

    if (!user)
      return

    action.user = user

    action.get_info()
  },
  get_info: function(name){
    name = name || ['id', 'title', 'author', 'volume', 'player_state',
                    'current_time', 'duration', 'muted', 'user']

    msg = {}
    name.forEach(function(e){
      if (e === 'title') {
        msg.title = player.B.videoData.title
      }
      else if (e === 'id') {
        msg.id = player.getVideoData().video_id
      }
      else if (e === 'author') {
        msg.author = player.B.videoData.author
      }
      else if (e === 'volume') {
        msg.volume = player.B.volume
      }
      else if (e === 'player_state') {
        msg.player_state = status_map[player.getPlayerState()]
      }
      else if (e === 'current_time') {
        msg.current_time = player.getCurrentTime()
      }
      else if (e === 'duration') {
        msg.duration = player.getDuration()
      }
      else if (e === 'muted') {
        msg.muted = player.B.muted
      }
      else if (e === 'user') {
        msg.user = action.user
      }
    })

    if (msg == {})
      return

    ws.send_obj({
      action: 'get_info',
      data: msg,
    })
  },
  user: null,
}

var action_handler = function(action_type, data){
  console.log("[action handler] " + action_type)

  if (action_type === 'play') {
    action.play()
  }
  else if (action_type === 'pause') {
    action.pause()
  }
  else if (action_type === 'stop') {
    action.stop()
  }
  else if (action_type === 'add') {
    action.add(data.link, data.user)
  }
  else if (action_type === 'get_info'){
    action.get_info(data.name)  // name = [ ... ]
  }
}

var ws_connect = function(){
  if (ws && !ws.readyState)
    return

  console.log('connect...')
  ws = new WebSocket('ws://' + window.location.host + '/ws')

  ws.send_obj = function(obj){
    obj.audio = obj.audio || 'server'

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
    action: "status_change",
    data: status_map[status]
  })

  if (status_map[status] === 'playing')  // force refecsh info
    action.get_info()
}

// youtube iframe api
var tag = document.createElement('script');
tag.src = 'http://www.youtube.com/iframe_api';
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
