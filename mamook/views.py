import re
import json
import tempfile
import io
import smtplib
import datetime
from email.message import EmailMessage
from functools import wraps

from flask import render_template, flash, abort, redirect, session, url_for, request, g, jsonify, make_response, send_from_directory, render_template, render_template_string, Response

from mamook import app, redis_client
from .model import MamookSession, create_session

def nonce_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        has_session = False
        if 'session' in request.cookies:
            cookie = request.cookies['session']
            maybe_session = redis_client.get("n-" + cookie)
            if maybe_session is not None:
                kwargs['nonce']      = cookie
                kwargs['session_id'] = int(maybe_session)
                has_session = True
        if not has_session:
            session_id, nonce    = create_session(redis_client)
            kwargs['nonce']      = nonce
            kwargs['session_id'] = session_id
        return func(*args, **kwargs)
    return wrapper

@app.route('/', methods=['GET'])
@nonce_required
def home(nonce=None, session_id=None):
    resp = redirect(url_for('base'))
    resp.set_cookie('session', nonce)
    return resp

@app.route('/base', methods=['GET'])
@nonce_required
def base(nonce=None, session_id=None):
    resp = make_response(render_template('index.html', static=app.config['STATIC_URL']))
    resp.set_cookie('session', nonce)
    return resp

@app.route('/landing', methods=['GET'])
def landing():
    nonce = request.args.get('nonce', None)
    if nonce is not None and redis_client.exists("n-" + nonce):
        resp = redirect(url_for('control'))
        resp.set_cookie('session', nonce)
        return resp
    return make_response(render_template('landing_error.html', static=app.config['STATIC_URL']))

@app.route('/control', methods=['GET'])
@nonce_required
def control(nonce=None, session_id=None):
    resp = make_response(render_template('control.html', static=app.config['STATIC_URL']))
    resp.set_cookie('session', nonce)
    return resp

@app.route('/state', methods=['GET'])
@nonce_required
def state(nonce=None, session_id=None):
    _state = redis_client.hget("s-" + str(session_id), "state").decode('utf-8')
    print(_state)
    return _state

@app.route('/payload', methods=['GET'])
@nonce_required
def payload(nonce=None, session_id=None):
    session  = MamookSession(session_id, redis_client)
    print(session_id, session.state, session.artist, session.item)
    template = redis_client.get("t-" + session.state).decode('utf-8')
    slots    = json.loads(redis_client.get("t-{}-slots".format(session.state)).decode('utf-8'))
    print(slots)
    filled_slots = { "session" : session }
    for slot in slots:
        filled_slots.update( session.slot(slot) )
    resp     = render_template_string(template, **filled_slots)
    print(resp)
    return resp

@app.route('/event', methods=['POST'])
@nonce_required
def event(nonce=None, session_id=None):
    evt = request.json
    session  = MamookSession(session_id, redis_client)
    session.record_event(evt)
    print(evt, session.state)
    session.trigger(evt['event'], evt.get('value', None))
    print(session.state)
    session.store()
    return "OK"

@app.route('/<ui>.js', methods=['GET'])
def js(ui):
    resp = Response(render_template("base.js", ui=ui), content_type="application/javascript")
    resp.headers.add('Expires', datetime.datetime.now().strftime("%a, %d %b %Y %H:%M:%S GMT"))
    return resp

@app.route('/manual', methods=['GET'])
def manual():
    return render_template("manual.html")

# for development purposes, all static content should be handled by a webserver
@app.route('/static/<path:filename>')
def download_file(filename):
    return send_from_directory('static', filename)
