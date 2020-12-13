import re
import json
import tempfile
import io
import smtplib
import datetime
import ast
import random
import os

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
    if app.config['DEBUG']:
        print(_state)
    return _state

@app.route('/payload', methods=['GET'])
@nonce_required
def payload(nonce=None, session_id=None):
    session  = MamookSession(session_id, redis_client)
    if app.config['DEBUG']:
        print(session_id, session.state, session.artist, session.item)
    template = redis_client.get("t-" + session.state).decode('utf-8')
    brace = template.index('{')
    slots = template[:brace].strip().split(" ")
    if app.config['DEBUG']:
        print(slots)
    template = template[brace:]
    filled_slots = { "session" : session, "static" : app.config['STATIC_URL'] }
    for slot in slots:
        filled_slots.update( session.slot(slot) )
    resp = render_template_string(template, **filled_slots)
    resp = json.dumps(ast.literal_eval(resp)) # fix ' vs "
    if app.config['DEBUG']:
        print(resp)
    return resp

@app.route('/event', methods=['POST'])
@nonce_required
def event(nonce=None, session_id=None):
    evt = request.json
    session  = MamookSession(session_id, redis_client)
    session.record_event(evt)
    if app.config['DEBUG']:
        print(evt, session.state)
    if evt['event'] == 'finishedvideo' and session.state == 'END':
        old = (session_id, nonce)
        session_id, nonce = create_session(redis_client)
        if app.config['DEBUG']:
            print("it's the end!", old, (session_id, nonce))
        resp = make_response("OK")
        resp.set_cookie('session', nonce)
        return resp
    else:
        session.trigger(evt['event'], evt.get('value', None))
        if app.config['DEBUG']:
            print(session.state)
        session.store()
    return "OK"

@app.route('/<ui>.js', methods=['GET'])
def js(ui):
    resp = Response(render_template("base.js", ui=ui, static=app.config['STATIC_URL']), content_type="application/javascript")
    resp.headers.add('Expires', datetime.datetime.now().strftime("%a, %d %b %Y %H:%M:%S GMT"))
    return resp

@app.route('/manual', methods=['GET'])
def manual():
    return render_template("manual.html")

# for development purposes, all static content should be handled by a webserver
@app.route('/static/<path:filename>')
def download_file(filename):
    return send_from_directory('static', filename)

@app.route('/classifier', methods=['POST'])
def classifier_stub():
    action = request.json
    # this is a stub, the classifier is in a different server
    if action['count'] > 5:
        if int(action['item'] % 2 == 0):
            return "YES"
        else:
            return "NO"
    return render_template("sample1.svg" if action['count'] % 2 == 0 else "sample2.svg", artist=action['artist'], item=action['item'] )
    
@app.route('/upload', methods=['POST'])
@nonce_required
def upload(nonce=None, session_id=None):
    if app.config['DEBUG']:
        print(request.files)

    if 'file' not in request.files:
        if app.config['DEBUG']:
            print("error", request.files)
        return "ERROR"
    file = request.files['file']
    if file:
        session  = MamookSession(session_id, redis_client)
        savepath = os.path.join(app.config['UPLOAD_FOLDER'], "upload-{}".format(session_id))
        file.save(savepath)
        session.collect("{}: '{}'".format(savepath, file.filename))
        session.store()
        return "OK"
    return "ERROR"
