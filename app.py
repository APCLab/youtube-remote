import cherrypy

from jinja2 import Environment, FileSystemLoader
from ws4py.server.cherrypyserver import WebSocketPlugin, WebSocketTool


cherrypy.config.update({'server.socket_host': '0.0.0.0'})
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
    cherrypy.quickstart(YouTubeRemote(), config='app.conf')
