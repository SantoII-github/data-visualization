import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
const FETCH_URL = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json"

const fetchData = async (url) => {
    const res = await fetch(url);
    const data = await res.json();
    return data;
}

const buildBarGraph = async () => {
    // Graph Dimension Declarations
    const graphWidth = 1200;
    const graphHeight = 500;
    const marginLeft = 40;
    const marginRight = 40;
    const marginBottom = 40;
    const marginTop = 40;

    const data = await fetchData(FETCH_URL);
    const dataset = data.data;
    const datesArray = dataset.map( i => new Date(i[0]));

    // Create Scales
    const yScale = d3.scaleLinear();
    yScale.domain([0, d3.max(dataset, d => d[1])])
          .range([graphHeight - marginTop, marginBottom]);
    

    const xScale = d3.scaleUtc();
    xScale.domain([d3.min(datesArray), d3.max(datesArray)])
          .range([marginLeft, graphWidth - marginRight]);
    

    // Create SVG
    const svg = d3.select("#bar-chart")
                    .append("svg")
                    .attr("width", graphWidth)
                    .attr("height", graphHeight)
                    .attr("class", "bar-svg")
    
    // Tooltip
    let tooltip = d3.select("body")
                    .append("div")
                    .attr("class", "tooltip")
                    .attr("id", "tooltip")
                    .style("opacity", 0);

    // Bars
    svg.selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
        .attr("x", (d, i) => marginLeft + i * ((graphWidth - marginLeft - marginRight) / dataset.length))
        .attr("y", (d, i) => yScale(d[1]))
        .attr("width", (graphWidth - marginLeft - marginRight) / dataset.length)
        .attr("height", (d, i) => graphHeight - yScale(d[1]) - marginBottom)
        .attr("data-date", (d, i) => d[0])
        .attr("data-gdp", (d, i) => d[1])
        .attr("class", "bar")
        .on("mouseover", function(event, d) {
            tooltip.transition()
                    .duration(0)
                    .style("opacity", 0.9);
            tooltip.html(`Date: ${d[0]}<br> $${d[1]} GDP`)
                      .style("left", event.pageX + 20 + "px")
                      .style("top", event.pageY + 20 + "px");
            tooltip.attr("data-date", d[0]);
          })
          .on("mouseout", function(d) {
            tooltip
              .transition()
              .duration(400)
              .style("opacity", 0);
          });
        

    // Axis
    const yAxis = d3.axisLeft(yScale);
     svg.append("g")
         .attr("transform", `translate(${marginLeft})`)
         .call(yAxis)
         .attr("id", "y-axis");
    
    const xAxis = d3.axisBottom(xScale);
    svg.append("g")
         .attr("transform", `translate(0, ${graphHeight - marginBottom})`)
         .call(xAxis)
         .attr("id", "x-axis");

    const leftLabel = svg.append("text")
                         .attr("x", marginLeft - 80)
                         .attr("y", marginTop + 30)
                         .attr("class", "axis-label")
                         .text("Gross Domestic Product")
                         .style("text-anchor", "end")
                         .attr('transform', 'rotate(-90)')
}

buildBarGraph();