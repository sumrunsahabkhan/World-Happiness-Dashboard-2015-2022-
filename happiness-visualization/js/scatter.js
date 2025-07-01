// scatter.js
// Scatter Plot: Feature vs Happiness Score
// This visualization displays how different factors (GDP, Social Support, etc.)
// correlate with Happiness Score in a selected year using a scatter plot.

d3.csv("data/happiness_cleaned.csv").then(data => {
  // Set dimensions and margins for the SVG container
  const margin = { top: 50, right: 30, bottom: 80, left: 70 },
        width = 700 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;

  // Create and append the SVG canvas
  const svg = d3.select("#scatter-plot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Create a tooltip div for hover interactions
  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // Select the dropdowns
  const yearSelect = d3.select("#scatter-year-select");
  const featureSelect = d3.select("#scatter-feature-select");

  // Extract all unique years from the dataset
  const allYears = Array.from(new Set(data.map(d => d.Year))).sort((a, b) => b - a);

  // Populate the year dropdown
  allYears.forEach(year => {
    yearSelect.append("option").text(year).attr("value", year);
  });

  // Function to draw scatter plot for selected year and feature
  function drawScatter(selectedYear, selectedFeature) {
    // Clear previous plot
    svg.selectAll("*").remove();

    // Filter data for the selected year
    const yearData = data.filter(d => +d.Year === +selectedYear);

    // Define X and Y axis scales
    const x = d3.scaleLinear()
      .domain(d3.extent(yearData, d => +d[selectedFeature])).nice()
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([
        d3.min(yearData, d => +d.Happiness_Score) - 0.2,
        d3.max(yearData, d => +d.Happiness_Score) + 0.2
      ])
      .range([height, 0]);

    // Draw X axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(".2f")));

    // Draw Y axis
    svg.append("g")
      .call(d3.axisLeft(y).ticks(6).tickFormat(d3.format(".2f")));

    // Draw circles representing countries
    svg.selectAll("circle")
      .data(yearData)
      .enter()
      .append("circle")
      .attr("cx", d => x(+d[selectedFeature]))
      .attr("cy", d => y(+d.Happiness_Score))
      .attr("r", 5)
      .style("fill", "#219ebc")
      .style("opacity", 0.75)
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(
          `<strong>${d.Country}</strong><br/>` +
          `${selectedFeature.replace("_", " ")}: ${(+d[selectedFeature]).toFixed(2)}<br/>` +
          `Happiness: ${(+d.Happiness_Score).toFixed(2)}`
        )
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", () => {
        tooltip.transition().duration(300).style("opacity", 0);
      });

    // X-axis label
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + 45)
      .attr("text-anchor", "middle")
      .style("font-size", "13px")
      .text(selectedFeature.replace("_", " "));

    // Y-axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -50)
      .attr("text-anchor", "middle")
      .style("font-size", "13px")
      .text("Happiness Score");

    // Chart title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .style("font-size", "15px")
      .style("fill", "#023047")
      .text(`${selectedFeature.replace("_", " ")} vs Happiness Score (${selectedYear})`);

    // Footer hint
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + 65)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#6c757d")
      .text("Hover on circles to view country-wise insights.");
  }

  // Initial plot with default values
  const defaultYear = allYears[0];
  const defaultFeature = featureSelect.property("value");
  drawScatter(defaultYear, defaultFeature);

  // Update plot on year or feature selection
  yearSelect.on("change", function () {
    drawScatter(this.value, featureSelect.property("value"));
  });

  featureSelect.on("change", function () {
    drawScatter(yearSelect.property("value"), this.value);
  });
});
