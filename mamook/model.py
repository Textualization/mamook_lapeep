from transitions import Machine
from transitions.extensions.diagrams import GraphMachine
from transitions.extensions.diagrams_graphviz import Graph

class MamookSession(object):

    states = [ 'QR',          # Scan QR code. Would need to include URL like a bit.ly/QR code
               'START',       # Get intro text on video. Prime the visitor into the right mindset.
               'CHOOSART',    # Choose the artist that they want to trade with. Selecting an artist on the mobile site. 5 artists.
               'REVIEW',      # Review the items that the artist is willing to trade. Shows on the wall. Choose an artifact. User makes a decision about what they want to trade for. 
               'ASKEXCHANGE', # The computer asks what do you offer in exchange?
               'GETOFFER',    # The visitor offers something. Either types or structure menu selects.
               'AI',          # The system evaluates the metadata info of the artifact. Takes a piece of text to decide YES/NO. This is the AI aspect. Depends on the artists wishes. Classifier is dependent on the the artist. Will review whether the classifier can be item responsive.
               'ACCEPTS',     # Classifier says YES
               'REJECTS',     # Classifier says NO. Perhaps the NO is around a poetic response. Offer change artists, one retry or guided suggestions.
               'RETRY',       # Some general feedback on how to be more acceptable.
               'GETOFFER2',   # The visitor offers something. Either types or structure menu selects.
               'AI2',         # The system evaluates the metadata info of the artifact. Takes a piece of text to decide YES/NO.
               'REJECTS2',    # Classifier says NO, now to guided
               'GUIDED',      # Switches to backup system. Asks for a specific things. Presents them as buttons/choices on the website.
               'COLLECT',     # Collect artifact/item. Could be audio/video. Could send a photo or something like that. Prefer a live recording due to liability. We could ask if they want it to be reshared (in the future PHASE 2).
               'NOW',         # Share now. Text box they could type or attach a file (most likely a photo or video).
               'LATER',       # Share later. We would take their word for it.
               'DELIVER'      # Artist piece is shared. Artist piece is shared on the screen. We are using videos.
              ]

    transitions = [
        { 'trigger': 'scanned',       'source' : 'QR',          'dest' : 'START'       },
        { 'trigger': 'finishvideo',   'source' : 'START',       'dest' : 'CHOOSART'    },
        { 'trigger': 'chosart',       'source' : 'CHOOSART',    'dest' : 'REVIEW'      , 'before' : 'set_artist' },
        { 'trigger': 'chositem',      'source' : 'REVIEW',      'dest' : 'ASKEXCHANGE' , 'before' : 'set_item'   },
        { 'trigger': 'goback',        'source' : 'REVIEW',      'dest' : 'CHOOSART'    },
        { 'trigger': 'goback',        'source' : 'ASKEXCHANGE', 'dest' : 'REVIEW'      },
        { 'trigger': 'finishvideo',   'source' : 'ASKEXCHANGE', 'dest' : 'GETOFFER'    },
        { 'trigger': 'goback',        'source' : 'GETOFFER'   , 'dest' : 'REVIEW'      },
        { 'trigger': 'offer',         'source' : 'GETOFFER',    'dest' : 'AI'          , 'before' : 'set_offer' },
        { 'trigger': 'classifieryes', 'source' : 'AI',          'dest' : 'ACCEPTS'     },
        { 'trigger': 'classifierno',  'source' : 'AI',          'dest' : 'REJECTS'     },
        { 'trigger': 'finishvideo',   'source' : 'ACCEPTS',     'dest' : 'COLLECT'     },
        { 'trigger': 'goback',        'source' : 'REJECTS',     'dest' : 'RETRY'       },
        { 'trigger': 'restart',       'source' : 'REJECTS',     'dest' : 'CHOOSART'    },
        { 'trigger': 'help',          'source' : 'REJECTS',     'dest' : 'GUIDED'      },
        { 'trigger': 'finishvideo',   'source' : 'RETRY',       'dest' : 'GETOFFER2'   },
        { 'trigger': 'offer',         'source' : 'GETOFFER2',   'dest' : 'AI2'         , 'before' : 'set_offer' },
        { 'trigger': 'classifieryes', 'source' : 'AI2',         'dest' : 'ACCEPTS'     },
        { 'trigger': 'classifierno',  'source' : 'AI2',         'dest' : 'REJECTS2'    },
        { 'trigger': 'finishvideo',   'source' : 'REJECTS2',    'dest' : 'GUIDED'      },
        { 'trigger': 'pick',          'source' : 'GUIDED',      'dest' : 'COLLECT'     },
        { 'trigger': 'sharenow',      'source' : 'COLLECT',     'dest' : 'NOW'         },
        { 'trigger': 'sharelater',    'source' : 'COLLECT',     'dest' : 'LATER'       },
        { 'trigger': 'collect',       'source' : 'NOW',         'dest' : 'DELIVER'     , 'before': 'set_received' },
        { 'trigger': 'finishvideo',   'source' : 'LATER',       'dest' : 'DELIVER'     },
        { 'trigger': 'finishvideo',   'source' : 'DELIVER',     'dest' : 'QR'          }
        ]

    def __init__(self, _id):
        self._id      = _id
        self.artist   = None
        self.item     = None
        self.offer    = None
        self.received = None

        self.machine = GraphMachine(model=self, states=MamookSession.states,
                                    transitions=MamookSession.transitions, initial='QR', title='Mamook Session')
        self.graph = Graph(self.machine, title='session')


    def to_dot(self):
        return self.graph.generate()

    def set_artist(self, artist):
        self.artist = artist
        
    def set_item(self, item):
        self.item = item

    def set_offer(self, offer):
        self.offer = offer
        
    def set_received(self, received):
        self.received = received
        
        
