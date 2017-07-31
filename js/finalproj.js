var width = 1000,
	height = 600,
	zoomleft = -width,
	zoomdown = -(height/4),
	zoomscale = 2,
	zoomtime = 5000;


//tooltip regions
	var state_tooltip = d3.select("#state_votes");
	var coal_cty_tooltip = d3.select("#ctycoal_employ");
	var coal_state_tooltip = d3.select("#statecoal_employ");	

//start building SVG with map groups
var svg1 = d3.select("#firstgraph")
	.attr("width", width)
	.attr("height", height)
	.append("g")
	.attr("class", "states");

var svg3 = d3.select("#thirdgraph")
	.attr("width", width)
	.attr("height", height)
	.append("g")
	.attr("class", "states");

var path1 = d3.geoPath();

var svg2 = d3.select("#secondgraph")
	.attr("width", width)
	.attr("height", height)
	.append("g")
	.attr("class", "counties");

var path2 = d3.geoPath();

// load all the data
d3.queue()
	.defer(d3.json, "https://therocket.github.io/UIUC-CS498-FinalProj/data/us-10m-v1.json")
	.defer(d3.json, "https://therocket.github.io/UIUC-CS498-FinalProj/data/electoral2016.json")
	.defer(d3.csv, "https://therocket.github.io/UIUC-CS498-FinalProj/data/coalprod_bycounty.csv")
	.defer(d3.csv, "https://therocket.github.io/UIUC-CS498-FinalProj/data/coalprod_change2015.csv")
	.await(ready);

function ready(error, mapdata, electdata, coaldata, changedata) {
  if (error) throw error;
	
	var state_by_id = function (id) {
		var state_map = d3.map(electdata, function (d) { return d.id});
		return state_map.get(id);
	}
	
	var state_paths = d3.selectAll("g.states")
		.selectAll("path")
		.data(topojson.feature(mapdata, mapdata.objects.states).features)
		.enter().append("path")
		.attr("d", path1)
		.attr("id", function(d) {return d.id;})
		.attr("fill", function(d) {
				var state_obj = state_by_id(d.id);
				if(typeof state_obj !== 'undefined'){ 
					if(state_obj.winner == "D"){return d3.rgb(4, 110, 178);}
					else {return d3.rgb(194, 7, 22);}
				}
			});
			
		d3.select("#firstgraph").selectAll("path").data(topojson.feature(mapdata, mapdata.objects.states).features)
		.on("mouseover", function (d) {
			var state_name = state_by_id(d.id);
			if(typeof state_name !== 'undefined'){ 
					tt_load = state_name.name + ": " + state_name.votes + " votes"; // Log name property on mouseover
				}
			state_tooltip.html(tt_load);
      })
      .on('mouseout', function() {
          state_tooltip.html("No State Selected for Vote Counts")
      });
			
	d3.select("g.states").append("path")
		.attr("class", "state-borders")
		.attr("d", path1(topojson.mesh(mapdata, mapdata.objects.states, function(a, b) { return a !== b; })));

	var state_coal_by_id = function (id) {
			var state_coal_map = d3.map(changedata, function (d) { return d.id});
			return state_coal_map.get(id);
		}
		
		//it's actually the 2nd graph because I swapped the slide order
	d3.select("#thirdgraph").selectAll("path").data(topojson.feature(mapdata, mapdata.objects.states).features)
		//color those states with coal employment data with an extra black border
		.attr("stroke", function(d)	{
				var state_coal_obj = state_coal_by_id(d.id);
				if(typeof state_coal_obj !== 'undefined'){ return "black";}
			})
			//tooltip for state employment data
		.on("mouseover", function (d) {
			var state_coal_obj = state_coal_by_id(d.id);
			if(typeof state_coal_obj !== 'undefined'){ 
					tt_load = state_coal_obj.State + ":<br/>"+state_coal_obj.chg_no_mines + "% decline in # of mines<br/>"; 
					tt_load = tt_load + state_coal_obj.chg_no_employ + "% decline in # of employees"
				}
			else {
					tt_load = "No Coal Employment in this State<br/>";
					tt_load = tt_load + "No decline in # of mines<br/>";
					tt_load = tt_load + "No decline in # of employees<br/>";
				}
			coal_state_tooltip.html(tt_load);
	    })
	    .on('mouseout', function() {
	        coal_state_tooltip.html("No State Selected for Coal's Economic Decline Data<br/><br/>")
	    });
		
	var county_coal_by_id = function (id) {
			var county_coal_map = d3.map(coaldata, function (d) { return d.id});
			return county_coal_map.get(id);
		}
		
	var county_paths = d3.select("g.counties")
	  .selectAll("path")
	  .data(topojson.feature(mapdata, mapdata.objects.counties).features)
	  .enter().append("path")
		.attr("d", path2)
		.attr("fill", function(d) {
			var county_coal_obj = county_coal_by_id(d.id);
			if(typeof county_coal_obj !== 'undefined'){  
					return "orange";}
					else {return d3.rgb(192, 192, 192);} //silver
			})
		.on("mouseover", function (d) {
			console.log(d.id);
			var county_coal_obj = county_coal_by_id(d.id);
			if(typeof county_coal_obj !== 'undefined'){ 
					tt_load = county_coal_obj.name+" County, "+county_coal_obj.state+" has:<br/>";
					tt_load = tt_load + county_coal_obj.total_mines + " total mines<br/>"; 
					tt_load = tt_load + county_coal_obj.total_prod_tons + " tons produced"; 
				}
			else {
				tt_load = "No Coal Employment in this County<br/>";
				tt_load = tt_load + "0 total mines<br/>"; 
				tt_load = tt_load + "0 tons produced"; 
			}
			coal_cty_tooltip.html(tt_load);
      })
      .on('mouseout', function() {
          coal_cty_tooltip.html("No County Selected for Coal Employment Data<br/><br/>")
      });
		
	svg2.append("path")
	    .attr("class", "county-borders")
	    .attr("d", path2(topojson.mesh(mapdata, mapdata.objects.counties, function(a, b) { return a !== b; })));
			
		d3.select("g.counties").append("path")
			.attr("class", "state-borders")
			.attr("d", path2(topojson.mesh(mapdata, mapdata.objects.states, function(a, b) { return a !== b; })))
			.attr("stroke","black");
	
		}
//this works but text is laid out oddly on boundary of path - use tooltip instead!
/*
	var state_text = d3.select("g.states").append("text")
		.attr("font-family","Verdana")
		.attr("font-size","14")
		.selectAll("textPath").data(electdata).enter()
		.append("textPath")
		.attr("xlink:href",function(d) { return "#"+d.id; })
		.text(function(d) {return d.name;})
		.attr("stroke","red")
// now address each item individually
		.each(function(d) {
				d3.select(this)
				//nothing going on here just a placeholder
			});
		// //playing around with adding svg text a different way
		// 	svg1.select("g.states")
		// 		.append("text")
		// 		.attr("x", width/2)
		// 		.attr("y", 10)
		// 		.text(tt_load)
		// 		.attr("font-family","Verdana")
		// 		.attr("font-size","14");
*/

//attach zoom event to buttons
var zoomInBtn = d3.selectAll("button.zoomInBtn")
	.on("click", zoomInMidwest);
		
function zoomInMidwest() {
	svg1.transition()
		.duration(zoomtime)
		.attr("transform", "translate(" + zoomleft+ "," + zoomdown + ")scale(" + zoomscale + ")");
		
	//zoom counties on slide 2
	svg2.transition()
		.duration(zoomtime)
		.attr("transform", "translate(" + zoomleft+ "," + zoomdown + ")scale(" + zoomscale + ")");
	
	d3.selectAll("button.zoomInBtn")
		.html("Zoom Back Out")
		.on("click", zoomOutUS);
		
	//zoomInBtn.style("opacity", 0); //hide the button once zoomed
}

function zoomOutUS() {
	svg1.transition()
		.duration(zoomtime)
		.attr("transform", "scale(1)");
		
	//zoom counties on slide 2
	svg2.transition()
		.duration(zoomtime)
		.attr("transform", "scale(1)");
	
	d3.selectAll("button.zoomInBtn")
		.html("Focus On Midwest Coal Region")
		.on("click", zoomInMidwest);
}