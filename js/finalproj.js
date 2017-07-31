var width = 1000,
	height = 800,
	zoomleft = -width,
	zoomdown = -(height/4),
	zoomscale = 2,
	zoomtime = 10000;

//attach zoom event to buttons
var zoomInBtn = d3.select("#zoomInStates")
	.on("click", zoomInMidwest);

var tooltip = d3.select('div.slides').append('div')
	.attr('class', 'hidden tooltip');
						
// ** BEGIN SLIDE ONE for STATES data **	
//select & resize
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


d3.queue()
	.defer(d3.json, "https://therocket.github.io/UIUC-CS498-FinalProj/data/us-10m-v1.json")
	.defer(d3.json, "https://therocket.github.io/UIUC-CS498-FinalProj/data/electoral2016.json")
	.await(ready);

function ready(error, mapdata, electdata) {

//d3.json("https://therocket.github.io/UIUC-CS498-FinalProj/data/us-10m-v1.json", function(error, us) {
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
		.on("mouseover", function (d) {
			var state_name = state_by_id(d.id); 
			console.log(state_name); // Log name property on mouseover
			});
			
	d3.select("g.states").append("path")
		.attr("class", "state-borders")
		.attr("d", path1(topojson.mesh(mapdata, mapdata.objects.states, function(a, b) { return a !== b; })));

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


	// ** BEGIN SLIDE TWO for COUNTIES MINING data **

	svg2.select("g.counties")
		.selectAll(".state_data")
		.data(electdata)
		.enter().append("text")
		.attr("class","state-data")
		.attr("x", 10)
		.attr("y", 10)
		.text("Hello!");
}

d3.json("https://d3js.org/us-10m.v1.json", function(error, us) {
  if (error) throw error;

  svg2.append("g")
    .attr("class", "counties")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .enter().append("path")
      .attr("d", path2);

  svg2.append("path")
      .attr("class", "county-borders")
      .attr("d", path2(topojson.mesh(us, us.objects.counties, function(a, b) { return a !== b; })));
});

function zoomInMidwest() {
	svg1.transition()
		.duration(zoomtime)
		.attr("transform", "translate(" + zoomleft+ "," + zoomdown + ")scale(" + zoomscale + ")");
		
	//zoom counties on slide 2
	svg2.transition()
		.duration(zoomtime)
		.attr("transform", "translate(" + zoomleft+ "," + zoomdown + ")scale(" + zoomscale + ")");
		
	zoomInBtn.style("opacity", 0); //hide the button once zoomed
}
