#!/usr/bin/env python

from jobs import AbstractJob


class Onebusaway(AbstractJob):

    def __init__(self, conf):
        self.interval = conf['interval']

    def get(self):
        # r = requests.get(self.url, timeout=self.timeout)
        # r.raise_for_status()
        return "{'json':'lol}"
