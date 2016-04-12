import cherrypy
import sys

from jinja2 import Environment, FileSystemLoader
from ws4py.server.cherrypyserver import WebSocketPlugin, WebSocketTool


env = Environment(loader=FileSystemLoader('templates'))
WebSocketPlugin(cherrypy.engine).subscribe()
cherrypy.tools.websocket = WebSocketTool()


class YouTubeRemote:
    @cherrypy.expose
    def index(self):
        temp = env.get_template('index.html')
        return temp.render()

    @cherrypy.expose
    def p(self):
        temp = env.get_template('p.html')
        return temp.render()

    @cherrypy.expose
    def ws(self):
        handler = cherrypy.request.ws_handler


if __name__ == '__main__':
    cherrypy.config.update({
        'server.socket_host': sys.argv[1] if len(sys.argv) > 1 else '0.0.0.0',
        'server.socket_port': sys.argv[2] if len(sys.argv) > 2 else 5005
    })
    cherrypy.quickstart(YouTubeRemote(), config='app.conf')
