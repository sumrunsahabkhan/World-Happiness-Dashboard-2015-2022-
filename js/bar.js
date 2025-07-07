// bar.js
// This script generates a bar chart of the top 10 happiest countries for a selected year
// using D3.js. Users can also sort the chart in ascending or descending order.

// Load and process the CSV data
d3.csv("data/happiness_cleaned.csv").then(data => {
  // Set margins and dimensions for the chart
  const margin = { top: 40, right: 30, bottom: 60, left: 150 },
        width = 900 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

  // Create SVG container inside the bar-chart div
  const svg = d3.select("#bar-chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Select UI elements
  const yearSelect = d3.select("#bar-year-select");
  const sortSelect = d3.select("#bar-sort");
  const insights = d3.select("#bar-insights");

  // Get unique list of available years in descending order
  const allYears = Array.from(new Set(data.map(d => d.Year))).sort((a, b) => b - a);

  // Populate year dropdown if not already populated
  if (yearSelect.selectAll("option").size() === 0) {
    allYears.forEach(y => {
      yearSelect.append("option").attr("value", y).text(y);
    });
  }

  // Default selected year = latest
  yearSelect.property("value", allYears[0]);

  // Function to draw or update the bar chart
  function drawBarChart() {
    const year = +yearSelect.property("value");         // Selected year
    const sortOrder = sortSelect.property("value");     // Selected sort order

    // Filter data for selected year and ensure score is numeric
    let yearData = data.filter(d => +d.Year === year && d.Happiness_Score);
    yearData = yearData.map(d => ({ ...d, Happiness_Score: +d.Happiness_Score }));

    // Sort data according to selection
    yearData.sort((a, b) =>
      sortOrder === "ascending"
        ? a.Happiness_Score - b.Happiness_Score
        : b.Happiness_Score - a.Happiness_Score
    );

    // Select top 10 countries by score
    const top10 = yearData.slice(0, 10);

    // Identify the happiest country for insights and coloring
    const happiest = top10.reduce((max, d) =>
      d.Happiness_Score > max.Happiness_Score ? d : max, top10[0]);

    // Clear any previous content
    svg.selectAll("*").remove();

    // Create x-scale (score) and y-scale (country names)
    const x = d3.scaleLinear()
      .domain([0, d3.max(top10, d => d.Happiness_Score)])
      .range([0, width]);

    const y = d3.scaleBand()
      .domain(top10.map(d => d.Country))
      .range([0, height])
      .padding(0.2);

    // Add y-axis (country names)
    svg.append("g")
      .call(d3.axisLeft(y));

    // Add x-axis (scores)
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5));

    // Color scale for bars
    const color = d3.scaleSequential()
      .domain([0, d3.max(top10, d => d.Happiness_Score)])
      .interpolator(d3.interpolateViridis);

    // Tooltip div (hidden by default)
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "#eee")
      .style("padding", "6px 10px")
      .style("border-radius", "4px")
      .style("font-size", "13px")
      .style("box-shadow", "0 2px 5px rgba(0,0,0,0.2)")
      .style("opacity", 0);

    // Draw animated bars
    svg.selectAll(".bar")
      .data(top10)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", d => y(d.Country))
      .attr("height", y.bandwidth())
      .attr("width", 0)
      .attr("fill", d =>
        d.Country === happiest.Country ? "#e15759" : color(d.Happiness_Score))
      .transition()
      .duration(800)
      .attr("width", d => x(d.Happiness_Score));

    // Invisible hover layer for tooltips and highlight
    svg.selectAll(".hover-bar")
      .data(top10)
      .enter()
      .append("rect")
      .attr("class", "hover-bar")
      .attr("x", 0)
      .attr("y", d => y(d.Country))
      .attr("height", y.bandwidth())
      .attr("width", d => x(d.Happiness_Score))
      .attr("fill", "transparent")
      .on("mouseover", function (event, d) {
        tooltip.transition().duration(200).style("opacity", 0.95);
        tooltip.html(`<strong>${d.Country}</strong><br>Score: ${d.Happiness_Score.toFixed(2)}`)
          .style("left", event.pageX + 15 + "px")
          .style("top", event.pageY - 30 + "px");
        d3.select(this).attr("stroke", "#333").attr("stroke-width", 1.5);
      })
      .on("mouseout", function () {
        tooltip.transition().duration(300).style("opacity", 0);
        d3.select(this).attr("stroke", "none");
      });

    // Add text labels showing score next to bars
    svg.selectAll(".label")
      .data(top10)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", d => x(d.Happiness_Score) + 5)
      .attr("y", d => y(d.Country) + y.bandwidth() / 1.6)
      .text(d => d.Happiness_Score.toFixed(2))
      .style("font-size", "12px")
      .style("fill", "#333");

    // Display insights below chart
    insights.html(
      `Top country in ${year}: <strong>${happiest.Country}</strong> with a score of <strong>${happiest.Happiness_Score.toFixed(2)}</strong>.`
    );
  }

  // Initial rendering of chart
  drawBarChart();

  // Re-render chart when year or sort order is changed
  yearSelect.on("change", drawBarChart);
  sortSelect.on("change", drawBarChart);
});
