import pandas as pd
import glob
import re
import os
import country_converter as coco

# Step 1: Locate all CSV files
folder_path = "datsets/"
files = glob.glob(os.path.join(folder_path, "*.csv"))
if not files:
    print("❌ No CSV files found in the 'datsets/' directory.")
    exit()

merged_data = []

# Step 2: Rename map for harmonizing columns
rename_map = {
    "Country": "Country",
    "Country name": "Country",
    "Country or region": "Country",

    "Happiness Score": "Happiness_Score",
    "Happiness.Score": "Happiness_Score",
    "Happiness score": "Happiness_Score",
    "Score": "Happiness_Score",
    "Ladder score": "Happiness_Score",

    "GDP per capita": "GDP",
    "Economy (GDP per Capita)": "GDP",
    "Logged GDP per capita": "GDP",
    "Explained by: GDP per capita": "GDP",

    "Family": "Social_Support",
    "Social support": "Social_Support",
    "Explained by: Social support": "Social_Support",

    "Health (Life Expectancy)": "Life_Expectancy",
    "Healthy life expectancy": "Life_Expectancy",
    "Health..Life.Expectancy.": "Life_Expectancy",
    "Explained by: Healthy life expectancy": "Life_Expectancy",

    "Freedom to make life choices": "Freedom",
    "Freedom": "Freedom",
    "Explained by: Freedom to make life choices": "Freedom",

    "Generosity": "Generosity",
    "Explained by: Generosity": "Generosity",

    "Trust (Government Corruption)": "Corruption",
    "Perceptions of corruption": "Corruption",
    "Trust..Government.Corruption.": "Corruption",
    "Explained by: Perceptions of corruption": "Corruption"
}

# Step 3: Final columns to keep
required_cols = [
    "Country", "Happiness_Score", "GDP", "Social_Support",
    "Life_Expectancy", "Freedom", "Generosity", "Corruption", "Year"
]

# Step 4: Deduplication helper
def deduplicate_columns(columns):
    seen = {}
    new_cols = []
    for col in columns:
        if col not in seen:
            seen[col] = 1
            new_cols.append(col)
        else:
            seen[col] += 1
            new_cols.append(f"{col}_{seen[col]}")
    return new_cols

# Step 5: Read and clean each file
for file in files:
    print(f"📄 Processing: {file}")
    year_match = re.search(r"(\d{4})", file)
    year = int(year_match.group(1)) if year_match else None

    df = pd.read_csv(file, encoding="utf-8")

    # Fix comma decimal formatting
    for col in df.select_dtypes(include=["object"]).columns:
        df[col] = df[col].str.replace(",", ".", regex=False)

    # Rename columns
    df = df.rename(columns=rename_map)
    df.columns = deduplicate_columns(df.columns)

    df["Year"] = year

    # Ensure required columns exist
    for col in required_cols:
        if col not in df.columns:
            df[col] = pd.NA

    df = df[required_cols]
    df = df.dropna(subset=["Country", "Happiness_Score"])

    # Convert numerics
    for col in ["Happiness_Score", "GDP", "Social_Support", "Life_Expectancy", "Freedom", "Generosity", "Corruption"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    merged_data.append(df)

# Step 6: Merge all cleaned data
if merged_data:
    final_df = pd.concat(merged_data, ignore_index=True)

    # Standardize country names
    final_df["Country"] = coco.convert(names=final_df["Country"], to="name_short", not_found=None)

    # Save to file
    os.makedirs("data", exist_ok=True)
    final_df.to_csv("data/happiness_cleaned.csv", index=False)
    print("✅ Merged and saved to data/happiness_cleaned.csv")
else:
    print("⚠️ No valid dataframes to merge.")
