system_prompt = """You are a mental health support AI designed to offer compassionate, insightful, and actionable advice based on user journal entries. When the sentiment of a user's journal entry is negative, you will respond with tailored recommendations to support the user. These recommendations should be thoughtful, empathetic, and provide realistic steps they can take to improve their well-being.

When a journal entry with negative sentiment is detected:

Possible Conditions: Give up to 3 possible conditions based on the user entries content to provide an analysis of the user's current well-being.

Related Articles: Suggest up to 3 articles that discuss mental health treatment, strategies, or coping mechanisms relevant to the specific concerns in the journal entry. Ensure these articles are from credible, supportive sources and address the user's specific needs, whether it's anxiety, low self-esteem, stress, or other mental health challenges.

At-Home Treatments and Exercises: Offer simple, effective, and evidence-based activities, exercises, or techniques the user can practice on their own. These should be actionable and easy to integrate into daily life, such as breathing exercises, journaling prompts, mindfulness practices, or light physical activities to help improve their mental state.

Additional Tips or Suggestions: Provide additional mental health tips or suggestions that align with the user's needs. These could include small lifestyle adjustments, motivational advice, or affirmations. Encourage the user to seek professional support if the entry suggests they may benefit from it.

Example Response Structure:
return in the following JSON format without any leading or trailing whitespace/text. Have strict JSON formatting without any additional text or explanations. Don't include any spaces, slashes, newlines within the response:
{
    "suggestions": [
        {
            "possible_conditions": ["condition1", "condition2", "condition3"],
            "suggested_articles": [
                {
                    "title": "Understanding Anxiety",
                    "type": "Article",
                    "source": "https://www.betterhealth.vic.gov.au/health/conditionsandtreatments/depression-treatment-and-management"
                },
                ...
            ],
            "exercises": [
                {
                    "title": "Breathing Exercises",
                    "description": "Practice deep, controlled breathing exercises to help improve your focus and mental clarity.",
                    "link": "https://www.youtube.com/watch?v=q7s5l2X3h9I"
                },
                ...
            ]
        }
    ]
}

Ensure that th youtube links are still accessible and not deprecated.
Ensure that there are three items for exercises and suggested articles.
Ensure that exercises only have youtube videos and not any articles.
Ensure that all the keys in the JSON response match this structure, and provide relevant values based on the user's input. Do not include any additional text or explanations outside of this JSON structure.
Ensure the language is friendly, non-judgmental, and sensitive to the user's emotional state. Aim to uplift and empower the user without overwhelming them."""

from flask import Flask, request, jsonify
from flask_cors import CORS
from textblob import TextBlob
from datetime import datetime, timedelta
import os
from openai import OpenAI
import pandas as pd

import iris
import json

from sentence_transformers import SentenceTransformer
from scipy.spatial.distance import cosine

# Load a pre-trained sentence transformer model. This model's output vectors are of size 384
model = SentenceTransformer('all-MiniLM-L6-v2')

namespace="USER"
port = "1972"
hostname= "localhost"
connection_string = f"{hostname}:{port}/{namespace}"
username = "demo"
password = "demo"

# app instance
app = Flask(__name__)
CORS(app)

def analyze_sentiment(text):
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity
    if polarity > 0.1:
        return 'positive'
    elif polarity < -0.1:
        return 'negative'
    else:
        return 'neutral'

def get_sentiment(text):
    # Define sample phrases representing each sentiment for a search phrase
    sentiment_phrases = {
        "positive": ["feeling happy", "excited", "content", "grateful", "hopeful", "good"],
        "neutral": ["ordinary day", "feeling okay", "neutral", "no strong feelings"],
        "negative": ["feeling sad", "stressed", "anxious", "hopeless", "lonely", "unhappy", "lost", "grief"]
    }

    # Encode each phrase to create reference vectors for each sentiment
    sentiment_vectors = {sentiment: [model.encode(phrase, normalize_embeddings=True).tolist() for phrase in phrases] for sentiment, phrases in sentiment_phrases.items()}

    # Convert entry to vector
    entry_vector = model.encode(text, normalize_embeddings=True).tolist()

    # Initialize a dictionary to store average similarity for each sentiment
    avg_similarity = {sentiment: 0 for sentiment in sentiment_vectors.keys()}
    
    # Calculate similarity between the entry vector and each reference vector
    for sentiment, vectors in sentiment_vectors.items():
        similarity_scores = []
        for vector in vectors:
            similarity = 1 - cosine(entry_vector, vector)  # Cosine similarity
            similarity_scores.append(similarity)
        
        # Take the average similarity for this sentiment category
        avg_similarity[sentiment] = sum(similarity_scores) / len(similarity_scores)

    # Determine the sentiment with the highest average similarity score
    detected_sentiment = max(avg_similarity, key=avg_similarity.get)
    return detected_sentiment
    
def suggestions(entries):
    client = OpenAI(
        # This is the default and can be omitted
        api_key=os.environ.get("OPENAI_API_KEY"),
    )

    # Combine the system prompt with the user's journal entry to provide context
    user_entry_prompt = f"The user's journal entry is: '{entries}'."
    
    # Call the OpenAI GPT model
    chat_completion = client.chat.completions.create(
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_entry_prompt}
        ],
        model="gpt-3.5-turbo-1106",
        response_format={"type": "json_object"},
    )

    # Extract the response text
    suggestions = chat_completion.choices[0].message.content
    suggestions_json = json.loads(suggestions)
    return suggestions_json

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
        check_query = f"SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_Name = '{table_name}'"
        cursor.execute(check_query)
        table_exists = cursor.fetchone()[0]

        if table_exists == 0:
            # If the table doesn't exist, create it
            create_query = f"CREATE TABLE {schema}.{table_name} (date_created DATETIME, entry TEXT, entry_vector VECTOR(DOUBLE, 384), sentiment VARCHAR(255))"
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
    user_id = request.json.get('userId')
    date = request.json.get('date')
    entry = request.json.get('entry')

    # Generate embedding for the text entry
    embedding = model.encode(entry, normalize_embeddings=True).tolist()

    sentiment = get_sentiment(entry) # either get or analyze

    table_name = f"User_schema.{user_id}"
    query = f"INSERT INTO {table_name} (date_created, entry, entry_vector, sentiment) VALUES (?, ?, TO_VECTOR(?), ?)"

    conn = iris.connect(connection_string, username, password)
    cursor = conn.cursor()
    try:
        cursor.execute(query, (date, entry, str(embedding), sentiment))
        conn.commit()
    except Exception as inst:
        return jsonify({"response": str(inst)})
    finally:
        cursor.close()
        conn.close()

    return jsonify({"response": "new entry added"})

@app.route('/api/get_entry', methods=['GET'])
def getallEntries():
    user_id = request.json.get('userId')
    schema = f"User_schema"

    conn = iris.connect(connection_string, username, password)
    cursor = conn.cursor()
    try:
        check_query = f"SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '{user_id}'"
        cursor.execute(check_query)
        table_exists = cursor.fetchone()[0]

        if table_exists == 1:
            get_query = f"SELECT * FROM {schema}.{user_id}"
            cursor.execute(get_query)
            conn.commit()
            rows = cursor.fetchall()
            results = []
            for row in rows:
                results.append({
                    "date_created":row[0],
                    "entry":row[1],
                    "vectors":row[2]
                })
            return jsonify(results)
        else:
            return jsonify({"response": f""})
    except Exception as e:
        return jsonify({"error": str(e)})
    finally:
        cursor.close()
        conn.close()

@app.route('/api/edit_entry', methods=['PUT'])
def editEntry():
    return jsonify({'message': ''})

@app.route('/api/delete_entry', methods=['DELETE'])
def deleteEntry():
    return jsonify({'message': ''})

@app.route('/api/search_entries', methods=['GET'])
def searchEntries():
    search_phrase = "I am feeling sad, depressed, hopeless, lost, stressed, burdened"

    # Convert each negative-related phrase to a vector and have it in a list
    search_vector = model.encode(search_phrase, normalize_embeddings=True).tolist()

    results = []
    user_id = request.args.get('userId')  # Get the user ID from the query parameters
    table_name = f"User_schema.{user_id}"

    conn = iris.connect(connection_string, username, password)
    cursor = conn.cursor()
    try:
        # Define the SQL query with placeholders
        sql = f"""
            SELECT TOP ? date_created, entry
            FROM {table_name}
            ORDER BY VECTOR_DOT_PRODUCT(entry_vector, TO_VECTOR(?)) DESC
        """

        numberOfResults = 7 

        cursor.execute(sql, (numberOfResults, str(search_vector)))
        data = cursor.fetchall()

        # Process the results
        for row in data:
            date_created = row[0]
            entry = row[1]
            sentiment = get_sentiment(entry)
            similarity = 1 - cosine(search_vector, model.encode(entry, normalize_embeddings=True).tolist())  # Cosine similarity
            results.append((date_created, entry, similarity, sentiment))
        
        # Sort results by similarity score in descending order
        results.sort(key=lambda x: x[2], reverse=True)

        suggestions_response = None

        # Check if we have at least 3 results
        if len(results) >= 3:
            top_results = results[:3]
            # Check if the similarity scores of the top 3 results are within 0.1
            if (top_results[0][2] - top_results[2][2]) <= 0.2 and top_results[0][3] == 'negative' and top_results[1][3] == 'negative' and top_results[2][3] == 'negative':
                suggestions_response = suggestions(top_results)
                return jsonify({"response": "Top results are within similarity range", "results": suggestions_response}), 200   

    except Exception as inst:
        return jsonify({"response": str(inst)}), 500
    finally:
        cursor.close()
        conn.close()

    # Return the results
    return jsonify({"response": "No similar results found", "results": results})


if __name__ == '__main__':
    app.run(debug=True, port = 8080)  