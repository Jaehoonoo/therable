from flask import Flask, jsonify
from flask_cors import CORS

import iris
import json

namespace="USER"
port = "1972"
hostname= "localhost"
connection_string = f"{hostname}:{port}/{namespace}"
username = "demo"
password = "demo"

# app instance
app = Flask(__name__)
CORS(app)

@app.route('/therable/entry', methods=['POST'])
def saveEntry():
    return jsonify({'message': ''})

@app.route('/therable/entry', methods=['GET'])
def getallEntries():
    tableName = request.json.get('tableName')
    conn = iris.connect(connection_string, username, password)
    cursor = conn.cursor()
    try:
        cursor.execute(f"Select * From {tableName}")
        data = cursor.fetchall()
    except Exception as inst:
        return jsonify({"response": str(inst)})
    cursor.close()
    conn.commit()
    conn.close()
    print(data)
    return jsonify({"response": data})

@app.route('/therable/entry', methods=['PUT'])
def editEntry():
    return jsonify({'message': ''})

@app.route('/therable/entry', methods=['DELETE'])
def deleteEntry():
    return jsonify({'message': ''})

if __name__ == '__main__':
    app.run(debug=True, port = 8080)  