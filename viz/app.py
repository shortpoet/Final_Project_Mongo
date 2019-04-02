from flask import Flask, render_template, redirect, Markup, url_for, jsonify, request
from flask_pymongo import PyMongo
import json
import re
from datetime import datetime as dt
import os

app = Flask(__name__)
app.debug = True

# Use flask_pymongo to set up mongo connection
# app.config['MONGO_URI'] = os.environ['MONGODB_URI'] or "mongodb://localhost:27017/cocktail_db"
app.config['MONGO_URI'] = "mongodb://localhost:27017/cocktail_db"
# app.config['MONGO_URI'] = "mongodb://test:fuck8live@ds041140.mlab.com:41140/heroku_9h70q4d7"
mongo = PyMongo(app)

# Route to render index.html template using data from Mongo
@app.route("/")
def home():

    return render_template("glassesV0.5.html")

@app.route("/cocktails", methods=['GET', 'POST'])
def cocktails():

    if request.method == 'GET':
        cocktail_db_response = mongo.db.recipe_db.find({}, {'_id': False})
        recipes = []
        for recipe in cocktail_db_response:
            # print(recipe)
            ratings = []
            # print(recipe['rating'])
            for k, v in recipe['rating'].items():
                if k == 'Rating':
                    ratings.append(int(v))
            if len(ratings) > 0:
                average = round(sum(ratings)/len(ratings))
            else: 
                average = 0
            recipe['Averge_Rating'] = average
            recipes.append(recipe)
        # print(recipes)
        return jsonify(recipes)

    if request.method == 'POST':
        form = request.form
        rating = request.form.get('submitRating')
        recipe = request.form.get('submitRecipe')
        print("====================")
        print(f"REQUEST: {request}")
        print(f"FORM: {form}")
        print(f"RATING: {rating}")
        print(f"RECIPE: {recipe}")
        print(f"DATE: {dt.now()}")
        print("====================")
        this_rating = {}
        this_rating['date_time'] = dt.now()
        this_rating['rating'] = rating
        mongo.db.recipe_db.update_one({'name': recipe}, {"$set": {'rating': this_rating}}, upsert=True)
        return redirect(url_for("home"))

# @app.route("/liquid")
# def svgs():

#     liquids_db_response = mongo.db.liquid_colors.find({}, {'_id': False})
#     liquids = []
#     for liquid in liquids_db_response:
#         liquids.append(liquid)
#     # print(recipes)
#     return jsonify(liquids)

@app.route("/table")
def table():
    return render_template("table.html")

if __name__ == "__main__":
    app.run(host='127.0.0.1', port='8000', debug=True)

