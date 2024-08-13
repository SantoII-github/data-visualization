import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
const FETCH_URL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json"

const fetchData = async (url) => {
    const res = await fetch(url);
    const data = await res.json();
    return data;
}

const buildTreemap = async () => {
    const legendWidth = Math.min(120, screen.width * 0.2);
    const graphWidth = Math.min(1500, screen.width * 0.8) - legendWidth;
    const graphHeight = Math.min(630, screen.height * 0.8);
    const colors = [
        '#1f77b4',
        '#aec7e8',
        '#ff7f0e',
        '#ffbb78',
        '#2ca02c',
        '#98df8a',
        '#d62728',
        '#ff9896',
        '#9467bd',
        '#c5b0d5',
        '#8c564b',
        '#c49c94',
        '#e377c2',
        '#f7b6d2',
        '#7f7f7f',
        '#c7c7c7',
        '#bcbd22',
        '#dbdb8d',
        '#17becf',
        '#9edae5'
      ].map(d => d3.interpolateRgb(d, '#fff')(0.2));
    

    const data = await fetchData(FETCH_URL);
    const platforms = data.children.map(d => d.name);
    const colorScale = d3.scaleOrdinal()
    .domain(platforms)
    .range(colors)
    
    // Tooltip
    const tooltip = d3.select("body")
                    .append("div")
                    .attr("class", "tooltip")
                    .attr("id", "tooltip")
                    .style("opacity", 0);
    // Legend 
    const legend = d3.select("#treemap-legend")
                     .append("svg")
                     .attr("width", legendWidth)
                     .attr("height", graphHeight)
                     .attr("id", "legend");

    const legendItemPadding = 5;
    const legendItemHeight = (graphHeight - legendItemPadding * platforms.length)/platforms.length;

    legend.selectAll("rect")
            .data(platforms)
            .enter()
            .append("rect")
                .attr("width", legendItemHeight)
                .attr("height", legendItemHeight)
                .attr("y", (d, i) => (legendItemHeight + legendItemPadding) * i)
                .attr("x", 13)
                .attr("fill", d => colorScale(d))
                .attr("class", "legend-item");

    legend.selectAll("text")
                .data(platforms)
                .enter()
                .append("text")
                    .attr("y", (d, i) => (legendItemHeight + legendItemPadding) * i + 20)
                    .attr("x", legendItemHeight * 1.5 + legendItemPadding)
                    .text(d => d)
                    .attr("fill", "white");


    // Treemap
    const svg = d3.select("#treemap")
                  .append("svg")
                  .attr("width", graphWidth)
                  .attr("height", graphHeight);

    const root = d3.hierarchy(data)
                    .sum(d => d.value)
                    .sort((a, b) => b.height - a.height || b.value - a.value);

    d3.treemap()
        .size([graphWidth, graphHeight])
        .paddingInner(1)
        (root)

    const cell = svg.selectAll("g")
                    .data(root.leaves())
                    .enter()
                    .append("g")
                    .attr("class", "cell")
                    .attr("transform", d => `translate(${d.x0}, ${d.y0})`)
                    .on("mousemove", function(event, d) {
                        tooltip.transition()
                                .duration(0)
                                .style("opacity", 0.9);
                        tooltip.html(`Name: ${d.data.name}<br>
                                      Category: ${d.data.category}<br>
                                      Value: ${d.data.value} million<br>`)
                                  .style("left", event.pageX + 10 + "px")
                                  .style("top", event.pageY + 15 + "px")
                                  .attr("data-value", d.data.value);
                        
                      })
                      .on("mouseout", function(d) {
                        tooltip
                          .transition()
                          .duration(400)
                          .style("opacity", 0);
                      });
    
    cell.append("rect")
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", d => colorScale(d.data.category))
        .attr("class", "tile")
        .attr("data-name", d => d.data.name)
        .attr("data-value", d => d.data.value)
        .attr("data-category", d => d.data.category);

    cell.append("text")
        .selectAll("tspan")
        .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
        .enter()
        .append("tspan")
            .attr("x", 5)
            .attr("y", (d, i) => 20 + (i * 13))
            .text(d => d)
            .attr("class", "tile-text");
}

buildTreemap();