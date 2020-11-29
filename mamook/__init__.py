from flask import Flask
from flask_redis import FlaskRedis

app = Flask('mamook')

app.config.from_object('config')
redis_client = FlaskRedis(app)

from mamook import views


