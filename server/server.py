from flask import Flask, request, jsonify
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

# creates table for user
@app.route('/api/create_table', methods=['POST'])
def createTable():
    user_id = request.json.get('userId')
    
    table_name = user_id
    schema = f"User_schema"
    # print("trying connection string: ", connection_string, flush=True) # useful for debugging
    conn = iris.connect(connection_string, username, password)
    cursor = conn.cursor()

    try:
        # Check if the table already exists
        check_query = f"SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '{table_name}'"
        cursor.execute(check_query)
        table_exists = cursor.fetchone()[0]

        if table_exists == 0:
            # If the table doesn't exist, create it
            create_query = f"CREATE TABLE {schema}.{table_name} (date_created DATETIME, entry TEXT)"
            cursor.execute(create_query)
            conn.commit()
            return jsonify({"response": f"Table '{table_name}' created."})
        else:
            return jsonify({"response": f"Table '{table_name}' already exists."})
    except Exception as e:
        return jsonify({"error": str(e)})
    finally:
        cursor.close()
        conn.close()


@app.route('/api/new_entry', methods=['POST'])
def saveEntry():
    date = request.json.get('date')
    entry = request.json.get('entry')
    query = f"INSERT INTO therableentries (datecreated, entry) VALUES (?,?)"
    conn = iris.connect(connection_string, username, password)
    cursor = conn.cursor()
    try:
        cursor.execute(query,[date,entry])
    except Exception as inst:
        return jsonify({"response": str(inst)}) 
    cursor.close()
    conn.commit()
    conn.close()
    return jsonify({"response": "new information added"})

@app.route('/api/get_entry', methods=['GET'])
def getallEntries():
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

@app.route('/api/edit_entry', methods=['PUT'])
def editEntry():
    return jsonify({'message': ''})

@app.route('/api/delete_entry', methods=['DELETE'])
def deleteEntry():
    return jsonify({'message': ''})

if __name__ == '__main__':
    app.run(debug=True, port = 8080)  