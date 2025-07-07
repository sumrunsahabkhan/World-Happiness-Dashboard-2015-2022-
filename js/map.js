// map.js
// This script renders a world choropleth map of happiness scores using D3.js,
// with interactive year and country filtering, a legend, and insights.

// Load world GeoJSON and cleaned happiness CSV data in parallel
Promise.all([
  d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
  d3.csv("data/happiness_cleaned.csv")
]).then(([geoData, happinessData]) => {
  const width = 960, height = 500;

  // Set up SVG container
  const svg = d3.select("#map-chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Create a geographical projection and path generator
  const projection = d3.geoNaturalEarth1()
    .scale(150)
    .translate([width / 2, height / 2]);

  const path = d3.geoPath().projection(projection);

  // Dropdown elements for filtering
  const yearSelect = d3.select("#year-select");
  const countrySelect = d3.select("#country-select");

  // ✨ Clean and prepare dataset
  happinessData.forEach(d => {
    d.Year = d.Year.trim();
    d.Country = d.Country.trim();
    d.Happiness_Score = +d.Happiness_Score;
  });

  // Extract unique years and countries
  const allYears = Array.from(new Set(happinessData.map(d => d.Year))).sort();
  const allCountries = Array.from(new Set(happinessData.map(d => d.Country))).sort();

  // Populate year dropdown
  yearSelect.selectAll("option").remove();
  allYears.forEach(year => {
    yearSelect.append("option")
      .attr("value", year)
      .text(year);
  });

  // Populate country dropdown
  countrySelect.selectAll("option").remove();
  countrySelect.append("option").attr("value", "All").text("All Countries");
  allCountries.forEach(country => {
    countrySelect.append("option")
      .attr("value", country)
      .text(country);
  });

  // Define color scale thresholds for mapping
  const thresholdScale = d3.scaleThreshold()
    .domain([4, 5, 6, 7])
    .range(["#440154", "#414487", "#2a788e", "#22a884", "#7ad151"]);

  // Tooltip for hover
  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip");

  // Draw the choropleth map for selected year/country
  function drawMap(selectedYear, selectedCountry = "All") {
    const filtered = happinessData.filter(d => d.Year === selectedYear);

    // Map scores by country name
    const dataByCountry = {};
    filtered.forEach(d => {
      dataByCountry[d.Country] = d.Happiness_Score;
    });

    // Clear old paths and title
    svg.selectAll(".country").remove();
    svg.selectAll(".map-title").remove();

    // Draw countries on map
    svg.append("g")
      .selectAll("path")
      .data(geoData.features)
      .join("path")
      .attr("d", path)
      .attr("class", "country")
      .attr("fill", d => {
        const score = dataByCountry[d.properties.name];
        if (!score) return "#f0f0f0"; // No data
        if (selectedCountry !== "All" && d.properties.name !== selectedCountry) return "#e0e0e0"; // Dim others
        return thresholdScale(score);
      })
      .attr("stroke", "#999")
      .on("mouseover", function (event, d) {
        const score = dataByCountry[d.properties.name];
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(
          `<strong>${d.properties.name}</strong><br/>Happiness: ${score ? score.toFixed(2) : 'Data Not Available'}`
        )
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY + 10) + "px");
      })
      .on("mouseout", () => tooltip.transition().duration(300).style("opacity", 0));

    // Add title to map
    svg.append("text")
      .attr("class", "map-title")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("fill", "#264653")
      .text(`World Happiness Map (${selectedYear})`);

    drawLegend();
    showInsights(filtered);
  }

  // Draw legend with threshold bins
  function drawLegend() {
    d3.select("#legend").select("svg").remove();

    const legendSvg = d3.select("#legend")
      .append("svg")
      .attr("width", 320)
      .attr("height", 60);

    const thresholds = [3, 4, 5, 6, 7, 8];

    // Colored rectangles
    legendSvg.selectAll("rect")
      .data(thresholds.slice(0, -1))
      .join("rect")
      .attr("x", (d, i) => 40 + i * 45)
      .attr("y", 20)
      .attr("width", 45)
      .attr("height", 12)
      .style("fill", d => thresholdScale(d));

    // Text labels
    legendSvg.selectAll("text")
      .data(thresholds)
      .join("text")
      .attr("x", (d, i) => 40 + i * 45)
      .attr("y", 45)
      .text(d => d);

    legendSvg.append("text")
      .attr("x", 0)
      .attr("y", 15)
      .text("Happiness Score Bins:")
      .style("font-size", "12px");
  }

  //  Show top and bottom 5 countries based on happiness
  function showInsights(filteredData) {
    const insights = d3.select("#insights");
    insights.html("");

    const sorted = filteredData
      .filter(d => d.Happiness_Score)
      .sort((a, b) => b.Happiness_Score - a.Happiness_Score);

    const top5 = sorted.slice(0, 5);
    const bottom5 = sorted.slice(-5);

    insights.append("h4").text("Top 5 Happiest Countries:");
    insights.append("ul").selectAll("li")
      .data(top5)
      .join("li")
      .text(d => `${d.Country}: ${d.Happiness_Score.toFixed(2)}`);

    insights.append("h4").text("Bottom 5 Least Happy:");
    insights.append("ul").selectAll("li")
      .data(bottom5)
      .join("li")
      .text(d => `${d.Country}: ${d.Happiness_Score.toFixed(2)}`);
  }

  //  Event Listeners for dropdowns
  yearSelect.on("change", function () {
    drawMap(this.value, countrySelect.property("value"));
  });

  countrySelect.on("change", function () {
    drawMap(yearSelect.property("value"), this.value);
  });

  //  Initial map rendering for the latest year
  yearSelect.property("value", allYears[0]);
  drawMap(allYears[0]);
});
