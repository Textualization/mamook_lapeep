from flask import Flask
from flask_redis import FlaskRedis
from 

app = Flask(__name__)
redis_client = FlaskRedis(app)

@app.route('/')
def base():
    if 'session' in request.cookies:
        cookie = request.cookies['session']
        user = auth.user_for_cookie(db, cookie)
    return 'Hello, World!'
