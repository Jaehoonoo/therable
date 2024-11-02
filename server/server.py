from flask import Flask, jsonify
from flask_cors import CORS

# app instance
app = Flask(__name__)
CORS(app)

@app.route('/api/home', methods=['GET'])
def home():
    return jsonify({'message': 'Welcome to the Flask API!'})

@app.route('/therable/entry', methods=['POST'])
def saveEntry():
    return jsonify({'message': ''})
@app.route('/therable/entry', methods=['GET'])
def getallEntries():
    return jsonify({'message': 'fdshj'})
@app.route('/therable/entry', methods=['PUT'])
def editEntry():
    return jsonify({'message': ''})
@app.route('/therable/entry', methods=['DELETE'])
def deleteEntry():
    return jsonify({'message': ''})

if __name__ == '__main__':
    app.run(debug=True, port = 8080)  