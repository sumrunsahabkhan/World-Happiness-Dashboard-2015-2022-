# World Happiness Report Dashboard (2015–2022)

An interactive web-based visualization system built using **D3.js** to explore trends from the **World Happiness Report (2015–2022)**.


##  Technologies Used
- HTML5, CSS3, JavaScript (D3.js v7)
- CSV data (cleaned & merged from 2015–2022 reports)

### Dataset Columns Used

- `Country`, `Year`, `Happiness_Score`, `GDP`, `Social_Support`, `Life_Expectancy` , `Freedom`, `Generosity`, `Corruption`

---

##  Visualizations Included

- **Bar Chart**  
  Allows users to select a year using a dropdown. Displays the **Top 10 happiest countries** for that year with animated bars and tooltip highlights.

- **Line Chart**  
  Users can select one or more countries to analyze **happiness trends over time (2015–2022)**. This supports both single-country and multi-country comparison using a dynamic line plot.

- **Scatter Plot**  
  For a selected year, users can visualize the relationship between **Happiness Score and another factor** (such as GDP, Social Support, or Freedom). Bubble sizes represent Life Expectancy or another metric.

- **Choropleth Map**  
  A world map colored by happiness scores for a given year. Hovering on a country shows tooltips with detailed scores. Also highlights **top 5 and bottom 5** countries in a side panel.


## How to Run the Application

### Option 1: Clone and Run with Live Server 
- **Clone the GitHub repository**:
    git clone https://github.com/sumrunsahabkhan/World-Happiness-Dashboard-2015-2022-.git
- **Navigate to the project folder**:
    cd happiness-visualization
- **Open the folder in Visual Studio Code**:
- **Install the Live Server extension in VS Code**:
    Search for "Live Server" by Ritwick Dey and  Install
- **Launch the app**:
    In the Explorer panel, right-click on index.html
    Select "Open with Live Server"
  - Your default browser will open at http://127.0.0.1:5500 or similar, and the dashboard will be fully functional.

### Option 2: Run Using Python 
- **Open your terminal or command prompt**
- **Navigate to the project directory**:
    cd happiness-visualization
- **Start a simple local server using Python**:
    python -m http.server 8000
- **Open your browser and visit**:
    http://localhost:8000


---

