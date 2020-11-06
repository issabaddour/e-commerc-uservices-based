import os
from flask import Flask, request, jsonify
from flask_pymongo import PyMongo

application = Flask(__name__)

#application.config["MONGO_URI"] = 'mongodb://' + os.environ['MONGODB_USERNAME'] + ':' + os.environ['MONGODB_PASSWORD'] + '@' + os.environ['MONGODB_HOSTNAME'] + ':27017/'  + os.environ['MONGODB_DATABASE']
application.config["MONGO_URI"] = 'mongodb://' + 'admin' + ':' + '12345' + '@' + 'mongo-0.mongo' + ':27017/'  + 'authdb'
#application.config["MONGO_URI"] = 'mongodb://mongo-0.mongo:27017/authdb'
 
mongo = PyMongo(application)
db = mongo.db

@application.route('/')
def index():
    return jsonify(
        status=True,
        message='Dockerized Dockerized Dockerized Flask MongoDB app!'
    )

@application.route('/users')
def users():
    _users = db.authusers.find()
    
    data = []
    for user in _users:
        data.append(user['userProfile'])
    return jsonify(
        data
    )

@application.route('/getuser', methods=['POST'])
def getUser():
    rdata = request.get_json(force=True)
    _users = db.authusers.find({'userProfile.user_id': rdata['userID']})
    
    data = []
    for user in _users:
        data.append(user['userProfile'])
        
    return jsonify(
        data
    )
    
@application.route('/createuser', methods=['POST'])
def createUser():
    data = request.get_json(force=True)
    db.authusers.insert_one(data)
    return jsonify(
        status=True,
        message='user saved successfully!'
    ), 201

@application.route('/checkuser', methods=['POST'])
def checkUser():
    data = request.get_json(force=True)
    
    if (db.authusers.find({'userProfile.user_id': data['userID']}).count() > 0):
        return jsonify(
            status=True
        )
    else:
        return jsonify(
            status=False
        )

if __name__ == "__main__":
    application.run(host='0.0.0.0', port=5000, debug=True)
