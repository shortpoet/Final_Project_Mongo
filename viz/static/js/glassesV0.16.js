
var cocktail_endpoint = 'cocktails'
var liquid_endpoint = 'liquids'


// Define SVG area dimensions
var svgWidth = 720;
var svgHeight = 720;
// Define the chart's margins as an object
var margin = {
  top: 5,
  right: 5,
  bottom: 5,
  left: 5
};

// Define dimensions of the chart area
var glassWidth = svgWidth - margin.left - margin.right;
var glassHeight = svgHeight - margin.top - margin.bottom;

// Select body, append SVG area to it, and set its dimensions
var svg = d3.select("#glasses")
  .append("svg")
  .attr('id', 'svg')
  .attr("width", glassWidth)
  .attr("height", glassHeight)
  .attr('viewBox', '0 -5 110 911')

function drawInput(cocktail_endpoint) {
  d3.json(cocktail_endpoint).then(function(cocktails) {
    d3.json(liquid_endpoint).then(function(liquids){
      var recipeNames = cocktails.map(x => x.Cocktail_Name);
      var recipeSet = new Set(recipeNames);
      var recipeArr = [...recipeSet]
      var recipeSorted = recipeArr.sort((a,b) => a > b ? 1 : a === b ? 0 : -1);
      var ingredientNames = liquids.map(x => x.Liquid_Name);
      var ingredientSet = new Set(ingredientNames);
      var ingredientArr = [...ingredientSet]
      var ingredientSorted = ingredientArr.sort((a,b) => a > b ? 1 : a === b ? 0 : -1);
      var cats = ['Whiskies', 'Vodka', 'Rum - Daiquiris', 'Shooters', 'Tequila', 'Brandy', 'Cocktail Classics', 'Non-alcoholic Drinks', 'Cordials and Liqueurs', 'Gin', 'Rum', 'AI Instant Classic']
      var catsSorted = cats.sort((a,b) => a > b ? 1 : a === b ? 0 : -1)
      // console.log(ingredientSorted)
      var recSearchBox = d3.select('#recipesSearch').append('div').classed('form-group', true).append('label')
        .attr('for', 'recipeSearch')
        .text('Search for Recipe')
      var recSearchInput = recSearchBox.append('input').classed('form-control', true)
        .attr('id', 'recipeSearch')
        .attr('type', 'text')
        .attr('placeholder', 'Search for Recipe')
        .attr('aria-label', 'Search for Recipe (autocomplete)')
      var chosenRecipe = 'Adam and Eve'
      // drawGlass(cocktail_endpoint, chosenRecipe)
      autocomplete(document.getElementById('recipeSearch'), recipeSorted);
      var recSubmit = recSearchBox.append('button')
        .attr('type', 'submit')
        .attr('class', 'btn btn-default')
        .attr('id', 'recSubmitSearch')
        .text('Search')
        .on('click', function(d, i){
          d3.select('table').remove()
          var chosenRecipe = document.getElementById('recipeSearch').value
          console.log(chosenIngred)
          drawTable(cocktail_endpoint, chosenRecipe, 'recipe')
          svg.remove()
          svg = d3.select("#glasses")
            .append("svg")
            .attr('id', 'svg')
            .attr("width", svgWidth)
            .attr("height", svgHeight)
            .attr('viewBox', '0 -5 110 110')
          var chosenRecipe = document.getElementById('recipeSearch').value
          console.log(chosenRecipe)
          drawGlass(cocktail_endpoint, chosenRecipe)
        })
      var ingSearchBox = d3.select('#ingrSearch').append('div').classed('form-group', true).append('label')
        .attr('for', 'ingredSearch')
        .text('Search for Ingredient')
      var ingSearchInput = ingSearchBox.append('input').classed('form-control', true)
        .attr('id', 'ingredSearch')
        .attr('type', 'text')
        .attr('placeholder', 'Rum')
        .attr('aria-label', 'Search for Ingredient (autocomplete)')
      autocomplete(document.getElementById('ingredSearch'), ingredientSorted);
      var ingSubmit = ingSearchBox.append('button')
        .attr('type', 'submit')
        .attr('class', 'btn btn-default')
        .attr('id', 'submitSearch')
        .text('Search')
        .on('click', function(d, i){
          d3.select('table').remove()
          var chosenIngred = document.getElementById('ingredSearch').value
          console.log(chosenIngred)
          drawTable(cocktail_endpoint, chosenIngred, 'ingredient')
        })

      var catSearchBox = d3.select('#catSearch').append('div').classed('form-group', true).append('label')
        .attr('for', 'catSearch')
        .text('Search for Category')
      var catSearchInput = catSearchBox.append('input').classed('form-control', true)
        .attr('id', 'categSearch')
        .attr('type', 'text')
        .attr('placeholder', 'Search for Category')
        .attr('aria-label', 'Search for Category (autocomplete)')
      autocomplete(document.getElementById('categSearch'), catsSorted);
      var catSubmit = catSearchBox.append('button')
        .attr('type', 'submit')
        .attr('class', 'btn btn-default')
        .attr('id', 'submitCatSearch')
        .text('Search')
        .on('click', function(d, i){
          d3.select('table').remove()
          var chosenCateg = document.getElementById('categSearch').value
          console.log(chosenIngred)
          drawTable(cocktail_endpoint, chosenCateg, 'category')
        })

      var generate = d3.select('#generate').append('button')
        .attr('type', 'submit')
        .attr('class', 'btn btn-default')
        .attr('id', 'generateButton')
        .text('Generate')
    })
  })
}
drawInput(cocktail_endpoint)

function drawMultiple() {
  d3.json('liquid').then(function(liquids_colors) {
    var liquids = []
    liquids_colors.forEach(x => {
      Object.entries(x).forEach(([k,v]) => {
       if ( k === 'liquids') {
        liquids.push(v)
       }
      })
    })
    console.log(liquids)
    var multiple = d3.select('#multipleSearch').append('select')
      .attr('multiple', 'multiple')
      .attr('name', 'liquids[]')
      .attr('class', 'js-example-basic-multiple')
      .style('width', '100%')
    var options = multiple.selectAll('option').data(liquids)
      .enter()
      .append('option')
      .attr('value', d => d)
      .attr('id', d => d)
      .text(d => d)
    var sel_data = []
    var i = 0
    liquids.forEach(liquid => {
      var this_liq = {'id': i, 'text': liquid}
      sel_data.push(this_liq)
      i++
    })
    $(document).ready(function(){
      $("#multipleSearch").select2({
        data: sel_data,
        allowClear: true
      })
    })
  })
}
// drawMultiple()

function autocomplete(inp, arr) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function(e) {
    var a, b, i, val = this.value;
    /*close any already open lists of autocompleted values*/
    closeAllLists();
    if (!val) { return false;}
    currentFocus = -1;
    /*create a DIV element that will contain the items (values):*/
    a = document.createElement("DIV");
    a.setAttribute("id", this.id + "autocomplete-list");
    a.setAttribute("class", "autocomplete-items");
    /*append the DIV element as a child of the autocomplete container:*/
    this.parentNode.appendChild(a);
    /*for each item in the array...*/
    for (i = 0; i < arr.length; i++) {
      /*check if the item starts with the same letters as the text field value:*/
      if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
        /*create a DIV element for each matching element:*/
        b = document.createElement("DIV");
        /*make the matching letters bold:*/
        b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
        b.innerHTML += arr[i].substr(val.length);
        /*insert a input field that will hold the current array item's value:*/
        b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
        /*execute a function when someone clicks on the item value (DIV element):*/
            b.addEventListener("click", function(e) {
            /*insert the value for the autocomplete text field:*/
            inp.value = this.getElementsByTagName("input")[0].value;
            /*close the list of autocompleted values,
            (or any other open lists of autocompleted values:*/
            closeAllLists();
        });
        a.appendChild(b);
      }
    }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function(e) {
    var x = document.getElementById(this.id + "autocomplete-list");
    if (x) x = x.getElementsByTagName("div");
    if (e.keyCode == 40) {
      /*If the arrow DOWN key is pressed,
      increase the currentFocus variable:*/
      currentFocus++;
      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 38) { //up
      /*If the arrow UP key is pressed,
      decrease the currentFocus variable:*/
      currentFocus--;
      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 13) {
      /*If the ENTER key is pressed, prevent the form from being submitted,*/
      e.preventDefault();
      if (currentFocus > -1) {
        /*and simulate a click on the "active" item:*/
        if (x) x[currentFocus].click();
      }
    }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
      x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
    closeAllLists(e.target);
  });
}

function drawGlass(cocktail_endpoint, chosenRecipe, chosenCateg) {
	d3.json(cocktail_endpoint).then(function(cocktails) {
      // console.log(cocktails)
      console.log(chosenCateg)
      var recipe = cocktails.filter(datum => datum.Cocktail_Name == chosenRecipe && datum.Category == chosenCateg)
      console.log(recipe)
      var maskTopMargin = recipe[0]['Mask_Top_Margin']
      var maskHeight = recipe[0]['Mask_Height']
      var ings = recipe[0]['Ingredients'].map(x=>x.Liquid)
      var ingVals = recipe[0]['Ingredients'].map(x=>x.Measure_Float)
      var ingValsRead = recipe[0]['Ingredients'].map(x=>x.Measure)
      var ingCols = recipe[0]['Ingredients'].map(x=>x.Color).reverse()
      console.log(maskTopMargin, maskHeight, ings, ingVals)
      var volume = recipe[0]['Total_Volume']
      console.log(volume)
      var name = recipe[0]['Cocktail_Name']
      var cocktail_id = recipe[0]['Cocktail_ID']
      var avg_rating = recipe[0]['Average_Rating']
      
      var defs = svg.append('defs')
        .append('g')
        .attr('id', 'def')

      var clip = defs.append('clipPath').attr('id', 'clip')
        .selectAll('path').data(recipe)
        .enter()
        .append('path')
        .attr('d', d => d.Mask)

      var starDef = svg.append('defs')
        .append('g')
        .attr('id', 'starDef')
        .append('svg')
        .attr('height', 25)
        .attr('width', 23)
        .attr('viewBox', '0 0 180 180')
        .attr('class', 'star rating')
        .append('polygon')
        .attr('class', 'star')
        .attr('points', "9.9, 1.1, 3.3, 21.78, 19.8, 8.58, 0, 8.58, 16.5, 21.78")
        .style('fill-rule', 'nonzero')
        
      // Append a group area, then set its margins
      var glassGroup = svg.append("g").attr('id', 'glass_group')
        .attr("transform", `translate(${margin.left - 3}, ${margin.top})`);

      var nameGroup = glassGroup.append('g')
        .attr('transform', 'translate(38, -4)')
        .attr('id', 'nameGroup')
      var nameText = nameGroup.append('text')
        .text(`${name}`)
        .style('font-size', 5)
        .style('fill', 'purple')
        .style('text-align', 'center')
      var nameRatingGroup = nameGroup.append('g')
        .attr('id', 'nameRatingGroup')
        .attr('transform', 'translate(2.5, 0)')
        .attr('class', 'stars')

      switch (avg_rating) {
        case 1:
          var nameStars1 = nameRatingGroup.append('use')
            .attr('transform', 'translate(8, 2)')
            .attr('id', 'name-stars1')
            .attr("xlink:href","#starDef")
          break
        case 2:
          var nameStars1 = nameRatingGroup.append('use')
            .attr('transform', 'translate(8, 2)')
            .attr('id', 'name-stars1')
            .attr("xlink:href","#starDef")
          var nameStars2 = nameRatingGroup.append('use')
            .attr('transform', 'translate(13, 2)')
            .attr('id', 'name-stars2')
            .attr("xlink:href","#starDef")
          break
        case 3:
          var nameStars1 = nameRatingGroup.append('use')
            .attr('transform', 'translate(8, 2)')
            .attr('id', 'name-stars1')
            .attr("xlink:href","#starDef")
          var nameStars2 = nameRatingGroup.append('use')
            .attr('transform', 'translate(13, 2)')
            .attr('id', 'name-stars2')
            .attr("xlink:href","#starDef")
          var nameStars3 = nameRatingGroup.append('use')
            .attr('transform', 'translate(18, 2)')
            .attr('id', 'name-stars3')
            .attr("xlink:href","#starDef")
          break
        case 4:
          var nameStars1 = nameRatingGroup.append('use')
            .attr('transform', 'translate(8, 2)')
            .attr('id', 'name-stars1')
            .attr("xlink:href","#starDef")
          var nameStars2 = nameRatingGroup.append('use')
            .attr('transform', 'translate(13, 2)')
            .attr('id', 'name-stars2')
            .attr("xlink:href","#starDef")
          var nameStars3 = nameRatingGroup.append('use')
            .attr('transform', 'translate(18, 2)')
            .attr('id', 'name-stars3')
            .attr("xlink:href","#starDef")
          var nameStars4 = nameRatingGroup.append('use')
            .attr('transform', 'translate(23, 2)')
            .attr('id', 'name-stars4')
            .attr("xlink:href","#starDef")
          break
        case 5:
          var nameStars1 = nameRatingGroup.append('use')
            .attr('transform', 'translate(8, 2)')
            .attr('id', 'name-stars1')
            .attr("xlink:href","#starDef")
          var nameStars2 = nameRatingGroup.append('use')
            .attr('transform', 'translate(13, 2)')
            .attr('id', 'name-stars2')
            .attr("xlink:href","#starDef")
          var nameStars3 = nameRatingGroup.append('use')
            .attr('transform', 'translate(18, 2)')
            .attr('id', 'name-stars3')
            .attr("xlink:href","#starDef")
          var nameStars4 = nameRatingGroup.append('use')
            .attr('transform', 'translate(23, 2)')
            .attr('id', 'name-stars4')
            .attr("xlink:href","#starDef")
          var nameStars5 = nameRatingGroup.append('use')
            .attr('transform', 'translate(28, 2)')
            .attr('id', 'name-stars5')
            .attr("xlink:href","#starDef")
          break
      }      

      var glassPath = glassGroup.selectAll('path').data(recipe)
        .enter()
        .append('path')
        .attr('d', d => d.Path)
        .attr('fill', 'none')
        .attr('stroke', '#000')
        .attr('stroke-width', '.265')

      var ingrRectGroup = glassGroup.append('g')
        .attr('id', 'ingrRectGroup')

      var y = 0
      var ingrRect = ingrRectGroup.selectAll('rect').data(ingVals)
        .enter()
        .append('rect')
        .attr('x', 0)
        .attr('y', maskTopMargin)
        .attr('height', (d,i) => {
          this_arr = ingVals.slice(0, ingVals.length + y)
          console.log(this_arr)
          this_arr = this_arr.map(x=>x/volume*maskHeight)
          console.log(this_arr)
          console.log(this_arr.reduce((a,b)=> a + b, 0))
          y -= 1
          return this_arr.reduce((a,b)=> a + b, 0)
        })
        .attr('width', 60)
        .attr('clip-path', 'url(#clip)') 
        .style('fill', (d,i) => ingCols[i])

      var ingrTextGroup = ingrRectGroup.append('g')
        .attr('id', 'ingrTextGroup')
        .attr("transform", `translate(${margin.left + 50}, ${margin.top})`);

      var k = 0
      var rectHeights = d3.selectAll('rect').nodes().map(x=>x.getBBox().height).reverse()
      console.log(rectHeights)
      var ingrText = ingrTextGroup.selectAll('text').data(ings)
        .enter()
        .append('text')
        .attr('x', 0)
        .attr('y', (d,i) => {
          while (i < rectHeights.length) {
            if (i == 0) {
              // console.log(rectHeights[i])
              return (rectHeights[i]/2)
            }
            else {
              // console.log(rectHeights[i])
              return ((rectHeights[i] - rectHeights[i-1]) / 2) + rectHeights[i-1]
            }
          }
        })
        .text((d, i) => ingValsRead[i] + "  -  " + d)  
        .style('font-size', 2)
        .style('fill', 'black')
        .style('text-align', 'center')
        .classed('ingrText', true)

      var borderPath = glassGroup.append("rect")
        .attr("x", 0)
        .attr("y", -9)
        .attr("height", 75)
        .attr("width", 105)
        .style("stroke", 'black')
        .style("fill", "none")
        .style("stroke-width", .75);
      
      console.log(recipe[0])
      var instructions = recipe[0]['Instructions']
      instructions = instructions.split('.').slice(0, -1)
      var instrDiv = d3.select('#instructions')
        .style('border', '5px solid black')
        .attr("transform", `translate(0, -5px)`)
        // .style('height', 480 +'px')
      instrGroup = instrDiv.append('g')
        .attr('id', 'instrGroup')
      instrGroup.append('br')
      instrGroup.append('hr')
      instrGroup.append('hr')
      instrGroup.append('br')
      instrGroup.append('h5')
        .text('Instructions:')
        .style('text-align', 'center')
        .style('color', 'blueviolet')
      instrGroup.append('ul')
        .style('padding', '35px 0px 0px 10px')
        .selectAll('li')
        .data(instructions)
        .enter()
        .append('li')
        .text(d=>d)
        .style('font-size', 16 + 'px')
        .style('color', 'green')
        .style('text-align', 'center')
        .classed('instrText', true)
        .append('hr')
        .append('br')

      var starGroup = glassGroup.append('g')
        .attr('transform', 'translate(2.5, 0)')
        .attr('class', 'stars')
        .attr('data-stars', 1)
      
      var isSaveClicked = false
      function drawRating(rating) {
        console.log('drawRatingggggggggggggggggg')
        var ratingGroup = glassGroup.append('g')
          .attr('transform', 'translate(38, 60)')
          .attr('id', 'ratingGroup')
        var ratingForm = instrDiv.append('form')
          .attr('method', 'POST')
          .attr('action', '/' + cocktail_endpoint)
          .attr('name', 'ratingForm')
          .attr('enctype', 'multipart/form-data')
          .append('input')
          .attr('name', 'submitRating')
          .attr('value', '')
          .attr('type', 'hidden')
          .attr('id', 'submitRating')
          .append('input')
          .attr('name', 'submitRecipe')
          .attr('value', '')
          .attr('type', 'hidden')
          .attr('id', 'submitRecipe')
          .append('input')
          .attr('name', 'submitCocktailID')
          .attr('value', '')
          .attr('type', 'hidden')
          .attr('id', 'submitCocktailID')

        var ratingText = ratingGroup.append('text')
          .text(`Click to save ${rating} star rating`)
          .style('font-size', 5)
          .style('fill', '#d8d8d8')
          .style('text-align', 'center') 
          .on('mouseover', function(){
            if (isSaveClicked === false) {
            d3.select(this)
              .style('fill', '#ffd055')
            }
          }) 
          .on('mouseout', function(){
            if (isSaveClicked === false) {
              d3.select(this)
                .style('fill', '#d8d8d8')
            }
          }) 
          .on('click', function(){
            //  write to database
            if (isSaveClicked === false) {
              console.log('write to db')
              var selectedRating = document.getElementById('submitRating')
              var form = document.forms['ratingForm']
              console.log(selectedRating)
              console.log(form)
              d3.select(this).style('fill', '#ffd055')
              form.submit()
              isSaveClicked = true
            }
          })
      }

      var isClicked = false
      var dataStars1 = starGroup.append('g')
        .attr('transform', 'translate(0, 75)')
        .append('svg')
        .attr('data-rating', 1)
        .attr('id', 'data-stars1')
        .attr('height', 25)
        .attr('width', 23)
        .attr('viewBox', '0 0 26 26')
        .attr('class', 'star rating')
        .append('polygon')
        .attr('points', "9.9, 1.1, 3.3, 21.78, 19.8, 8.58, 0, 8.58, 16.5, 21.78")
        .style('fill-rule', 'nonzero')
        .on('mouseover', function(){
          if (isClicked === false) {
            var s = d3.select('#data-stars1 polygon')
            s.style('fill', '#ffd055')
          }
        })
        .on('mouseout', function(){
          if (isClicked === false) {
            var s = d3.select('#data-stars1 polygon')
            s.style('fill', '#d8d8d8')
          }
        })
        .on('click', function(){
          var g = d3.select('#data-stars1')
          var s = g.select('polygon')
          if (isClicked === false) {
            isClicked = true
            s.style('fill', '#ffd055')
            g.classed('selectedRating', true)
            d3.select('#ratingGroup').remove()
            var rating = g.attr('data-rating') 
            drawRating(rating)
            console.log(rating)
            d3.select('#submitRating').attr('value', rating)
            d3.select('#submitRecipe').attr('value', name)
            d3.select('#submitCocktailID').attr('value', cocktail_id)
          }
          else {
            isClicked = false
            g.classed('selectedRating', false)
            d3.select('#ratingGroup').remove()
          }
        })
      var dataStars2 = starGroup.append('g')
        .attr('transform', 'translate(20, 75)')
        .append('svg')
        .attr('data-rating', 2)
        .attr('id', 'data-stars2')
        .attr('height', 25)
        .attr('width', 23)
        .attr('viewBox', '0 0 26 26')
        .attr('class', 'star rating')
        .append('polygon')
        .attr('points', "9.9, 1.1, 3.3, 21.78, 19.8, 8.58, 0, 8.58, 16.5, 21.78")
        .style('fill-rule', 'nonzero')
        .on('mouseover', function(){
          if (isClicked === false) {
            var s = d3.select('#data-stars1 polygon')
            var t = d3.select('#data-stars2 polygon')
            s.style('fill', '#ffd055')
            t.style('fill', '#ffd055')
          }
        })      
        .on('mouseout', function(){
          if (isClicked === false) {
            var s = d3.select('#data-stars1 polygon')
            var t = d3.select('#data-stars2 polygon')
            s.style('fill', '#d8d8d8')
            t.style('fill', '#d8d8d8')
          }
        })  
        .on('click', function(){
          var g = d3.select('#data-stars2')
          var s = d3.select('#data-stars1 polygon')
          var t = g.select('polygon')
          if (isClicked === false) {
            isClicked = true
            s.style('fill', '#ffd055')
            t.style('fill', '#ffd055')
            g.classed('selectedRating', true)
            d3.select('#ratingGroup').remove()
            var rating = g.attr('data-rating') 
            drawRating(rating)
            console.log(rating)
            d3.select('#submitRating').attr('value', rating)
            d3.select('#submitRecipe').attr('value', name)
            d3.select('#submitCocktailID').attr('value', cocktail_id)
          }
          else {
            isClicked = false
            g.classed('selectedRating', false)
            d3.select('#ratingGroup').remove()
          }
        })
      var dataStars3 = starGroup.append('g')
        .attr('transform', 'translate(40, 75)')
        .append('svg')
        .attr('data-rating', 3)
        .attr('id', 'data-stars3')
        .attr('height', 25)
        .attr('width', 23)
        .attr('viewBox', '0 0 26 26')
        .attr('class', 'star rating')
        .append('polygon')
        .attr('points', "9.9, 1.1, 3.3, 21.78, 19.8, 8.58, 0, 8.58, 16.5, 21.78")
        .style('fill-rule', 'nonzero')   
        .on('mouseover', function(){
          if (isClicked === false) {
            var s = d3.select('#data-stars1 polygon')
            var t = d3.select('#data-stars2 polygon')
            var u = d3.select('#data-stars3 polygon')
            s.style('fill', '#ffd055')
            t.style('fill', '#ffd055')
            u.style('fill', '#ffd055')
          }
        })      
        .on('mouseout', function(){
          if (isClicked === false) {
            var s = d3.select('#data-stars1 polygon')
            var t = d3.select('#data-stars2 polygon')
            var u = d3.select('#data-stars3 polygon')
            s.style('fill', '#d8d8d8')
            t.style('fill', '#d8d8d8')
            u.style('fill', '#d8d8d8')
          }
        })     
        .on('click', function(){
          var g = d3.select('#data-stars3')
          var s = d3.select('#data-stars1 polygon')
          var t = d3.select('#data-stars2 polygon')
          var u = g.select('polygon')
          if (isClicked === false) {
            isClicked = true
            s.style('fill', '#ffd055')
            t.style('fill', '#ffd055')
            u.style('fill', '#ffd055')
            g.classed('selectedRating', true)
            d3.select('#ratingGroup').remove()
            var rating = g.attr('data-rating') 
            drawRating(rating)
            console.log(rating)
            d3.select('#submitRating').attr('value', rating)
            d3.select('#submitRecipe').attr('value', name)
            d3.select('#submitCocktailID').attr('value', cocktail_id)
          }
          else {
            isClicked = false
            g.classed('selectedRating', false)
            d3.select('#ratingGroup').remove()
          }
        })
      var dataStars4 = starGroup.append('g')
        .attr('transform', 'translate(60, 75)')
        .append('svg')
        .attr('data-rating', 4)
        .attr('id', 'data-stars4')
        .attr('height', 25)
        .attr('width', 23)
        .attr('viewBox', '0 0 26 26')
        .attr('class', 'star rating')
        .append('polygon')
        .attr('points', "9.9, 1.1, 3.3, 21.78, 19.8, 8.58, 0, 8.58, 16.5, 21.78")
        .style('fill-rule', 'nonzero')
        .on('mouseover', function(){
          if (isClicked === false) {
            var s = d3.select('#data-stars1 polygon')
            var t = d3.select('#data-stars2 polygon')
            var u = d3.select('#data-stars3 polygon')
            var v = d3.select('#data-stars4 polygon')
            s.style('fill', '#ffd055')
            t.style('fill', '#ffd055')
            u.style('fill', '#ffd055')
            v.style('fill', '#ffd055')
          }
        })      
        .on('mouseout', function(){
          var s = d3.select('#data-stars1 polygon')
          var t = d3.select('#data-stars2 polygon')
          var u = d3.select('#data-stars3 polygon')
          var v = d3.select('#data-stars4 polygon')
          if (isClicked === false) {
            s.style('fill', '#d8d8d8')
            t.style('fill', '#d8d8d8')
            u.style('fill', '#d8d8d8')
            v.style('fill', '#d8d8d8')
          }
        })  
        .on('click', function(){
          var g = d3.select('#data-stars4')
          var s = d3.select('#data-stars1 polygon')
          var t = d3.select('#data-stars2 polygon')
          var u = d3.select('#data-stars3 polygon')
          var v = d3.select('polygon')
          if (isClicked === false) {
            isClicked = true
            s.style('fill', '#ffd055')
            t.style('fill', '#ffd055')
            u.style('fill', '#ffd055')
            v.style('fill', '#ffd055')
            g.classed('selectedRating', true)
            d3.select('#ratingGroup').remove()
            var rating = g.attr('data-rating') 
            drawRating(rating)
            console.log(rating)
            d3.select('#submitRating').attr('value', rating)
            d3.select('#submitRecipe').attr('value', name)
            d3.select('#submitCocktailID').attr('value', cocktail_id)
          }
          else {
            isClicked = false
            g.classed('selectedRating', false)
            d3.select('#ratingGroup').remove()
          }
        })
      var dataStars5 = starGroup.append('g')
        .attr('transform', 'translate(80, 75)')
        .append('svg')
        .attr('data-rating', 5)
        .attr('id', 'data-stars5')
        .attr("xlink:href","#starDef")
        .attr('height', 25)
        .attr('width', 23)
        .attr('viewBox', '0 0 26 26')
        .attr('class', 'star rating')
        .append('polygon')
        .attr('points', "9.9, 1.1, 3.3, 21.78, 19.8, 8.58, 0, 8.58, 16.5, 21.78")
        .style('fill-rule', 'nonzero')
        .on('mouseover', function(){
          if (isClicked === false) {
            var s = d3.select('#data-stars1 polygon')
            var t = d3.select('#data-stars2 polygon')
            var u = d3.select('#data-stars3 polygon')
            var v = d3.select('#data-stars4 polygon')
            var w = d3.select('#data-stars5 polygon')
            s.style('fill', '#ffd055')
            t.style('fill', '#ffd055')
            u.style('fill', '#ffd055')
            v.style('fill', '#ffd055')
            w.style('fill', '#ffd055')
          }
        })      
        .on('mouseout', function(){
          if (isClicked === false) {
            var s = d3.select('#data-stars1 polygon')
            var t = d3.select('#data-stars2 polygon')
            var u = d3.select('#data-stars3 polygon')
            var v = d3.select('#data-stars4 polygon')
            var w = d3.select('#data-stars5 polygon')
            s.style('fill', '#d8d8d8')
            t.style('fill', '#d8d8d8')
            u.style('fill', '#d8d8d8')
            v.style('fill', '#d8d8d8')
            w.style('fill', '#d8d8d8')
          }
        })  
        .on('click', function(){
          var g = d3.select('#data-stars5')
          var s = d3.select('#data-stars1 polygon')
          var t = d3.select('#data-stars2 polygon')
          var u = d3.select('#data-stars3 polygon')
          var v = d3.select('#data-stars4 polygon')
          var w = g.select('polygon')
          if (isClicked === false) {
            isClicked = true
            s.style('fill', '#ffd055')
            t.style('fill', '#ffd055')
            u.style('fill', '#ffd055')
            v.style('fill', '#ffd055')
            w.style('fill', '#ffd055')
            g.classed('selectedRating', true)
            d3.select('#ratingGroup').remove()
            var rating = g.attr('data-rating') 
            drawRating(rating)
            console.log(rating)
            d3.select('#submitRating').attr('value', rating)
            d3.select('#submitRecipe').attr('value', name)
            d3.select('#submitCocktailID').attr('value', cocktail_id)
          }
          else {
            isClicked = false
            g.classed('selectedRating', false)
            d3.select('#ratingGroup').remove()
          }
        })
      var starInstrDiv = d3.select('#glasses').append('div')
        .attr("transform", `translate(0, -25)`)
        .attr('id', 'starInstrDiv')
        .append('text')
        .text('Click star to set rating -- Click again to unset')  
      // styleImportedSVG()
    })
}	

function styleImportedSVG () {
  d3.select('svg')
    .on('mouseover', function() {
      console.log('mouseover');
      console.log('this', this);
      d3.selectAll('path')
        .style({
          'fill-opacity':   0.1,
          'stroke-opacity': 0.3
        })
    })
    .on('mouseout', function() {
      console.log('mouseout');
      d3.selectAll('path')
        .style({
          'fill-opacity':   1,
          'stroke-opacity': 1
        })
    })
}
function drawTable(cocktail_endpoint, chosenParam, paramType) {
	d3.json(cocktail_endpoint).then(function(recipe_dump) {
    console.log(recipe_dump)
    var chosenRecipes = []
    if (paramType === 'ingredient') {
      var recipeFilter = recipe_dump.filter(recipe => {
        recipe['Ingredients'].forEach(ingredient => {
          if (ingredient['Liquid'].includes(chosenParam)) {
            chosenRecipes.push(recipe)
            return true;
          }
      })
    })
    }
    else if (paramType === 'recipe') {
      var chosenRecipes = recipe_dump.filter(datum => datum.Cocktail_Name == chosenParam)
    }
    else if (paramType === 'category') {
      var chosenRecipes = recipe_dump.filter(datum => datum.Category == chosenParam)
    }
    function ingrColumn(ings) {
      liqs = []
      ings.forEach(ing => {
        liqs.push(ing['Measure'] + ' ' + ing['Liquid'])
      })
      return liqs
    }
    console.log(chosenRecipes)
    var headers = d3.keys(recipe_dump[0])
    console.log(headers)
    headers = headers.slice(2,3).concat(headers.slice(1,2)).concat(headers.slice(0,1)).concat(headers.slice(3,5))
    .concat(headers.slice(5,7))
    console.log(headers)
		var dataTable = d3.select('#table').append('table').attr('class', 'datatable table table-striped');
		var header = dataTable.append('thead').selectAll('th').data(headers).enter()
			.append('th')
			.attr('class', 'sortable')
			.attr('value', d => d)
			.attr('id', d => `${d}-header`)
			.text(d => d)
		var tbody = dataTable.append('tbody')
		var content = tbody.selectAll('tr').data(chosenRecipes).enter()
			.append('tr')
			.html((data, i) => (`
			  <td class="col_0 row_${i + 1}">${data.Cocktail_Name}</td><td class="col_1 row_${i + 1}">${data.Category}</td>
				<td class="col_2 row_${i + 1}">${data.Average_Rating}</td><td class="col_3 row_${i + 1}">${data.Glass}</td>
        <td class="col_4 row_${i + 1}">${data.Glass_Size}</td><td class="col_5 row_${i + 1}">${ingrColumn(data.Ingredients)}</td>
        <td class="col_7 row_${i + 1}">${data.Instructions}</td>
				`
			))
			.on('mouseover', function(d, i) {
        d3.select(this).style('background-color', 'rgb(0, 14, 142').style('color', 'silver').style('cursor', 'pointer')
        
			})
			.on('mouseout', function(d, i) {
				d3.select(this).style('background-color', null).style('color', null).style('cursor', 'pointer')
				d3.select('.data').append('table').classed('table table-striped table-sortable', true)
      })
      .on('click', function(d, i) {
        svg.remove()
        d3.select('#starInstrDiv').remove()
        d3.select('#instrGroup').remove()
        svg = d3.select("#glasses")
          .append("svg")
          .attr('id', 'svg')
          .attr("width", svgWidth)
          .attr("height", svgHeight)
          .attr('viewBox', '0 -5 110 110')
        var chosenRecipe = this.__data__.Cocktail_Name
        var chosenCateg = this.__data__.Category
        console.log(chosenCateg)
        console.log(this)
        drawGlass(cocktail_endpoint, chosenRecipe, chosenCateg)
        document.getElementById('glasses').scrollIntoView()      
      })
		var sortAscending = true
		header.on('click',function(d, i) {
			var sort_value = d3.select(this).attr('value')
			var numeric = headers.slice(1, 8)
			console.log(headers)
			console.log(numeric)
			if (sortAscending === true) {
				if (numeric.includes(sort_value)) {
					content.sort((a,b) => d3.ascending(parseFloat(a[sort_value]), parseFloat(b[sort_value])))
				}
				else {
					content.sort((a,b) => d3.ascending(a[sort_value].toLowerCase().replace(/\s/g, ''), b[sort_value].toLowerCase().replace(/\s/g, '')))
				}
				sortAscending = false
				d3.select(this).attr('class', 'asc')
			} else {
				if (numeric.includes(sort_value)) {
					content.sort((a,b) => d3.descending(parseFloat(a[sort_value]), parseFloat(b[sort_value])))
				}
				else {
					content.sort((a,b) => d3.descending(a[sort_value].toLowerCase().replace(/\s/g, ''), b[sort_value].toLowerCase().replace(/\s/g, '')))
				}
				sortAscending = true
				d3.select(this).attr('class', 'desc')
			}
		})
	})
}
var chosenIngred = 'rum'
var paramType = 'ingredient'
drawTable(cocktail_endpoint, chosenIngred, paramType)
