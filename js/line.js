// line.js
// This script creates two line chart visualizations using D3.js:
// 1. A single-country happiness trend line chart.
// 2. A multi-country comparison chart (up to 4 countries).

d3.csv("data/happiness_cleaned.csv").then(data => {
  // Extract unique countries and years from dataset
  const allCountries = Array.from(new Set(data.map(d => d.Country))).sort();
  const years = Array.from(new Set(data.map(d => +d.Year))).sort((a, b) => a - b);

  // Define color scale to distinguish countries
  const color = d3.scaleOrdinal()
    .domain(allCountries)
    .range(d3.schemeCategory10.concat(d3.schemeSet3)); 

  
  // Single Country Dropdown and Line Chart Section
  // ---------------------------------------------------

  const dropdown = d3.select("#country-dropdown")
    .style("margin-bottom", "10px");

  // Add label + select element
  dropdown.append("label").text("Select Country: ");
  const select = dropdown.append("select")
    .attr("id", "line-country-select")
    .style("margin-left", "10px");

  // Populate select options with country names
  select.selectAll("option")
    .data(allCountries)
    .enter()
    .append("option")
    .text(d => d)
    .attr("value", d => d);

  // Render default chart for the first country
  renderCountryChart(allCountries[0]);

  // Redraw chart on selection change
  select.on("change", function () {
    const selected = this.value;
    renderCountryChart(selected);
  });

  //Line Chart for Selected Country
  function renderCountryChart(country) {
    d3.select("#country-line-chart").html(""); // Clear existing chart

    const values = data.filter(d => d.Country === country);

    // Set dimensions and margins
    const margin = { top: 30, right: 30, bottom: 40, left: 50 },
          width = 600 - margin.left - margin.right,
          height = 300 - margin.top - margin.bottom;

    // Create SVG container
    const svg = d3.select("#country-line-chart")
      .append("svg")
      .attr("class", "country-chart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X and Y Scales
    const x = d3.scaleLinear()
      .domain(d3.extent(values, d => +d.Year))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(values, d => +d.Happiness_Score)])
      .range([height, 0]);

    // Line generator
    const line = d3.line()
      .x(d => x(+d.Year))
      .y(d => y(+d.Happiness_Score));

    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    svg.append("g").call(d3.axisLeft(y));

    // Draw line
    svg.append("path")
      .datum(values)
      .attr("fill", "none")
      .attr("stroke", color(country))
      .attr("stroke-width", 2)
      .attr("d", line);

    // Draw data points
    svg.selectAll("circle")
      .data(values)
      .enter()
      .append("circle")
      .attr("cx", d => x(+d.Year))
      .attr("cy", d => y(+d.Happiness_Score))
      .attr("r", 3)
      .attr("fill", color(country));

    // Title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text(`📈 Happiness Trend: ${country}`);
  }

 
  // Multi-Country Comparison Chart Section
  // ---------------------------------------------------

  const multiSelect = d3.select("#multi-country-select");

  // Populate multi-select options
  multiSelect.selectAll("option")
    .data(allCountries)
    .enter()
    .append("option")
    .text(d => d)
    .attr("value", d => d);

  // Handle multi-select changes
  multiSelect.on("change", function () {
    const selected = Array.from(this.selectedOptions).map(opt => opt.value);

    if (selected.length > 4) {
      alert("Please select no more than 4 countries.");
      this.selectedIndex = -1;
      return;
    }

    // Clear and render comparison chart
    d3.select("#comparison-chart").html("");
    if (selected.length > 0) {
      renderSelectedComparisonChart(selected);
    }
  });

  //  Comparison Chart for Selected Countries
  function renderSelectedComparisonChart(selectedCountries) {
    const filtered = data.filter(d => selectedCountries.includes(d.Country));

    // Set dimensions and margins
    const margin = { top: 30, right: 180, bottom: 40, left: 50 },
          width = 800 - margin.left - margin.right,
          height = 350 - margin.top - margin.bottom;

    // Create SVG container
    const svg = d3.select("#comparison-chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X and Y Scales
    const x = d3.scaleLinear()
      .domain(d3.extent(years))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(filtered, d => +d.Happiness_Score)])
      .range([height, 0]);

    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    svg.append("g").call(d3.axisLeft(y));

    // Nest data by country for plotting
    const nested = d3.groups(filtered, d => d.Country);

    // Line generator
    const line = d3.line()
      .x(d => x(+d.Year))
      .y(d => y(+d.Happiness_Score));

    // Draw a line and points for each country
    nested.forEach(([country, values]) => {
      values.sort((a, b) => +a.Year - +b.Year);

      svg.append("path")
        .datum(values)
        .attr("fill", "none")
        .attr("stroke", color(country))
        .attr("stroke-width", 2)
        .attr("d", line);

      svg.selectAll(`circle-${country}`)
        .data(values)
        .enter()
        .append("circle")
        .attr("cx", d => x(+d.Year))
        .attr("cy", d => y(+d.Happiness_Score))
        .attr("r", 3)
        .attr("fill", color(country));
    });

    // Draw legend on the right side
    const legend = svg.append("g")
      .attr("transform", `translate(${width + 10}, 0)`);

    nested.forEach(([country], i) => {
      const row = legend.append("g")
        .attr("transform", `translate(0, ${i * 20})`);

      row.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", color(country));

      row.append("text")
        .attr("x", 15)
        .attr("y", 9)
        .text(country)
        .style("font-size", "12px");
    });
  }
});
