from flask import Flask
from redis import StrictRedis

app = Flask('mamook')

app.config.from_object('config')
redis_client = StrictRedis()

from mamook import views


