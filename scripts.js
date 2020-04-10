
const cyclistUrl = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

const boxSize = {
  upper: 100,
  lower: 30,
  right: 20,
  left: 60
},

width = 920 - boxSize.left - boxSize.right;
height = 630 - boxSize.upper - boxSize.lower;

const xScale = d3.scaleLinear().range([0, width]);
const yScale = d3.scaleTime().range([0, height]);

let timeFormat = d3.timeFormat("%M:%S");

const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"))
const yAxis = d3.axisLeft(yScale).tickFormat(timeFormat)

const color = d3.scaleOrdinal(d3.schemeSet2);

const screenTip = d3.select("body")
              .append("div")
              .attr("class", "tooltip")
              .attr("id", "tooltip")
              .style("opacity", 0);

const svg = d3.select("body")
              .append("svg")
              .attr("width", width + boxSize.left + boxSize.right)
              .attr("height", height + boxSize.upper + boxSize.lower)
              .attr("class", "graph")
              .append("g")
              .attr("transform", "translate(" + boxSize.left + "," + boxSize.upper + ")");


d3.json(cyclistUrl, (error, data) => {
  
  if (error) {
    throw error;
  }
  data.forEach((d) => {
    d.Place += d.Place;
    const parsedTime = d.Time.split(':');
    d.Time = new Date(1970, 0, 1, 0, parsedTime[0], parsedTime[1]);
  });

  xScale.domain([d3.min(data, (d) => d.Year-1), d3.max(data, (d) => d.Year+1)]);
  yScale.domain(d3.extent(data, (d) => d.Time));

  svg.append("text")
      .attr("id","title")
      .attr("x", (width / 2))             
      .attr("y", 0 - (boxSize.upper / 2))
      .attr("text-anchor", "middle")  
      .style("font-size", "30px") 
      .text("DOPING HISTORY IN PROFESSIONAL BICYCLE RACING");

  svg.append("g")
    .attr("class", "x axis")
    .attr("id","x-axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .append("text")
    .attr("class", "x-axis-label")
    .attr("x", width)
    .attr("y", -6)
    .style("text-anchor", "end")
    .text("Year");

  svg.append("g")
    .attr("class", "y axis")
    .attr("id","y-axis")
    .call(yAxis)
    .append("text")
    .attr("class", "label")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Best Time (minutes)")
  
  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -400)
    .attr('y', -44)
    .style('font-size', 18)
    .text('Time in Minutes')
    .style("font-size", 20+"px");
    
  svg.selectAll(".dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "dot")
    .attr("r", 6)
    .attr("cx", (d) => xScale(d.Year))
    .attr("cy", (d) => yScale(d.Time))
    .attr("data-xvalue", (d) => d.Year)
    .attr("data-yvalue", (d) => d.Time.toISOString())
    .style("fill", (d) => color(d.Doping != ""))
    .on("mouseover", (d) => {
      screenTip.style("opacity", 0.9);
      screenTip.attr("data-year", d.Year)
      screenTip.html(d.Name + ": " + d.Nationality + "<br/>"
              + "Year: " +  d.Year + ", Time: " + timeFormat(d.Time) 
              + (d.Doping?"<br/>" + d.Doping:""))
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px")
        .style("font-size", 15+"px");
    })
    .on("mouseout", (d) => screenTip.style("opacity", 0));

    const legendObject = {
      label: ["DOPING", "NO DOPING"],
      color: ["#26ce6c", "#fd941d"],
      height: 15,
      width: 100
    }
    
    const legend = svg.append("g")
                      .attr("id", "legend")
                      .attr("transform", `translate(${width - legendObject.label.length * legendObject.width}, 0)`);

    legend.selectAll("rect")
          .data(legendObject.label)
          .enter()
          .append("rect")
          .attr("width", legendObject.width - 20)
          .attr("height", legendObject.height)
          .attr("x", (d, i) => i*legendObject.width)
          .attr("y", 0)
          .attr("fill", (d, i) => legendObject.color[i])
          .select("text")
          .data(legendObject.label)
          .enter()
          .append("text")
          .attr("x", (d,i) => i*legendObject.width)
          .attr("y", legendObject.height*2)
          .style("font-size", "0.9rem")
          .html((d) => (d));
    
  
});