#!/usr/bin/env python

import re
from datetime import datetime
from collections import deque
from jobs import AbstractJob
from subprocess import Popen, PIPE
from sys import platform


def _items(d):
    try:
        return d.iteritems()
    except AttributeError:
        # iteritems does not exist in Python 3
        return d.items()


class Ping(AbstractJob):

    def __init__(self, conf):
        self.interval = conf['interval']
        self.hosts = conf['hosts']
        self.timeout = conf.get('timeout', 1)
        self.cache_size = conf.get('cache_size', 10)
        self.values = {}

    def _parse_time(self, ping_output):
        time = re.search(r'time=(\d+(?:\.\d+)?)', ping_output)
        return float(time.group(1)) if time is not None else 0

    def _ping(self, host):
        ping_cmd = 'ping6' if ':' in host else 'ping'
        deadline_flag = '-w'
        # ping on darwin uses -t for deadline/timeout
        if platform == 'darwin':
            deadline_flag = '-t'
        ping = '%s %s %d -c 1 %s' % (ping_cmd, deadline_flag, self.timeout,
                                     host)
        p = Popen(ping.split(' '), stdout=PIPE, stderr=PIPE)
        return self._parse_time(p.communicate()[0].decode())

    def get(self):
        now = datetime.now()
        for label, host in self.hosts:
            if label not in self.values:
                self.values[label] = deque([], self.cache_size)
            latency = self._ping(host)
            self.values[label].append({
                'label': label,
                'host': host,
                'time': now.strftime('%H:%M:%S'),
                'latency': latency
            })
        return {'values': {k: list(v) for k, v in _items(self.values)}}
