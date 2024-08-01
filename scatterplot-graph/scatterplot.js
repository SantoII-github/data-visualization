import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
const FETCH_URL = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"

const fetchData = async (url) => {
    const res = await fetch(url);
    const data = await res.json();
    return data;
}

const buildScatterplot = async () => {
    // Graph Dimension Declarations
    const graphWidth = 1200;
    const graphHeight = 500;
    const marginLeft = 40;
    const marginRight = 40;
    const marginBottom = 40;
    const marginTop = 40;

    const dataset = await fetchData(FETCH_URL);
    const parsedTime = dataset.map(d => d.Time.split(":"))
    const timeArray = parsedTime.map(d => new Date(1970, 0, 1, 0, d[0], d[1]));


    const svg = d3.select("#scatterplot-graph")
    .append("svg")
    .attr("width", graphWidth)
    .attr("height", graphHeight)
    .attr("class", "scatterplot-svg")

    // Create Scales
    const yScale = d3.scaleTime()
        .domain(d3.extent(timeArray, d => d))
        .range([marginBottom, graphHeight - marginTop]).nice();

    const xScale = d3.scaleLinear();
    xScale.domain(d3.extent(dataset, d => d.Year))
          .range([marginLeft, graphWidth - marginRight]).nice();

    const timeFormat = d3.timeFormat('%M:%S');
    const yAxis = d3.axisLeft(yScale).tickFormat(timeFormat);
     svg.append("g")
         .attr("transform", `translate(${marginLeft})`)
         .call(yAxis)
         .attr("id", "y-axis");
    
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
    svg.append("g")
         .attr("transform", `translate(0, ${graphHeight - marginBottom})`)
         .call(xAxis)
         .attr("id", "x-axis");

    // Legend
    const legend = svg.append("g").attr("id", "legend");
    legend.append("rect").attr("x", 950).attr("y",130).attr("width", 20).attr("height", 20).attr("class", "doping-true")
    legend.append("rect").attr("x", 950).attr("y",160).attr("width", 20).attr("height", 20).attr("class", "doping-false")
    legend.append("text").attr("x", 975).attr("y", 140).text("Rider has doping allegations").attr("alignment-baseline","middle").attr("class", "legend-text")
    legend.append("text").attr("x", 975).attr("y", 170).text("No doping allegations").attr("alignment-baseline","middle").attr("class", "legend-text")
         
    // Tooltip
    const tooltip = d3.select("body")
                    .append("div")
                    .attr("class", "tooltip")
                    .attr("id", "tooltip")
                    .style("opacity", 0);

    svg.selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle")
        .attr("cx", (d, i) => xScale(d.Year))
        .attr("cy", (d, i) => yScale(timeArray[i]))
        .attr("r", 5)
        .attr("class", (d, i) => d.Doping === "" ? "dot doping-false" : "dot doping-true")
        .attr("data-xvalue", d => d.Year)
        .attr("data-yvalue", (d, i) => timeArray[i])
        .on("mouseover", function(event, d) {
            tooltip.transition()
                    .duration(0)
                    .style("opacity", 0.9);
            tooltip.html(`Name: ${d.Name} <br>
                          Year: ${d.Year}, Time: ${d.Time} 
                          ${d.Doping === "" ? "" : "<br><br>" + d.Doping}`)
                      .style("left", event.pageX + 10 + "px")
                      .style("top", event.pageY - 15 + "px");
            tooltip.attr("data-year", d.Year);
          })
          .on("mouseout", function(d) {
            tooltip
              .transition()
              .duration(400)
              .style("opacity", 0);
          });;

}

buildScatterplot();