import json

from ws4py import configure_logger, format_addresses
from ws4py.manager import WebSocketManager
from ws4py.websocket import WebSocket

from utils import parse_yturl


logger = configure_logger()
client_manager = WebSocketManager()
audio_manager = WebSocketManager()


class ControlWebSocket(WebSocket):
    heartbeat_freq = 1

    def received_message(self, msg):
        logger.debug('[LOG] Rx msg: {}'.format(msg.data))

        try:
            data = json.loads(msg.data.decode())
            client = data.get('client', None)
            audio = data.get('audio', None)
            action = data['action']

            assert(client or audio)
        except (ValueError, KeyError, AssertionError):
            self.send(json.dumps({'error': 'Invalid JSON'}))
            return

        if client:
            ret = self.client_handler(client, data)
        elif audio:
            ret = self.audio_handler(audio, data)

        self.send(json.dumps(ret), False)

    def client_handler(self, client, data):
        action = data['action']

        if action == 'join':
            logger.debug('[client join] {}'.format(format_addresses(self)))
            client_manager.add(self)
        elif action == 'play':
            logger.debug('[action] play')
            audio_manager.broadcast(json.dumps({'action': 'play'}))
        elif action == 'pause':
            logger.debug('[action] pause')
            audio_manager.broadcast(json.dumps({'action': 'pause'}))
        elif action == 'stop':
            logger.debug('[action] stop')
            audio_manager.broadcast(json.dumps({'action': 'stop'}))
        elif action == 'add':
            link = data.get('link')

            if not link:
                return {'error': 'missing link for add'}
            try:
                link_param = parse_yturl(link)
            except (ValueError, KeyError):
                return {'error': 'Invalid youtube link to add'}

            logger.debug('[action] add')
            audio_manager.broadcast(json.dumps({
                'action': 'add',
                'link': link_param,
            }))
            return {'ok': True, 'msg': 'link {} added'.format(link)}

        return {'ok': True}

    def audio_handler(self, audio, data):
        action = data['action']

        if action == 'join':
            logger.debug('[audio join] {}'.format(format_addresses(self)))
            audio_manager.add(self)
        elif action == 'status_change':
            logger.debug('[audio status_change]')
            client_manager.broadcast(json.dumps({
                'action': 'status_change',
                'data': data['data'],
            }))

        return {'ok': True}
