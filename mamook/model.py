import random
import datetime
import json
import re

from transitions import Machine
from transitions.extensions.diagrams import GraphMachine
from transitions.extensions.diagrams_graphviz import Graph

class MamookSession(object):

    states = [ 'QR',               # Scan QR code. Would need to include URL like a bit.ly/QR code
               'START',            # Get intro text on video. Prime the visitor into the right mindset.
               'CHOOSE_ARTIST',    # Choose the artist that they want to trade with. Selecting an artist on the mobile site. 5 artists.
               'CHOOSE_ITEM',      # Review the items that the artist is willing to trade. Shows on the wall. 
               'REVIEW',           # Review an item. User makes a decision about what they want to trade for. 
               'ASK_EXCHANGE',     # The computer asks what do you offer in exchange?
               'GET_OFFER',        # The visitor offers something. Either types or structure menu selects.
               'AI',               # The system evaluates the metadata info of the item. Takes a piece of text to decide YES/NO. This is the AI aspect. Depends on the artists wishes. Classifier is dependent on the the artist. Will review whether the classifier can be item responsive.
               'ACCEPTED',         # Classifier says YES
               'REJECTED',         # Classifier says NO. Perhaps the NO is around a poetic response. Offer change artists, one retry or guided suggestions.
               'RETRY',            # Some general feedback on how to be more acceptable.
               'GET_OFFER2',       # The visitor offers something. Either types or structure menu selects.
               'AI2',              # The system evaluates the metadata info of the item. Takes a piece of text to decide YES/NO.
               'REJECTED2',        # Classifier says NO, now to guided
               'GUIDED',           # Switches to backup system. Asks for a specific things. Presents them as buttons/choices on the website.
               'COLLECT',          # Collect item. Could be audio/video. Could send a photo or something like that. Prefer a live recording due to liability. We could ask if they want it to be reshared (in the future PHASE 2).
               'NOW',              # Share now. Text box they could type or attach a file (most likely a photo or video).
               'LATER',            # Share later. We would take their word for it.
               'DELIVER',          # Artist piece is shared. Artist piece is shared on the screen. We are using videos.
               'END'               # Session has ended, start a new session
              ]

    transitions = [
        { 'trigger': 'scanned',       'source' : 'QR',               'dest' : 'START'           },
        { 'trigger': 'finishedvideo', 'source' : 'START',            'dest' : 'CHOOSE_ARTIST'   },
        { 'trigger': 'skip',          'source' : 'START',            'dest' : 'CHOOSE_ARTIST'   },
        { 'trigger': 'pick',          'source' : 'CHOOSE_ARTIST',    'dest' : 'CHOOSE_ITEM'     , 'before' : 'set_artist' },
        { 'trigger': 'pick',          'source' : 'CHOOSE_ITEM',      'dest' : 'REVIEW'          , 'before' : 'set_item'   },
        { 'trigger': 'goback',        'source' : 'CHOOSE_ITEM',      'dest' : 'CHOOSE_ARTIST'   },
        { 'trigger': 'confirm',       'source' : 'REVIEW',           'dest' : 'ASK_EXCHANGE'     },
        { 'trigger': 'goback',        'source' : 'REVIEW',           'dest' : 'CHOOSE_ITEM'     },
        { 'trigger': 'goback',        'source' : 'ASK_EXCHANGE',     'dest' : 'REVIEW'          },
        { 'trigger': 'finishedvideo', 'source' : 'ASK_EXCHANGE',     'dest' : 'GET_OFFER'       },
        { 'trigger': 'skip',          'source' : 'ASK_EXCHANGE',     'dest' : 'GET_OFFER'       },
        { 'trigger': 'goback',        'source' : 'GET_OFFER'   ,     'dest' : 'CHOOSE_ITEM'     },
        { 'trigger': 'offer',         'source' : 'GET_OFFER',        'dest' : 'AI'              , 'before' : 'set_offer' },
        { 'trigger': 'classifieryes', 'source' : 'AI',               'dest' : 'ACCEPTED'        },
        { 'trigger': 'classifierno',  'source' : 'AI',               'dest' : 'REJECTED'        },
        { 'trigger': 'finishedvideo', 'source' : 'ACCEPTED',         'dest' : 'COLLECT'         },
        { 'trigger': 'skip',          'source' : 'ACCEPTED',         'dest' : 'COLLECT'         },
        { 'trigger': 'finishedvideo', 'source' : 'REJECTED',         'dest' : 'RETRY'           },
        { 'trigger': 'restart',       'source' : 'REJECTED',         'dest' : 'CHOOSE_ARTIST'   },
        { 'trigger': 'help',          'source' : 'REJECTED',         'dest' : 'GUIDED'          },
        { 'trigger': 'finishedvideo', 'source' : 'RETRY',            'dest' : 'GET_OFFER2'      },
        { 'trigger': 'skip',          'source' : 'RETRY',            'dest' : 'GET_OFFER2'      },
        { 'trigger': 'offer',         'source' : 'GET_OFFER2',       'dest' : 'AI2'             , 'before' : 'set_offer' },
        { 'trigger': 'classifieryes', 'source' : 'AI2',              'dest' : 'ACCEPTED'        },
        { 'trigger': 'classifierno',  'source' : 'AI2',              'dest' : 'REJECTED2'       },
        { 'trigger': 'finishedvideo', 'source' : 'REJECTED2',        'dest' : 'GUIDED'          },
        { 'trigger': 'skip',          'source' : 'REJECTED2',        'dest' : 'GUIDED'          },
        { 'trigger': 'pick',          'source' : 'GUIDED',           'dest' : 'COLLECT'         , 'before' : 'set_offer' },
        { 'trigger': 'picknow',       'source' : 'COLLECT',          'dest' : 'NOW'             },
        { 'trigger': 'picklater',     'source' : 'COLLECT',          'dest' : 'LATER'           },
        { 'trigger': 'collect',       'source' : 'NOW',              'dest' : 'DELIVER'         , 'before': 'set_received' },
        { 'trigger': 'picklater',     'source' : 'NOW',              'dest' : 'LATER'           },
        { 'trigger': 'finishedvideo', 'source' : 'LATER',            'dest' : 'DELIVER'         },
        { 'trigger': 'skip',          'source' : 'LATER',            'dest' : 'DELIVER'         },
        { 'trigger': 'recordedvideo', 'source' : 'DELIVER',          'dest' : 'END'             },
        { 'trigger': 'picklater',     'source' : 'DELIVER',          'dest' : 'LATER'           },
        { 'trigger': 'timeout',       'source' : '*',                'dest' : 'QR'              }
        ]

    def __init__(self, _id, _redis):
        if _id is None:
            _id = _redis.incr("session-count")
        self._id      = _id
        self.key      = "s-{}".format(_id)
        self.redis    = _redis
        self.artist   = None
        self.item     = None
        self.offer    = None
        self.received = None
        self.events   = 0

        self.machine = GraphMachine(model=self, states=MamookSession.states,
                                    transitions=MamookSession.transitions, initial='QR', title='Mamook Session')
        self.graph = Graph(self.machine, title='session')
        
        self.refresh()


    def to_dot(self):
        return self.graph.generate()

    def set_artist(self, artist):
        self.artist = int(artist)
        self.store()
        
    def set_item(self, item):
        self.item = int(item)
        self.store()

    def set_offer(self, offer):
        self.offer = offer
        self.store()
        
    def set_received(self, received):
        self.received = received
        self.store()

    def refresh(self):
        if self.redis.exists(self.key):
            self.machine.set_state(self.redis.hget(self.key, 'state').decode('utf-8'))
        else:
            self.redis.hset(self.key, mapping={ "state": self.state, "events" : 0 })
        if self.redis.hexists(self.key, "events"):
            self.events = int(self.redis.hget(self.key, "events"))
        if self.redis.hexists(self.key, "artist"):
            self.artist = int(self.redis.hget(self.key, "artist"))
        if self.redis.hexists(self.key, "item"):
            self.item = int(self.redis.hget(self.key, "item"))
        if self.redis.hexists(self.key, "offer"):
            self.offer = self.redis.hget(self.key, "offer").decode("utf-8")
        if self.redis.hexists(self.key, "received"):
            self.received = self.redis.hget(self.key, "received").decode("utf-8")

    def store(self):
        mapping = { "state": self.state, "events" : self.events }
        if self.artist is None:
            self.redis.hdel(self.key, "artist")
        else:
            mapping['artist'] = self.artist
        if self.item is None:
            self.redis.hdel(self.key, "item")
        else:
            mapping['item'] = self.item
        if self.offer is None:
            self.redis.hdel(self.key, "offer")
        else:
            mapping['offer'] = self.offer
        if self.received is None:
            self.redis.hdel(self.key, "received")
        else:
            mapping['received'] = self.received
        self.redis.hset(self.key, mapping=mapping)

    def slot(self, slot):
        if slot == "artists":
            artist_count = int(self.redis.get("artist-count"))
            artists = []
            for idx in range(0, artist_count):
                artists.append(decode_dict(self.redis.hgetall("a-{}".format(idx))))
                artists[-1]['id'] = int(idx)
            return { slot: artists }
        elif slot == "artist":
            artist = decode_dict(self.redis.hgetall("a-{}".format(self.artist)))
            artist['id'] = int(self.artist)
            return { slot : artist }
        elif slot == "item":
            item = decode_dict(self.redis.hgetall("i-{}".format(self.item)))
            item['id'] = int(self.item)
            return { slot : item }
        elif slot == "items":
            items = []
            for idx in self.redis.smembers("a-{}-items".format(self.artist)):
                items.append(decode_dict(self.redis.hgetall("i-{}".format(idx.decode("utf-8")))))
                items[-1]['id'] = int(idx)
            return { slot: items }
        elif slot == "offer":
            return { slot: self.offer }
        elif slot == "options":
            options = list(map(lambda x:escape_quotes(x.decode("utf-8")), self.redis.lrange("o-{}".format(self.artist), 0, 10)))
            return { slot: options }
        return {}

    def record_event(self, evt):
        self.events += 1
        self.redis.hset(self.key, "events", self.events)
        evt['datetime'] = datetime.datetime.now().ctime()
        self.redis.set("e-{}-{}".format(self.key, self.events), json.dumps(evt))

def decode_dict(d):
    r = {}
    for k, v in d.items():
        r[k.decode('utf-8')] = escape_quotes(v.decode('utf-8'))
    return r

def escape_quotes(s):
    return re.sub("'", "\\'", s)

def create_session(redis):
    _id   = int(MamookSession(None, redis)._id)
    nonce = str(int(random.random()*10**10))
    redis.set("n-" + nonce, _id)
    
    return _id, nonce
