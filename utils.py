import re

from urllib.parse import urlparse, parse_qs


def parse_yturl(url):
    p = urlparse(url)

    if p.netloc != 'www.youtube.com':
        raise ValueError()
    elif p.path not in ('/watch', '/playlist'):
        raise ValueError()

    params = parse_qs(p.query)

    return params
