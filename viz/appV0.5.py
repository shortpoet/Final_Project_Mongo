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

    return render_template("index.html")

@app.route("/cocktails", methods=['GET', 'POST'])
def cocktails():

    if request.method == 'GET':
        # print("+++++++++++")
        # print('Getting')
        # print("+++++++++++")

        recipe_view_sql = "create or replace view recipes as \
        select categories.Category_ID, categories.Category_Name, \
        cocktails.Cocktail_ID, cocktails.Cocktail_Name, cocktails.Glass_ID, cocktails.Instructions, \
        garnish_instructions.Garnish_Instruction_ID, garnish_instructions.Garnish_ID, \
        garnishes.Garnish_Name, \
        glasses.Glass_Name, glasses.Glass_Size, glasses.Mask, glasses.`Path`, glasses.Mask_Height, glasses.Mask_Top_Margin, \
        liquid_instructions.Liquid_Instruction_ID, liquid_instructions.Liquid_ID, liquid_instructions.Measure, liquid_instructions.Measure_Float \
        from categories \
        inner join ( \
            select cocktails.Cocktail_ID, cocktails.Cocktail_Name, cocktails.Glass_ID, cocktails.Category_ID, cocktails.Instructions \
            from cocktails \
        ) cocktails on categories.Category_ID = cocktails.Category_ID \
        inner join ( \
            select garnish_instructions.Garnish_Instruction_ID, garnish_instructions.Cocktail_ID, garnish_instructions.Garnish_ID \
            from garnish_instructions \
        ) garnish_instructions on garnish_instructions.Cocktail_ID = cocktails.Cocktail_ID \
        inner join ( \
            select garnishes.Garnish_ID, garnishes.Garnish_Name \
            from garnishes \
        ) garnishes on garnishes.Garnish_ID = garnish_instructions.Garnish_ID \
        inner join ( \
            select glasses.Glass_ID, glasses.Glass_Name, glasses.Glass_Size, glasses.Mask, glasses.`Path`, glasses.Mask_Height, glasses.Mask_Top_Margin \
            from glasses \
        ) glasses on glasses.Glass_ID = cocktails.Glass_ID \
        inner join ( \
            select liquid_instructions.Liquid_Instruction_ID, liquid_instructions.Cocktail_ID, liquid_instructions.Liquid_ID, liquid_instructions.Measure, liquid_instructions.Measure_Float \
            from liquid_instructions \
        ) liquid_instructions on liquid_instructions.Cocktail_ID = cocktails.Cocktail_ID"

        conn = mysql.connect()
        
        cursor = conn.cursor()
        cursor.execute('USE cocktailproject')
        sql = "SHOW FULL TABLES IN cocktailproject"
        cursor.execute(sql)
        tables = cursor.fetchall()
        table_names = []
        for table in tables:
            table_names.append(table[0])
        if 'recipes' not in table_names:
            cursor.execute(recipe_view_sql)
            print('creating view')
        cursor.close()

        conn = mysql.connect()
        cursor = conn.cursor()
        cursor.execute("SHOW columns FROM recipes")
        columns = cursor.fetchall()
        # print(columns)
        cursor.close()
    
        cols = [col[0] for col in columns]

        conn = mysql.connect()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM recipes")
        data = cursor.fetchall()
        # print(data[0])
        cursor.close()

        recipes = []
        for j, row in enumerate(data):
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
        print("====================")
        print(f"REQUEST: {request}")
        print(f"FORM: {form}")
        print(f"RATING: {rating}")
        print(f"RECIPE: {recipe}")
        print(f"DATE: {dt.now()}")
        print("====================")

        conn = mysql.connect()
        cursor = conn.cursor()
        cursor.execute('USE cocktailproject')
        sql = f"SELECT Cocktail_ID from Cocktails WHERE Cocktails.Cocktail_Name = {recipe};"
        cursor.execute(sql)
        name = cursor.fetchall()
        cursor = conn.cursor()
        cursor.execute('USE cocktailproject')
        sql = f"INSERT INTO Ratings WHERE ratings.Cocktail_ID = {name[0][0]} (Rating) VALUES ('{rating}');"
        cursor.execute(sql)
        conn.commit()
        conn.close()
        # mongo.db.recipe_dump.update_one({'name': recipe}, {"$set": {'rating': this_rating}}, upsert=True)
        return redirect(url_for("glasses"))

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

