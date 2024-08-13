import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
const COUNTY_URL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"
const EDUCATION_URL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json"

const fetchData = async (url) => {
    const res = await fetch(url);
    const data = await res.json();
    return data;
}

const buildChoropleth = async () => {
    // Graph Dimension Declarations
    const graphWidth = 1100;
    const graphHeight = 675;
    const legendHeight = 250;
    const legendWidth = 30;
    const legendX = 975;
    const legendY = 200;



    const svg = d3.select("#choropleth-map")
        .append("svg")
        .attr("width", graphWidth)
        .attr("height", graphHeight)
        .attr("id", "choro-svg");
    
    const countyData = await fetchData(COUNTY_URL);
    const educationData = await fetchData(EDUCATION_URL);

    // Color Scale
    const colorScale = d3.scaleSequential()
                        .domain(d3.extent(educationData, d => d.bachelorsOrHigher))
                        .interpolator(d3.interpolatePuBuGn)

    // Legend
    const legendValues = [0, 0.25, 0.5, 0.75, 1]
    const legendScale = d3.scaleSequential()
                            .domain([1, 0])
                            .interpolator(d3.interpolatePuBuGn);
    const legendAxisScale = d3.scaleLinear()
                                .domain(d3.extent(educationData, d => d.bachelorsOrHigher).reverse().map(d => d/100))
                                .range([0, legendHeight]).nice();

    const legendAxis = d3.axisRight(legendAxisScale).tickFormat(d3.format(".0%"));
    const legend = svg.append("g").attr("id", "legend");
    
    legend.append("g")
            .attr("transform", `translate(${legendX + legendWidth}, ${legendY})`)
            .call(legendAxis);

    legend.selectAll("rect")
            .data(legendValues)
            .enter()
            .append("rect")
            .attr("width", legendWidth)
            .attr("height", legendHeight / legendValues.length)
            .attr("x", legendX)
            .attr("y", (d, i) => legendY + (i * legendHeight / legendValues.length))
            .attr("fill", (d, i) => legendScale(d))
            .attr("stroke", "black")
            .attr("stroke-width", "1");

    // Tooltip
    const tooltip = d3.select("body")
                        .append("div")
                        .attr("class", "tooltip")
                        .attr("id", "tooltip")
                        .style("opacity", 0);

    // Map
    const counties = topojson.feature(countyData, countyData.objects.counties);
    const path = d3.geoPath();
    const map = svg.append("g");
    map.selectAll("path")
        .data(counties.features)
        .join("path")
        .attr("d", path)
        .attr("class", "county")
        .attr("data-fips", (d, i) => d.id)
        .attr("data-education", (d, i) => educationData.filter(obj => obj.fips == d.id)[0].bachelorsOrHigher)
        .attr("fill", (d, i) => colorScale(educationData.filter(obj => obj.fips == d.id)[0].bachelorsOrHigher))
        .on("mouseover", function(event, d) {
            const currentCountyData = educationData.filter(obj => obj.fips == d.id)[0];
            tooltip.transition()
                    .duration(0)
                    .style("opacity", 0.9);
            tooltip.html(`${currentCountyData.area_name}, ${currentCountyData.state}<br> 
                          ${currentCountyData.bachelorsOrHigher}%`)
                      .style("left", event.pageX + 10 + "px")
                      .style("top", event.pageY + 15 + "px")
                      .attr("data-year", d.year);
            tooltip.attr("data-education", currentCountyData.bachelorsOrHigher);
          })
          .on("mouseout", function(d) {
            tooltip
              .transition()
              .duration(400)
              .style("opacity", 0);
          });

}

buildChoropleth();