from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import os

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
    userId = request.json.get('userID')
    date = request.json.get('date')
    entry = request.json.get('entry')
    query = f"INSERT INTO therableentries (userID, datecreated, entry) VALUES (?,?,?)"
    conn = iris.connect(connection_string, username, password)
    cursor = conn.cursor()
    try:
        cursor.execute(query,[userId,date,entry])
    except Exception as inst:
        return jsonify({"response": str(inst)}) 
    cursor.close()
    conn.commit()
    conn.close()
    return jsonify({"response": "new information added"})

@app.route('/therable/entry', methods=['GET'])
def getallEntries():
    userId = request.json.get('userID')
    conn = iris.connect(connection_string, username, password)
    cursor = conn.cursor()
    try:
        cursor.execute(f"Select * From therableentries")
        data = cursor.fetchall()
    except Exception as inst:
        return jsonify({"response": str(inst)})
    cursor.close()
    conn.commit()
    conn.close()
    return jsonify({"response": data})

@app.route('/therable/entry', methods=['PUT'])
def editEntry():
    return jsonify({'message': ''})

@app.route('/therable/entry', methods=['DELETE'])
def deleteEntry():
    return jsonify({'message': ''})

if __name__ == '__main__':
    app.run(debug=True, port = 8080)  