import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
const FETCH_URL = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"

const fetchData = async (url) => {
    const res = await fetch(url);
    const data = await res.json();
    return data;
}

const buildHeatMap = async () => {
    // Graph Dimension Declarations
    const graphWidth = 1200;
    const graphHeight = 500;
    const marginLeft = 60;
    const marginRight = 40;
    const marginBottom = 40;
    const marginTop = 40;


    const data = await fetchData(FETCH_URL);
    const dataset = data.monthlyVariance;
    const yearsLength = d3.max(dataset, d => d.year) - d3.min(dataset, d => d.year)


    const svg = d3.select("#heat-map")
                  .append("svg")
                  .attr("width", graphWidth)
                  .attr("height", graphHeight);
                  
    // Create Scales
    const yScale = d3.scaleBand()
                    .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
                    .range([marginBottom, graphHeight - marginTop])
                    .padding(0);

    const xScale = d3.scaleLinear()
                     .domain(d3.extent(dataset, d => d.year))
                     .range([marginLeft, graphWidth - marginRight]);

    const yAxis = d3.axisLeft(yScale).tickValues(yScale.domain())
    .tickFormat(function (month) {
      var date = new Date(0);
      date.setUTCMonth(month);
      var format = d3.utcFormat('%B');
      return format(date);
    })
    .tickSize(10, 1);
    svg.append("g")
       .attr("transform", `translate(${marginLeft})`)
       .call(yAxis)
       .attr("id", "y-axis");
    
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
    svg.append("g")
        .attr("transform", `translate(0, ${graphHeight - marginBottom})`)
        .call(xAxis)
        .attr("id", "x-axis")

    
    // Color Scale
    const colorScale = d3.scaleSequential()
                        .domain(d3.extent(dataset, d => d.variance).reverse())
                        .interpolator(d3.interpolateRdYlBu)

    // Legend
    const legendValues = [1, 0.75, 0.5, 0.25, 0]
    const legendScale = d3.scaleSequential()
                            .domain([0, 1])
                            .interpolator(d3.interpolateRdYlBu);
    const legendToTemp = d3.scaleBand(legendValues.reverse(), d3.extent(dataset, d => d.variance));
    const tempBreakpoints = legendValues.map(d => 8.66 + legendToTemp(d));
    const legendAxisScale = d3.scaleBand(tempBreakpoints, [0, 250]);
    const legend = d3.select("#heat-map-legend")
                        .append("svg")
                        .attr("width", graphWidth)
                        .attr("height", 100)
                        .attr("id", "legend");
                        
    const legendAxis = d3.axisBottom(legendAxisScale).ticks(5).tickFormat(d3.format('.1f'));
    legend.append("g")
            .attr("transform", `translate(${(graphWidth / 2 - 150)}, 30)`)
            .call(legendAxis)

    legend.selectAll("rect")
            .data(legendValues)
            .enter()
            .append("rect")
            .attr("width", 50)
            .attr("height", 30)
            .attr("x", (d, i) => (i * 50) + (graphWidth / 2 - 150))
            .attr("fill", (d, i) => legendScale(d))
            .attr("stroke", "black")
            .attr("stroke-width", "1");

    // Tooltip
    const tooltip = d3.select("body")
                    .append("div")
                    .attr("class", "tooltip")
                    .attr("id", "tooltip")
                    .style("opacity", 0);

    // Rects
    svg.selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
        .attr("width", (graphWidth - marginLeft - marginRight) / yearsLength)
        .attr("height", (graphHeight - marginBottom - marginTop) / 12)
        .attr("y", (d, i) => yScale(d.month - 1))
        .attr("x", (d, i) => xScale(d.year))
        .attr("fill", d => colorScale(d.variance))
        .attr("class", "cell")
        .attr("data-month", d => d.month - 1)
        .attr("data-year", d => d.year)
        .attr("data-temp", d => d.variance)
        .on("mouseover", function(event, d) {
            var date = new Date(d.year, d.month);
            tooltip.transition()
                    .duration(0)
                    .style("opacity", 0.9);
            tooltip.html(`${d3.utcFormat('%B - %Y')(date)}<br>
                         Temperature: ${(data.baseTemperature + d.variance).toFixed(1)}ºC<br>
                         Variance: ${d.variance.toFixed(1)}ºC`)
                      .style("left", event.pageX + 10 + "px")
                      .style("top", event.pageY + 15 + "px")
                      .attr("data-year", d.year);
          })
          .on("mouseout", function(d) {
            tooltip
              .transition()
              .duration(400)
              .style("opacity", 0);
          });
}

buildHeatMap();