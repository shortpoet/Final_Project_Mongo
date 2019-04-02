
import pandas as pd
import numpy as np
import json
import os
import re
import pymongo
from credentials_local import user, password, rds_host
from boston_functions import *
from fractions import Fraction
import re
from liquid import liquids
from garnish import garnishes
import random
from datetime import datetime as dt

pd.set_option('display.max_colwidth', -1)
pd.set_option('display.max_columns', None)  

#import mr boston cocktail database
data = pd.read_csv("mr-boston-all-glasses.csv")
#locate data
data = data[data.loc[:, "glass-size"].notna()]

valid_units = ["oz", "tsp", "splash", "dash"]

fill_liquid = ["ginger ale", "carbonated water", "cola", "water", "chilled champagne", "soda water", 
               "club soda", "ginger ale or soda water", "lemon-lime soda", "ginger beer", "bitter lemon soda",
               "apple juice", "orange juice"]

invaild_ingredients = ['chopped', 'cut in half', 'cut in halves', 'cut into halves', 'flamed', 'hulled', 'long',
                       'skinned','whipped', "preferably b.a. reynold's", 'preferably jamaican', 'preferably japanese', 
                       'preferably pedro ximenez', "such as bittermen's elemakule", 'such as demerara', 
                       'such as islay or skye', 'such as nasturtium']

ingredient_indices = range(3, 14)

#get all recipe data
all_recipes, measures = get_cocktail_recipes(data, ingredient_indices, liquids, garnishes, invaild_ingredients, valid_units)

#set categories list
categories = list(set(data.iloc[:, 1])) + ["AI Instant Classic"]

############################
# COCKTAIL RECIPES TO TEXT #
############################
with open('mr_boston_cocktails.txt', 'w') as text_file:
    for i in range(len(all_recipes)):
        cocktail_string = all_recipes[i]['name'] + " - "
        cocktail_string += all_recipes[i]['glass'] + " - "
        for measurement, ingredient in all_recipes[i]["recipe"]:
            cocktail_string += measurement + " " + ingredient + " - "
        cocktail_string += all_recipes[i]['instructions']
        text_file.write(cocktail_string + "\n")

###################
# POPULATE TABLES #
###################

for recipe in all_recipes:
    recipe['Ingredients'] = []
    
    #find total glass volume
    total_glass_volume = recipe["glass_size"]
    #set total liquid measure to 0
    total_liquid_measure = 0
    for measure, ingredient in recipe['recipe']:
        measure = measure.strip()
        if measure == "add":
            recipe['Garnish_Instructions'] = measure
            recipe['Garnish'] = ingredient
#         elif ingredient == "pimm's cup":#pimm's cup did not make it onto out liquids list
#             pass

        else:
            this_ing = {}
            #add to lists
            this_ing['Liquid'] = ingredient
            this_ing['Measure'] = measure
        ### CONVERTING MEASURES TO FLOAT ###
            #split measure on spaces
            split_measure = measure.split(" ")

            #if measure is compound fraction,
            if len(split_measure) > 2:
                #recombine compound fraction
                measure = split_measure[0]+" "+split_measure[1]
                #convert to float
                measure_float = float(sum(Fraction(s) for s in measure.split()))
                #add to dict
                this_ing['Measure_Float'] = measure_float
                #add measure to drink's total measure
                total_liquid_measure += measure_float
            #if measure is an integer,
            elif len(split_measure) > 1:
                #convert to float
                measure_float = float(sum(Fraction(s) for s in split_measure[0].split()))
                #if unit is smaller than oz, convert measure to oz
                if split_measure[1][:3] == "tsp":
                    measure_float = measure_float / 6
                elif split_measure[1][:4] == "dash":
                    measure_float = measure_float / 32
                elif split_measure[1][:6] == "splash":
                    measure_float = measure_float / 5
                #add to float list
                this_ing['Measure_Float'] = measure_float
                #add measure to drink's total measure
                total_liquid_measure += measure_float
            #if measure if fill,
            elif split_measure[0] == "fill":
                #calculate remaining volume
                remaining_volume = float(total_glass_volume) - float(total_liquid_measure)
                #set fill measure to half remaining volume
                measure_float = float(remaining_volume / 2)
                #add to float list
                this_ing['Measure_Float'] = measure_float
            else:
                measure_float = float(0)
                this_ing['Measure_Float'] = measure_float
        recipe['Ingredients'].append(this_ing)

for recipe in all_recipes:
    vols = []
    for ingredient in recipe['Ingredients']:
        vols.append(ingredient['Measure_Float'])
        if ingredient['Liquid'][:6] == "rose's":
            ingredient['Liquid'] = ingredient['Liquid'][7:]
        elif ingredient['Liquid'][:8] =="peychaud": 
            ingredient['Liquid'] = "peychauds bitters"
    recipe['Total_Volume'] = sum(vols)
           

for recipe in all_recipes:
    recipe['Cocktail_Name'] = recipe.pop('name')
    recipe['Category'] = recipe.pop('category')
    recipe['Instructions'] = recipe.pop('instructions')
    recipe['Glass_Size'] = recipe.pop('glass_size')
    recipe['Glass'] = recipe.pop('glass')
    recipe.pop('recipe')
        
#AI Recipes load

#create glass list
glasses = []
for i in range(len(all_recipes)):
    glasses.append(all_recipes[i]["Glass"])
glasses = list(set(glasses))

df = pd.DataFrame(all_recipes)

#create glass sizes list
glass_sizes = []
for glass in glasses:
    sizes = df.loc[df["Glass"] == glass, "Glass_Size"]
    glass_sizes.append(list(sizes)[0])
    
#create glass size dictionary
glass_size_dict = {}
for i in range(len(glasses)):
    glass_size_dict[glasses[i]] = glass_sizes[i]
glass_size_dict

text_files = ["MACKs_AI_Classics_2.txt", "MACKs_AI_Classics_5.txt", "MACKs_AI_Classics_10.txt"]

def parse_ai_text(text_file):
    #to track how many records are dropped due to what criteria
    all_lines = 0
    good_cocktails = 0
    too_many_ingredients = 0
    wrong_glass = 0
    bad_instructions = 0
    bad_volume = 0
    
    #open text file to read
    with open(text_file, "r") as file:
        for line in file:
    #         print(line)
            #split line
            split_line = line.split(" - ")
            all_lines += 1

            #get name
            name = split_line[0]
            print(f"COCKTAIL NAME: {name}")

            #get glass
            glass = split_line[1]
            print(f"GLASS NAME: {glass}")

            #get instructions
            instructions = split_line[-1:][0][:-1]
            instructions = re.sub(r'["]', '\'', instructions)
            print(f"INSTRUCTIONS: {instructions}")


            garnish_list = []
            measure_list = []
            measure_float_list = []
            liquid_list = []
            total_volume = 0
            try:
                glass_volume = glass_size_dict[glass]
            except KeyError:
                glass_volume = 0
            
            recipe = {}

            #get number of ingredients (split length minus name, glass, instructions)
            ingredients_length = len(split_line) - 3
            #loop over ingredients
            for i in range(3, ingredients_length + 2):
                this_ing = {}
                ingredient = split_line[i]

                #if ingredient begins with 'add', its a garnish
                if ingredient[:3] == "add":
                    recipe['Garnish'] = ingredient.split("add ")[1]
                    recipe['Garnish_Instructions'] = ingredient.split("add ")[0]
                    
                    

                #if ingredient starts with 'fill',
                elif split_line[i][:4] == "fill":
                    measure_list.append("fill")
                    print("MEASURE: fill")

                    #get liquid ingredient
                    liquid = split_line[i].split("fill ")[1]
                    liquid_list.append(liquid.strip())
                    print(f"LIQUID NAME: {liquid}")

                    #calculate measure_float
                    remaining_volume = float(glass_volume) - float(total_volume)
                    measure_float = float(remaining_volume / 2)
                    measure_float_list.append(measure_float)
                    print(f"MEASURE FLOAT: {measure_float}")

                   


                else:
                    try:
                        #if ingredient begins with number, its a meausure and a liquid
                        int(ingredient[:1])
                    except ValueError:
                        pass
                    #split ingredient on spaces
                    split_ingredient = ingredient.split(" ")                

                    #loop over splits
                    for j in range(len(split_ingredient)):
                        #if split is unit of measure, check for compound fraction
                        if split_ingredient[j] in ["oz", "dash", "splash", "tsp"]:
                            units = split_ingredient[j].strip()                        

                            #if j-2 > -1, there is a compound fraction
                            if j-2 > -1:
                                #get 2 parts of compound fraction
                                fraction = split_ingredient[j-1].strip()
                                whole_number = split_ingredient[j-2].strip()                           

                                #recombine compound fraction
                                measure = whole_number+ " " +fraction
                                measure_list.append(measure + " " + units)
                                print(f"MEASURE: {measure + ' ' + units}")

                                #get liquid ingredient
                                liquid = ingredient.split(measure + " " + units)[1]
                                liquid_list.append(liquid.strip())                            
                                print(f"LIQUID: {liquid}")

                                #convert measure to float
                                try:
                                    measure_float = float(sum(Fraction(s) for s in measure.split()))
                                except ValueError:
                                    pass

                                #if unit is smaller than oz, convert measure to oz
                                if ingredient[:3] == "tsp":
                                    measure_float = measure_float / 6
                                elif ingredient[:4] == "dash":
                                    measure_float = measure_float / 32
                                elif ingredient[:6] == "splash":
                                    measure_float = measure_float / 5
                                measure_float_list.append(measure_float)
                                print(f"MEASURE FLOAT: {measure_float}")

                                #add measure to total volume
                                total_volume += measure_float

                            else: #just a single number or fraction
                                #get measure
                                measure = split_ingredient[j-1].strip()
                                measure_list.append(measure + " " + units)
                                print(f"MEASURE: {measure + ' ' + units}")


                                #get liquid ingredient
                                liquid = ingredient.split(measure + " " + units)[1]
                                liquid_list.append(liquid.strip())
                                print(f"LIQUID: {liquid}")

                                #convert to float
                                measure_float = float(sum(Fraction(s) for s in measure.split()))
                                #if unit is smaller than oz, convert measure to oz
                                if ingredient[:3] == "tsp":
                                    measure_float = measure_float / 6
                                elif ingredient[:4] == "dash":
                                    measure_float = measure_float / 32
                                elif ingredient[:6] == "splash":
                                    measure_float = measure_float / 5
                                measure_float_list.append(measure_float)
                                print(f"MEASURE FLOAT: {measure_float}")

                                #add measure to total volume    
                                total_volume += measure_float

            #if more than 6 ingredients, skip
            if len(split_line) > 10:
                print("INGREDIENTS ERRORRRRRRRRRRR")
                too_many_ingredients += 1
                pass

            elif glass not in glasses:
                print("GLASS ERRORRRRRRRRRR")
                wrong_glass += 1
                pass

            elif instructions[:3] == "add":
                print("INSTRUCTIONS ERRORRRRRRRRR")
                bad_instructions += 1
                pass 

            elif total_volume > glass_volume:
                print("VOLUME ERRORRRRRRRRRRRR")
                bad_volume += 1

            else:
                print("+++++++++++++++++++++++ GOOOD ++++++++++++++++++++")
                good_cocktails += 1
                
                #insert cocktail name and instructions into cocktail table
                recipe['Cocktail_Name'] = name
                print(name)
                recipe['Instructions'] = instructions
                recipe['Glass'] = glass
                recipe['Glass_Size'] = glass_volume
                recipe['Category'] = 'AI Instant Classic'
                
                
                recipe['Ingredients'] = []
                for i in range(len(liquid_list)):
                    this_ing = {}
                    this_ing['Liquid'] = liquid_list[i]
                    this_ing['Measure'] = measure_list[i]
                    this_ing['Measure_Float'] = measure_float_list[i]
                    recipe['Ingredients'].append(this_ing)
                print(recipe)
                all_recipes.append(recipe)
    
            print("----------------------")
    

    # print(all_lines, too_many_ingredients, wrong_glass, bad_instructions, bad_volume, good_cocktails)
    print("####################################")


for file in text_files:
    parse_ai_text(file)

####################
### LIQUID TABLE ###
####################
#import colors for liquids
liquid_colors = pd.read_csv("Liquid_Colors_Final.csv")

color_dict_list = liquid_colors.to_dict(orient='records')
liquid_list = list(liquid_colors['liquids'])

for recipe in all_recipes:
    for ingredient in recipe['Ingredients']:
        for color_dict in color_dict_list:
            if ingredient['Liquid'] not in liquid_list:
                #generate random hex color
                ingredient['Color'] = "#{:06x}".format(random.randint(0, 0xFFFFFF))
                #insert new liquid and color into liquids table
            else:
                if ingredient['Liquid'] == color_dict['liquids']:
                    ingredient['Color'] = color_dict['color']

###################
### ADD RATINGS ###
###################

for recipe in all_recipes:
    recipe['Ratings'] = []
    for i in range(8):
        this_rat = {}
        this_rat['Rating'] = random.randint(1,5)
        this_rat['date_time'] = dt.now()
        recipe['Ratings'].append(this_rat)

### GLASS SVG DATA ###
#import glass svg data
svg_data = pd.read_csv("the_glasses.csv")
svg_dict_list = svg_data.to_dict(orient='records')

glasses = []
glass_dicts = []
for recipe in all_recipes:
    if recipe['Glass'] not in glasses:
        this_glass = {}
        this_glass['glass_name'] = recipe['Glass']
        this_glass['glass_size'] = recipe['Glass_Size']
        glasses.append(recipe['Glass'])
        glass_dicts.append(this_glass)
glass_df = pd.DataFrame(glass_dicts)

for recipe in all_recipes:
    for svg in svg_dict_list:
        if recipe['Glass'] == svg['name']:
            print('matching_glass')
            recipe['Mask'] = svg['mask']
            recipe['Path'] = svg['path']
            recipe['Mask_Height'] = svg['maskHeight']
            recipe['Mask_Top_Margin'] = svg['maskTopMargin']



conn = 'mongodb://localhost:27017/cocktail_db'

client = pymongo.MongoClient(conn)

mongoDb = client.heroku_9h70q4d7
# mongoDb = client.cocktail_db

collection = mongoDb.recipe_db

collection.insert_many(all_recipes)

collection = mongoDb.liquid_colors

collection.insert_many(color_dict_list)
