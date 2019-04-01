from flask import Flask, render_template, redirect, url_for, jsonify, request
from flaskext.mysql import MySQL
import json
import re
from datetime import datetime as dt

app = Flask(__name__)


# Use flask_pymongo to set up mongo connection
mysql = MySQL()
 
# MySQL configurations
app.config['MYSQL_DATABASE_USER'] = 'root'
app.config['MYSQL_DATABASE_PASSWORD'] = 'password'
app.config['MYSQL_DATABASE_DB'] = 'cocktailproject'
app.config['MYSQL_DATABASE_HOST'] = 'localhost'
mysql.init_app(app)


# Route to render index.html template using data from Mongo
@app.route("/")
def home():

    return render_template("glassesV0.3.html")

@app.route("/cocktails", methods=['GET', 'POST'])
def cocktails():

    if request.method == 'GET':
        # print("+++++++++++")
        # print('Getting')
        # print("+++++++++++")

        conn = mysql.connect()
        
        conn = mysql.connect()
        cursor = conn.cursor()
        cursor.execute("SHOW columns FROM cocktails")
        columns = cursor.fetchall()
        # print(columns)
        cursor.close()
    
        cols = [col[0] for col in columns]

        conn = mysql.connect()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM cocktails")
        cocktails = cursor.fetchall()
        # print(data[0])
        cursor.close()

        recipes = []
        for j, row in enumerate(cocktails):
            this_recipe = {}
            for k, cell in enumerate(row):
                this_recipe[cols[k]] = cell 
            recipes.append(this_recipe)
        
        # print(recipes[0])
        conn = mysql.connect()
        cursor = conn.cursor()
        cursor.execute('USE cocktailproject')
        cursor = conn.cursor()
        for recipe in recipes:

            sql = f"SELECT * FROM Categories WHERE categories.Category_ID = {recipe['Category_ID']};"
            cursor.execute(sql)
            category = cursor.fetchall()
            recipe['Category']  = category[0][1]

            sql = f"SELECT * FROM Garnish_Instructions WHERE garnish_instructions.Cocktail_ID = {recipe['Cocktail_ID']};"
            # print(recipe['Cocktail_ID'])
            cursor.execute(sql)
            garnish_id = cursor.fetchall()
            if len(garnish_id) > 0:
                recipe['Garnish_ID'] = garnish_id[0][1]
            
            if 'Garnish_ID' in recipe.keys():
                sql = f"SELECT * FROM Garnishes WHERE garnishes.Garnish_ID = {recipe['Garnish_ID']};"
                cursor.execute(sql)
                garnish = cursor.fetchall()
                if len(garnish) > 0:
                    recipe['Garnish_Name'] = garnish[0][1]
            
            sql = f"SELECT * FROM Glasses WHERE glasses.Glass_ID = {recipe['Glass_ID']};"
            cursor.execute(sql)
            glass = cursor.fetchall()
            recipe['Glass_Name'] = glass[0][1]
            recipe['Glass_Size'] = glass[0][2]
            recipe['Mask'] = glass[0][3]
            recipe['Path'] = glass[0][4]
            recipe['Mask_Height'] = glass[0][5]
            recipe['Mask_Top_Margin'] = glass[0][6]

            sql = f"SELECT * FROM Ratings WHERE ratings.Cocktail_ID = {recipe['Cocktail_ID']};"
            cursor.execute(sql)
            ratings = cursor.fetchall()
            recipe['Ratings'] = []
            for rat in ratings:
                this_rat = {}
                this_rat['Rating_ID'] = rat[0]
                this_rat['Rating'] = rat[1]
                recipe['Ratings'].append(this_rat)

            sql = f"SELECT * FROM Liquid_Instructions WHERE Liquid_Instructions.Cocktail_ID = {recipe['Cocktail_ID']};"
            cursor.execute(sql)
            ingredients = cursor.fetchall()
            recipe['Ingredients'] = []
            for ing in ingredients:
                this_ing = {}
                this_ing['Liquid_Instruction_ID'] = ing[0]
                this_ing['Liquid_ID'] = ing[2]
                sql = f"SELECT * FROM Liquids WHERE liquids.Liquid_ID = {ing[2]};"
                cursor.execute(sql)
                liquid = cursor.fetchall()
                this_ing['Liquid_Name'] = liquid[0][1]
                this_ing['Measure'] = ing[3]
                this_ing['Measure_Float'] = ing[4]
                this_ing['Color'] =liquid[0][2]
            
                recipe['Ingredients'].append(this_ing)
                    
        cursor.close()
        conn.close()
            
        
        for recipe in recipes:
            measures = []
            for ingredient in recipe['Ingredients']:
                for k, v in ingredient.items():
                    if k == 'Measure_Float':
                        # print(v)
                        measures.append(float(v))
            total = sum(measures)
            # print(cocktail['Garnish_Name'], ingredient['Measure_Float'], measures, total)

            recipe['Total_Volume'] = total
        
        for recipe in recipes:
            ratings = []
            for rating in recipe['Ratings']:
                for k, v in rating.items():
                    if k == 'Rating':
                        ratings.append(int(v))
            try:
                average = round(sum(ratings)/len(ratings))
            except:
                average = 0
            recipe['Average_Rating'] = average
        
        # print(recipes[0])
        return jsonify(recipes)

    if request.method == 'POST':
        form = request.form
        rating = request.form.get('submitRating')
        recipe = request.form.get('submitRecipe')
        cocktail_id = request.form.get('submitCocktailID')
        print("====================")
        print(f"REQUEST: {request}")
        print(f"FORM: {form}")
        print(f"RATING: {rating}")
        print(f"RECIPE: {recipe}")
        print(f"COCKTAIL_ID: {cocktail_id}")
        print(f"DATE: {dt.now()}")
        print("====================")

        conn = mysql.connect()
        # cursor = conn.cursor()
        # cursor.execute('USE cocktailproject')
        # sql = f"SELECT Cocktail_ID from Cocktails WHERE Cocktails.Cocktail_ID = '{recipe}' AND Cocktails.Category_ID = '{cat_id}';"
        # cursor.execute(sql)
        # name = cursor.fetchall()
        cursor = conn.cursor()
        cursor.execute('USE cocktailproject')
        sql = f"INSERT INTO Ratings (Rating, Cocktail_ID) VALUES ('{rating}', '{cocktail_id}');"
        cursor.execute(sql)
        conn.commit()
        conn.close()
        # mongo.db.recipe_dump.update_one({'name': recipe}, {"$set": {'rating': this_rating}}, upsert=True)
        return redirect(url_for("home"))

@app.route("/liquids")
def liquids():

    conn = mysql.connect()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Liquids")
    liquids_table = cursor.fetchall()
    liquids = []
    for i in liquids_table:
        this_liq = {}
        this_liq['Liquid_ID_Liquids'] = i[0]
        this_liq['Liquid_Name'] = i[1]
        this_liq['Color'] = i[2]
        liquids.append(this_liq)
    return jsonify(liquids)

@app.route("/table")
def table():
    return render_template("table.html")

@app.route("/glasses")
def glasses():
    return render_template("glassesV0.2.html")




# @app.route("/status_spirit.html#recient")
# def redir1():
#     return redirect(url_for("https://mars.nasa.gov/mer/mission/status_spirit.html#recient"))

if __name__ == "__main__":
    app.run(host='127.0.0.1', port='5000', debug=True)

