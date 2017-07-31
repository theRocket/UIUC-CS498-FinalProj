var width = 1000,
	height = 600,
	zoomleft = -width,
	zoomdown = -(height/4),
	zoomscale = 2,
	zoomtime = 5000;


//tooltip region
	var tooltip = d3.select("#state_votes");
	
	/* tried automatically build the second slide
var slide_about = d3.select("slides.present")
	.append("slide")
	.append("h1")
	.html("Testing 3rd slide with D3");
*/

//start building SVG with map groups
var svg1 = d3.select("#firstgraph")
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
	.await(ready);

function ready(error, mapdata, electdata) {
  if (error) throw error;
	
	var state_by_id = function (id) {
		var map = d3.map(electdata, function (d) { return d.id});
		return map.get(id);
	}
	

	var state_paths = d3.select("g.states")
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
			})
		.on("mouseover", function (d) {
			var state_name = state_by_id(d.id);
			if(typeof state_name !== 'undefined'){ 
					tt_load = state_name.name + ": " + state_name.votes + " votes"; // Log name property on mouseover
				}
			tooltip.html(tt_load);
		// //playing around with adding svg text a different way
		// 	svg1.select("g.states")
		// 		.append("text")
		// 		.attr("x", width/2)
		// 		.attr("y", 10)
		// 		.text(tt_load)
		// 		.attr("font-family","Verdana")
		// 		.attr("font-size","14");
      })
      .on('mouseout', function() {
          tooltip.html("No State Selected for Vote Counts")
      });
			
	d3.select("g.states").append("path")
		.attr("class", "state-borders")
		.attr("d", path1(topojson.mesh(mapdata, mapdata.objects.states, function(a, b) { return a !== b; })));

	var county_paths = d3.select("g.counties")
	  .selectAll("path")
	  .data(topojson.feature(mapdata, mapdata.objects.counties).features)
	  .enter().append("path")
		.attr("d", path2);

	svg2.append("path")
	    .attr("class", "county-borders")
	    .attr("d", path2(topojson.mesh(mapdata, mapdata.objects.counties, function(a, b) { return a !== b; })));
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