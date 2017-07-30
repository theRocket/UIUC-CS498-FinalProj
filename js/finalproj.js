d3.select("body")
  .style("background-color", "black")
  .transition()
  .duration(1000)
  .style("background-color", "white");

var width = 1000,
	height = 800,
	zoomleft = -width,
	zoomdown = -(height/4),
	zoomscale = 2,
	zoomtime = 10000;

//attach zoom event to buttons
var zoomInBtn = d3.select("#zoomInStates")
	.on("click", zoomInMidwest);

// ** BEGIN SLIDE ONE for STATES data **	
//select & resize
var svg1 = d3.select("#firstgraph")
	.attr("width", width)
	.attr("height", height);

var path1 = d3.geoPath();

var elect_state =  [
	{
		"id":53,
		"name":"WA",
		"winner": "D",
		"votes": 12
	},
	{
		"id":41,
		"name":"OR",
		"winner": "D",
		"votes": 7
	}
];


d3.queue()
	.defer(d3.json, "https://therocket.github.io/UIUC-CS498-FinalProj/data/us-10m-v1.json")
	.defer(d3.json, "https://therocket.github.io/UIUC-CS498-FinalProj/data/electoral2016.json")
	.await(ready);

function ready(error, mapdata, electdata) {

//d3.json("https://therocket.github.io/UIUC-CS498-FinalProj/data/us-10m-v1.json", function(error, us) {
  if (error) throw error;
	console.log(elect_state);
	
	var state_by_id = function (id) {
		var map = d3.map(electdata, function (d) { return d.id});
		return map.get(id);
	}
	
	svg1.append("g")
		.attr("class", "states")
		.selectAll("path")
		.data(topojson.feature(mapdata, mapdata.objects.states).features)
		.enter().append("path")
		.attr("d", path1)
// now address each item individually
		.each(function(d) {
				d3.select(this)
					.append("text")
					.attr("x",10)
					.text(d.id)
					.attr("stroke","red")
					.attr("fill","red");
			})
		.on("mouseover", function (d,i,node) { 
				console.log(d.label); // Log name property on mouseover
			});
			
	svg1.append("path")
		.attr("class", "state-borders")
		.attr("d", path1(topojson.mesh(mapdata, mapdata.objects.states, function(a, b) { return a !== b; })));
		
	svg1.select("g.states")
		.selectAll(".state_data")
		.data(elect_state)
		.enter().append("text")
		.attr("class","state-data")
		.attr("x", 10)
		.attr("y", 10)
		.text("Hello!");
		
}

// ** BEGIN SLIDE TWO for COUNTIES MINING data **
var svg2 = d3.select("#secondgraph")
	.attr("width", width)
	.attr("height", height);

var path2 = d3.geoPath();

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
	svg1.select("g.states")
		.transition()
		.duration(zoomtime)
		.attr("transform", "translate(" + zoomleft+ "," + zoomdown + ")scale(" + zoomscale + ")");
	svg1.select("path.state-borders")
		.transition()
		.duration(zoomtime)
		.attr("transform", "translate(" + zoomleft+ "," + zoomdown + ")scale(" + zoomscale + ")");
		
	//zoom counties on slide 2
	svg2.select("g.counties")
		.transition()
		.duration(zoomtime)
		.attr("transform", "translate(" + zoomleft+ "," + zoomdown + ")scale(" + zoomscale + ")");
	svg2.select("path.county-borders")
		.transition()
		.duration(zoomtime)
		.attr("transform", "translate(" + zoomleft+ "," + zoomdown + ")scale(" + zoomscale + ")");
		
	zoomInBtn.style("opacity", 0); //hide the button once zoomed
}
