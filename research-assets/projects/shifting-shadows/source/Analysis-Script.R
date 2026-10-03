library(dplyr)
library(knitr)
library(kableExtra)
library(ggplot2)
library(stargazer)

set.seed(222)
# Set options to display numbers without scientific notation
options(scipen = 999, digits = 10)

# We have approximated some variables for some of the countries.
# Number of emigrants approximations: 

# The countries data set with the name of the country, region, subregion, population, number of emigrants, Corruption Perception Index (CPI) and number of protests.
countries_data<- data.frame(
  country = c("Albania", "Australia", "Austria", "Belarus", "Belgium", "Bosnia & Herzegovina", "Bulgaria", "Canada", "Croatia", "Cyprus", "Czechia", "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", "Iceland", "Indonesia", "Iraq", "Ireland", "Italy", "Japan", "Latvia", "Lithuania", "Luxembourg", "Malta", "Mexico", "Moldova", "Montenegro", "Netherlands", "North Macedonia", "Norway", "Philippines", "Poland", "Portugal", "Romania", "Russia", "Serbia", "Slovakia", "Slovenia", "South Korea", "Spain", "Sweden", "Switzerland", "Thailand", "Turkey", "Ukraine", "United Kingdom"),
  subregion = c("Southern", "Australasia", "Central", "Eastern", "Western", "Southern", "Southern", "North", "Southern", "Southern", "Central", "Northern", "Northern", "Northern", "Western", "Central", "Southern", "Central", "Northern", "Southeast", "West", "Western", "Southern", "East", "Northern", "Northern", "Central", "Southern", "Central", "Eastern", "Southern", "Western", "Southern", "Northern", "Southeast", "Eastern", "Southern", "Eastern", "Eastern", "Southern", "Central", "Southern", "East", "Southern", "Northern", "Central", "Southeast", "West", "Eastern", "Western"),
  region = c("Europe", "Oceania", "Europe", "Europe", "Europe", "Europe", "Europe", "America", "Europe", "Europe", "Europe", "Europe", "Europe", "Europe", "Europe", "Europe", "Europe", "Europe", "Europe", "Asia", "Asia", "Europe", "Europe", "Asia", "Europe", "Europe", "Europe", "Europe", "America", "Europe", "Europe", "Europe", "Europe", "Europe", "Asia", "Europe", "Europe", "Europe", "Europe", "Europe", "Europe", "Europe", "Asia", "Europe", "Europe", "Europe", "Asia", "Asia", "Europe", "Europe"),
  population = c("2,793,592", "26,177,413", "8,978,929", "9,534,954", "11,617,623", "3,233,526", "6,838,937", "38,454,327", "3,862,305", "904,705", "10,516,707", "5,873,420", "1,331,796", "5,548,241", "67,957,053", "83,237,124", "10,459,782", "9,689,010", "376,248", "275,501,399", "44,496,122", "5,060,004", "59,030,133", "123,951,692", "1,875,757", "2,805,998", "645,397", "520,971", "127,504,125", "2,603,729", "617,683", "17,590,672", "1,837,114", "5,425,270", "115,559,009", "36,889,761", "10,352,042", "19,042,455", "144,713,314", "6,797,105", "5,434,712", "2,107,180", "51,815,810", "47,432,893", "10,452,326", "8,738,791", "71,697,030", "84,680,273", "40,997,698", "67,508,936"),
  no_of_emigrants = c("1,250,451", "598,765", "600,740", "1,483,626", "577,463", "1,687,639", "1,683,074", "1,292,329", "1,039,526", "173,210", "1,026,108", "257,025", "206,631", "311,889", "2,341,908", "3,855,268", "80,307", "714,420", "43,251", "4,601,369", "2,077,976", "734,317", "3,258,831", "808,825", "380,010", "658,057", "81,757", "102,793", "11,185,737", "1,159,443", "132,965", "970,403", "693,896", "191,392", "6,094,307", "4,825,096", "2,081,419", "3,987,093", "10,756,697", "1,003,962", "419,651", "160,197", "2,204,554", "1,489,823", "327,581", "713,623", "1,086,985", "3,411,408", "8,139,144", "4,732,510"),
  CPI = c("36", "75", "71", "39", "73", "34", "43", "74", "50", "52", "56", "90", "74", "87", "72", "79", "52", "42", "74", "34", "23", "77", "56", "73", "59", "62", "77", "51", "31", "39", "45", "80", "40", "84", "34", "55", "62", "46", "28", "36", "53", "56", "63", "60", "83", "82", "36", "36", "33", "73"),
  no_of_protests = c("147", "794", "294", "82", "523", "151", "605", "1828", "111", "388", "299", "371", "74", "345", "6421", "4770", "434", "415", "28", "3069", "1000", "279", "4594", "1584", "47", "76", "33", "81", "6019", "414", "297", "706", "161", "482", "269", "1152", "331", "206", "1302", "380", "83", "64", "6014", "3816", "1473", "186", "355", "4050", "292", "1745"),
  education_level = c("0", "1", "1", "0", "1", "0", "0", "1", "0", "0", "1", "1", "0", "1", "1", "1", "1", "1", "1", "0", "0", "1", "1", "1", "0", "0", "1", "0", "0", "0", "0", "1", "0", "1", "0", "1", "1", "0", "1", "0", "0", "0", "1", "1", "1", "1", "0", "1", "0", "1"),
  stringsAsFactors = FALSE
)

# Define sample size
sample_size <- 50

# Create an empty list to store sampled data frames
sampled_countries_list <- list()

# Iterate through each subregion or country group
for (subregion_name in unique(countries_data$subregion)) {
  # Filter data for the current subregion
  subregion_data <- filter(countries_data, subregion == subregion_name)
  
  # Append subregion data to the list
  sampled_countries_list[[subregion_name]] <- subregion_data
}

# Combine all sampled data frames into one data frame
sampled_countries <- do.call(rbind, sampled_countries_list)

# Reset row names to NULL for a clean print
rownames(sampled_countries) <- NULL

# Print initial sample
print(
  sampled_countries %>%
    arrange(country) %>%
    select(country, subregion, region, population, no_of_emigrants, CPI, no_of_protests)
)

# Print the countries_data dataframe in a formatted table
kable(countries_data, format = "html", align = "c") %>%
  kable_styling(full_width = FALSE)

# Compute mean
mean_population <- mean(as.numeric(gsub(",", "", sampled_countries$population)))
mean_emigrants <- mean(as.numeric(gsub(",", "", sampled_countries$no_of_emigrants)))
mean_protests <- mean(as.numeric(gsub(",", "", sampled_countries$no_of_protests)))
mean_cpi <- mean(as.numeric(gsub("%", "", sampled_countries$CPI)))

# Compute mode
mode_emigrants <- as.numeric(names(sort(-table(as.numeric(gsub(",", "", sampled_countries$no_of_emigrants))))[1]))
mode_protests <- as.numeric(names(sort(-table(sampled_countries$no_of_protests))[1]))
mode_cpi <- as.numeric(names(sort(-table(as.numeric(gsub("%", "", sampled_countries$CPI))))[1]))

# Compute median
median_population <- median(as.numeric(gsub(",", "", sampled_countries$population)))
median_emigrants <- median(as.numeric(gsub(",", "", sampled_countries$no_of_emigrants)))
median_protests <- median(as.numeric(gsub(",", "", sampled_countries$no_of_protests)))
median_cpi <- median(as.numeric(gsub("%", "", sampled_countries$CPI)))

# Compute standard deviation
sd_population <- sd(as.numeric(gsub(",", "", sampled_countries$population)))
sd_emigrants <- sd(as.numeric(gsub(",", "", sampled_countries$no_of_emigrants)))
sd_protests <- sd(sampled_countries$no_of_protests)
sd_cpi <- sd(as.numeric(gsub("%", "", sampled_countries$CPI)))

# Compute standard error
se_population <- sd_population / sqrt(length(sampled_countries$population))
se_emigrants <- sd_emigrants / sqrt(length(sampled_countries$no_of_emigrants))
se_protests <- sd_protests / sqrt(length(sampled_countries$no_of_protests))
se_cpi <- sd_cpi / sqrt(length(as.numeric(gsub("%", "", sampled_countries$CPI))))

# Compute variance
var_population <- var(as.numeric(gsub(",", "", sampled_countries$population)))
var_emigrants <- var(as.numeric(gsub(",", "", sampled_countries$no_of_emigrants)))
var_protests <- var(sampled_countries$no_of_protests)
var_cpi <- var(as.numeric(gsub("%", "", sampled_countries$CPI)))

# Create a data frame to store the results
stats_df <- data.frame(
  Variables = c("Mean", "Mode", "Median", "Standard Deviation", "Standard Error", "Variance"),
  Population = c(mean_population, NA, median_population, sd_population, se_population, var_population),
  Emigrants = c(mean_emigrants, mode_emigrants, median_emigrants, sd_emigrants, se_emigrants, var_emigrants),
  Protests = c(mean_protests, mode_protests, median_protests, sd_protests, se_protests, var_protests),
  CPI = c(mean_cpi, mode_cpi, median_cpi, sd_cpi, se_cpi, var_cpi)
)

# Print the computed statistics
print(stats_df)

##############################################################################

# 1. Random stratified sampling

# Strata for Western Europe

# Define sample size for Western Europe
sample_size_western <- 4

# Filter data for Western Europe
western_europe_data <- filter(countries_data, subregion == "Western")

# Perform random sampling for Western Europe
sampled_western <- western_europe_data %>%
  sample_n(size = sample_size_western, replace = FALSE) %>%
  ungroup()

# Print sampled Western Europe countries
print(select(sampled_western, country, population, no_of_emigrants, CPI, no_of_protests))

##############################################################################

# Strata for Eastern Europe

# Define sample size for Eastern Europe
sample_size_eastern <- 4

# Filter data for Eastern Europe
eastern_europe_data <- filter(countries_data, subregion == "Eastern")

# Perform random sampling for Eastern Europe without replacement
sampled_eastern <- eastern_europe_data %>%
  slice_sample(n = sample_size_eastern, replace = FALSE) %>%
  ungroup()

# Print sampled Eastern Europe countries
print(select(sampled_eastern, country, population, no_of_emigrants, CPI, no_of_protests))

##############################################################################

# Strata for Central Europe

# Define sample size for Central Europe
sample_size_central <- 5

# Filter data for Central Europe
central_europe_data <- filter(countries_data, subregion == "Central")

# Perform random sampling for Central Europe without replacement
sampled_central <- central_europe_data %>%
  slice_sample(n = sample_size_central, replace = FALSE) %>%
  ungroup()

# Print sampled Central Europe countries
print(select(sampled_central, country, population, no_of_emigrants, CPI, no_of_protests))

##############################################################################

# Strata for Northern Europe

# Define sample size for Northern Europe
sample_size_northern <- 6

# Filter data for Northern Europe
northern_europe_data <- filter(countries_data, subregion == "Northern")

# Perform random sampling for Northern Europe without replacement
sampled_northern <- northern_europe_data %>%
  slice_sample(n = sample_size_northern, replace = FALSE) %>%
  ungroup()

# Print sampled Northern Europe countries
print(select(sampled_northern, country, population, no_of_emigrants, CPI, no_of_protests))

##############################################################################

# Strata for Southern Europe

# Define sample size for Southern Europe
sample_size_southern <- 8

# Filter data for Southern Europe
southern_europe_data <- filter(countries_data, subregion == "Southern")

# Perform random sampling for Southern Europe without replacement
sampled_southern <- southern_europe_data %>%
  slice_sample(n = sample_size_southern, replace = FALSE) %>%
  ungroup()

# Print sampled Southern Europe countries
print(select(sampled_southern, country, population, no_of_emigrants, CPI, no_of_protests))

##############################################################################

# Strata for Americas and Oceania

# Define sample size for Americas and Oceania
sample_size_americas_oceania <- 3

# Filter data for Americas and Oceania
americas_oceania_data <- filter(countries_data, region %in% c("America", "Oceania"))

# Perform random sampling for Americas and Oceania without replacement
sampled_americas_oceania <- americas_oceania_data %>%
  slice_sample(n = sample_size_americas_oceania, replace = FALSE) %>%
  ungroup()

# Print sampled Americas and Oceania countries
print(select(sampled_americas_oceania, country, population, no_of_emigrants, CPI, no_of_protests))

##############################################################################

# Strata for Asia

# Define sample size for Asia
sample_size_asia <- 5

# Filter data for Asia
asia_data <- filter(countries_data, region == "Asia")

# Perform random sampling for Asia without replacement
sampled_asia <- asia_data %>%
  slice_sample(n = sample_size_asia, replace = FALSE) %>%
  ungroup()

# Print sampled Asian countries
print(select(sampled_asia, country, population, no_of_emigrants, CPI, no_of_protests))

##############################################################################

# Final sample, merged

# Combine all sampled dataframes
final_sample <- bind_rows(
  sampled_western,
  sampled_eastern,
  sampled_central,
  sampled_northern,
  sampled_southern,
  sampled_americas_oceania,
  sampled_asia
)

# Print the merged dataframe
print(final_sample)

##############################################################################

# Now, we compute the descriptive statistics for the number of emigrants variable of our sample named: "final_sample".

# Print the sample with only the number of emigrants variable
print(select(final_sample, country, no_of_emigrants))

# Convert "no_of_emigrants" to numeric
final_sample$no_of_emigrants <- as.numeric(as.character(gsub(",", "", final_sample$no_of_emigrants)))

# Compute descriptive statistics for "no_of_emigrants" variable
emigrants_stats <- data.frame(
  Variables = c("Mean", "Median", "Mode", "Standard Deviation", "Standard Error", "Variance"),
  Emigrants = c(
    mean(final_sample$no_of_emigrants),
    median(final_sample$no_of_emigrants),
    as.numeric(names(sort(-table(final_sample$no_of_emigrants))[1])),
    sd(final_sample$no_of_emigrants),
    sd(final_sample$no_of_emigrants) / sqrt(length(final_sample$no_of_emigrants)),
    var(final_sample$no_of_emigrants)
  )
)

# Print the computed descriptive statistics for "no_of_emigrants" variable
print(emigrants_stats)

# Combine emigrant data from all countries into a single vector
all_emigrants <- unlist(final_sample$no_of_emigrants)

##############################################################################

# We compute the descriptive statistics for the CPI variable of our sample named: "final_sample".

# Print the sample with only the CPI variable
print(select(final_sample, country, CPI))

# Convert "CPI" to numeric (remove '%' and convert to numeric)
final_sample$CPI <- as.numeric(gsub("%", "", final_sample$CPI))

# Compute descriptive statistics for "CPI" variable
CPI_stats <- data.frame(
  Variables = c("Mean", "Median", "Mode", "Standard Deviation", "Standard Error", "Variance"),
  CPI = c(
    mean(final_sample$CPI),
    median(final_sample$CPI),
    as.numeric(names(sort(-table(final_sample$CPI))[1])),
    sd(final_sample$CPI),
    sd(final_sample$CPI) / sqrt(length(final_sample$CPI)),
    var(final_sample$CPI)
  )
)

# Print the computed descriptive statistics for "CPI" variable
print(CPI_stats)

##############################################################################

# Finally, we compute the descriptive statistics for the number of protests variable of our sample named: "final_sample".

# Print the sample with only the "no_of_protests" variable
print(select(final_sample, country, no_of_protests))

# Convert "no_of_protests" to numeric
final_sample$no_of_protests <- as.numeric(final_sample$no_of_protests)

# Compute descriptive statistics for "no_of_protests" variable
no_of_protests_stats <- data.frame(
  Variables = c("Mean", "Median", "Mode", "Standard Deviation", "Standard Error", "Variance"),
  no_of_protests = c(
    mean(final_sample$no_of_protests),
    median(final_sample$no_of_protests),
    as.numeric(names(sort(-table(final_sample$no_of_protests))[1])),
    sd(final_sample$no_of_protests),
    sd(final_sample$no_of_protests) / sqrt(length(final_sample$no_of_protests)),
    var(final_sample$no_of_protests)
  )
)

# Print the computed descriptive statistics for "no_of_protests" variable
print(no_of_protests_stats)

##############################################################################

# We chose 2 confidence levels: 90% and 95%.

# We analyze the number of emigrants for a confidence level of 90%.

# Given information
confidence_level <- 0.90
sample_size <- nrow(final_sample)  
degrees_freedom <- sample_size - 1
sample_mean <- mean(final_sample$no_of_emigrants)
sample_sd <- sd(final_sample$no_of_emigrants)

# Calculate alpha (significance level)
alpha <- 1 - confidence_level

# Find the critical value (t) from t-distribution
critical_value <- qt((1 - alpha / 2), df = degrees_freedom)

# Calculate the standard error (SE)
SE <- sample_sd / sqrt(sample_size)

# Calculate the margin of error (E)
margin_error <- critical_value * SE

# Calculate the lower limit and upper limit of the confidence interval
lower_limit <- sample_mean - margin_error
upper_limit <- sample_mean + margin_error

# Print the calculated values
cat(
  "Significance level (alpha): ", alpha, "\n",
  "Margin of Error (E): ", margin_error, "\n",
  "Critical Value (t): ", critical_value, "\n",
  "Lower Limit of CI: ", lower_limit, "\n",
  "Upper Limit of CI: ", upper_limit, "\n",
  "\nInterpretation: We are ", confidence_level * 100, "% confident that the population mean score is between ", lower_limit, " and ", upper_limit, "\n",
  sep = ""
)

##############################################################################

# We analyze the number of emigrants for a confidence level of 95%.

# Given information
confidence_level <- 0.95
sample_size <- nrow(final_sample)  
degrees_freedom <- sample_size - 1
sample_mean <- mean(final_sample$no_of_emigrants)
sample_sd <- sd(final_sample$no_of_emigrants)

# Calculate alpha (significance level)
alpha <- 1 - confidence_level

# Find the critical value (t) from t-distribution
critical_value <- qt((1 - alpha / 2), df = degrees_freedom)

# Calculate the standard error (SE)
SE <- sample_sd / sqrt(sample_size)

# Calculate the margin of error (E)
margin_error <- critical_value * SE

# Calculate the lower limit and upper limit of the confidence interval
lower_limit <- sample_mean - margin_error
upper_limit <- sample_mean + margin_error

# Print the calculated values
cat(
  "Significance level (alpha): ", alpha, "\n",
  "Margin of Error (E): ", margin_error, "\n",
  "Critical Value (t): ", critical_value, "\n",
  "Lower Limit of CI: ", lower_limit, "\n",
  "Upper Limit of CI: ", upper_limit, "\n",
  "\nInterpretation: We are ", confidence_level * 100, "% confident that the population mean score is between ", lower_limit, " and ", upper_limit, "\n",
  sep = ""
)

##############################################################################

# We analyze the CPI for a confidence level of 90%.

# Given information
confidence_level <- 0.90
sample_size <- nrow(final_sample)  
degrees_freedom <- sample_size - 1
sample_mean <- mean(final_sample$CPI)  # Assuming CPI is already converted to numeric
sample_sd <- sd(final_sample$CPI)

# Calculate alpha (significance level)
alpha <- 1 - confidence_level

# Find the critical value (t) from t-distribution
critical_value <- qt((1 - alpha / 2), df = degrees_freedom)

# Calculate the standard error (SE)
SE <- sample_sd / sqrt(sample_size)

# Calculate the margin of error (E)
margin_error <- critical_value * SE

# Calculate the lower limit and upper limit of the confidence interval
lower_limit <- sample_mean - margin_error
upper_limit <- sample_mean + margin_error

# Print the calculated values
cat(
  "Significance level (alpha): ", alpha, "\n",
  "Margin of Error (E): ", margin_error, "\n",
  "Critical Value (t): ", critical_value, "\n",
  "Lower Limit of CI: ", lower_limit, "\n",
  "Upper Limit of CI: ", upper_limit, "\n",
  "\nInterpretation: We are ", confidence_level * 100, "% confident that the CPI mean score is between ", lower_limit, " and ", upper_limit, "\n",
  sep = ""
)

##############################################################################

# We analyze the CPI for a confidence level of 95%.

# Given information
confidence_level <- 0.95
sample_size <- nrow(final_sample)  
degrees_freedom <- sample_size - 1
sample_mean <- mean(final_sample$CPI)  # Assuming CPI is already converted to numeric
sample_sd <- sd(final_sample$CPI)

# Calculate alpha (significance level)
alpha <- 1 - confidence_level

# Find the critical value (t) from t-distribution
critical_value <- qt((1 - alpha / 2), df = degrees_freedom)

# Calculate the standard error (SE)
SE <- sample_sd / sqrt(sample_size)

# Calculate the margin of error (E)
margin_error <- critical_value * SE

# Calculate the lower limit and upper limit of the confidence interval
lower_limit <- sample_mean - margin_error
upper_limit <- sample_mean + margin_error

# Print the calculated values
cat(
  "Significance level (alpha): ", alpha, "\n",
  "Margin of Error (E): ", margin_error, "\n",
  "Critical Value (t): ", critical_value, "\n",
  "Lower Limit of CI: ", lower_limit, "\n",
  "Upper Limit of CI: ", upper_limit, "\n",
  "\nInterpretation: We are ", confidence_level * 100, "% confident that the CPI mean score is between ", lower_limit, " and ", upper_limit, "\n",
  sep = ""
)

##############################################################################

# We analyze the number of protests for a confidence level of 90%.

# Given information
confidence_level <- 0.90
sample_size <- nrow(final_sample)  
degrees_freedom <- sample_size - 1
sample_mean <- mean(final_sample$no_of_protests)
sample_sd <- sd(final_sample$no_of_protests)

# Calculate alpha (significance level)
alpha <- 1 - confidence_level

# Find the critical value (t) from t-distribution
critical_value <- qt((1 - alpha / 2), df = degrees_freedom)

# Calculate the standard error (SE)
SE <- sample_sd / sqrt(sample_size)

# Calculate the margin of error (E)
margin_error <- critical_value * SE

# Calculate the lower limit and upper limit of the confidence interval
lower_limit <- sample_mean - margin_error
upper_limit <- sample_mean + margin_error

# Print the calculated values 
cat(
  "Significance level (alpha): ", alpha, "\n",
  "Margin of Error (E): ", margin_error, "\n",
  "Critical Value (t): ", critical_value, "\n",
  "Lower Limit of CI: ", lower_limit, "\n",
  "Upper Limit of CI: ", upper_limit, "\n",
  "\nInterpretation: We are ", confidence_level * 100, "% confident that the protests mean score is between ", lower_limit, " and ", upper_limit, "\n",
  sep = ""
)

##############################################################################

# We analyze the number of protests for a confidence level of 95%.

# Given information
confidence_level <- 0.95
sample_size <- nrow(final_sample)  
degrees_freedom <- sample_size - 1
sample_mean <- mean(final_sample$no_of_protests)
sample_sd <- sd(final_sample$no_of_protests)

# Calculate alpha (significance level)
alpha <- 1 - confidence_level

# Find the critical value (t) from t-distribution
critical_value <- qt((1 - alpha / 2), df = degrees_freedom)

# Calculate the standard error (StdErr)
StdErr <- sample_sd / sqrt(sample_size)

# Calculate the margin of error (E)
margin_error <- critical_value * StdErr

# Calculate the lower limit and upper limit of the confidence interval
lower_limit <- sample_mean - margin_error
upper_limit <- sample_mean + margin_error

# Print the calculated values in a single cat statement
cat(
  "Significance level (alpha): ", alpha, "\n",
  "Margin of Error (E): ", margin_error, "\n",
  "Critical Value (t): ", critical_value, "\n",
  "Lower Limit of CI: ", lower_limit, "\n",
  "Upper Limit of CI: ", upper_limit, "\n",
  "\nInterpretation: We are ", confidence_level * 100, "% confident that the protests mean score is between ", lower_limit, " and ", upper_limit, "\n",
  sep = ""
)

##############################################################################

# 2. Hypothesis testing
# We chose to verify if the average number of emigrants is around 1,600,000.

# We display our chosen sample with the emigrants variable.
print(select(final_sample, country, no_of_emigrants))

# Display hypotheses for number of emigrants
cat(
  "Null Hypothesis (H0): The average number of emigrants is 1,600,000.\n",
  "Alternative Hypothesis (H1): The average number of emigrants is not 1,600,000.\n\n"
)

# Given data for emigrants hypothesis testing
null_mean_emigrants <- 1600000  # Null hypothesis population mean number of emigrants
sample_mean_emigrants <- mean(final_sample$no_of_emigrants)  # Sample mean number of emigrants
sample_size_emigrants <- nrow(final_sample)  # Sample size for number of emigrants

# Population standard deviation (σ) for emigrants
population_sd_emigrants <- sd(as.numeric(gsub(",", "", sampled_countries$no_of_emigrants)))

# Confidence level (1 - alpha)
confidence_level <- 1 - alpha

# Calculate margin of error for number of emigrants
margin_error_emigrants <- critical_z * (population_sd_emigrants / sqrt(sample_size_emigrants))

# Calculate confidence interval for number of emigrants
lower_bound_emigrants <- sample_mean_emigrants - margin_error_emigrants
upper_bound_emigrants <- sample_mean_emigrants + margin_error_emigrants

# Display sample mean for number of emigrants
cat("Sample Mean Number of Emigrants:", sample_mean_emigrants, "\n\n")

# Display confidence interval for number of emigrants
cat("Confidence Interval (", confidence_level * 100, "%): [", lower_bound_emigrants, ", ", upper_bound_emigrants, "]\n")

# Calculate Z-score for number of emigrants
z_score_emigrants <- (sample_mean_emigrants - null_mean_emigrants) / (population_sd_emigrants / sqrt(sample_size_emigrants))

# Display calculated Z-score and critical Z-value for number of emigrants
cat("\nZ-score for Number of Emigrants:", z_score_emigrants, "\n")

cat("The critical Z-value:", critical_z, "\n")

# Print whether the value of z_score_emigrants is greater than critical_z
if (abs(z_score_emigrants) > critical_z) {
  cat("Value of z_score_emigrants (", z_score_emigrants, ") is greater than the value of critical_z (", critical_z, ").\n")
} else {
  cat("Value of z_score_emigrants (", z_score_emigrants, ") is not greater than the value of critical_z (", critical_z, ").\n")
}

# Compare Z-score and critical Z-value for number of emigrants
if (abs(z_score_emigrants) > critical_z) {
  cat("Reject the Null Hypothesis (H0).\n")
  cat("There is sufficient evidence to suggest that the average number of emigrants is not around 1,600,000.\n")
} else {
  cat("Fail to reject the Null Hypothesis (H0).\n")
  cat("There is not enough evidence to suggest that the average number of emigrants is not around 1,600,000.\n")
}

cat("\nBased on the two-tailed test, there is not enough evidence to suggest that the average number of emigrants is not around around 1,600,000. Thus we accept the null
hypothesis, meaning the average number of emigrants is around 1,600,000.")

##############################################################################

# We also decided to do the two-tailed test using the p-value.

# Print the number of emigrants for the final sample
print(select(final_sample, country, no_of_emigrants))

# Display hypotheses for number of emigrants
cat(
  "Null Hypothesis (H0): The average number of emigrants is 1,600,000\n",
  "Alternative Hypothesis (H1): The average number of emigrants is not 1,600,000\n\n"
)

# Given data for emigrants hypothesis testing
null_mean_emigrants <- 1600000  # Null hypothesis population mean number of emigrants
sample_mean_emigrants <- mean(final_sample$no_of_emigrants)  # Sample mean number of emigrants
sample_size_emigrants <- nrow(final_sample)  # Sample size for number of emigrants

# Display sample mean for number of emigrants
cat("Sample Mean Number of Emigrants:", sample_mean_emigrants, "\n\n")

# Population standard deviation (σ) for emigrants
population_sd_emigrants <- sd(as.numeric(gsub(",", "", sampled_countries$no_of_emigrants)))


# Calculate the degrees of freedom
df <- sample_size_emigrants - 1  # Degrees of freedom for a two-tailed t-test

# Calculate the p-value for a two-tailed test
p_value <- 2 * pt(-abs(t_stat_emigrants), df)

# Display calculated p-value for number of emigrants
cat("Degrees of Freedom:", df, "\n")
cat("p-value for Number of Emigrants:", p_value, "\n")

# Set the significance level
alpha <- 0.05  # Significance level

# Print the comparison of p-value with alpha
if (p_value < alpha) {
  cat("The p-value (", p_value, ") is less than alpha (", alpha, "). Reject H0.\n")
} else {
  cat("The p-value (", p_value, ") is greater than or equal to alpha (", alpha, "). Fail to reject H0.\n")
}

# Compare the p-value with the significance level
if (p_value < alpha) {
  cat("\nReject the Null Hypothesis (H0).\n")
  cat("There is sufficient evidence to suggest that the average number of emigrants is not around 1,600,000.\n")
} else {
  cat("\nFail to reject the Null Hypothesis (H0).\n")
  cat("There is not enough evidence to suggest that the average number of emigrants is not around 1,600,000.\n")
}

cat ("\nYet again, based on the two-tailed test, there is not enough evidence to suggest that the average number of emigrants is not 
around 1,600,000. So, we accept the null hypothesis, stating that the average number of emigrants is around 1,600,000.")

##############################################################################

# Now, we're going to do the one-tailed test with a confidence interval of 95%.

# Display hypotheses for number of emigrants
cat(
  "Null Hypothesis (H0): The average number of emigrants is greater or equal to 1,600,000\n",
  "Alternative Hypothesis (H1): The average number of emigrants is less than 1,600,000\n\n"
)

# Set significance level
alpha <- 0.05

# Hypothesized mean
mu0 <- 1600000

# Sample mean
sample_mean <- sample_mean_emigrants

# Population standard deviation 
sigma <- population_sd_emigrants

# Sample size 
n <- 35

# Calculate Z-score
z_score_emigrants <- (sample_mean - mu0) / (sigma / sqrt(n))

# Calculate critical Z-value for a one-tailed test at 95% confidence level (right-tailed)
critical_z_one_tailed <- qnorm(alpha)

# Display calculated Z-score for the number of emigrants
cat("Z-score for number of emigrants: ", z_score_emigrants, "\n")

# Display calculated Z-score and critical Z-value for one-tailed test
cat("Critical Z-value (one-tailed):", critical_z_one_tailed, "\n")

# Print whether the value of z_score_emigrants is greater than critical_z
if (abs(z_score_emigrants) < critical_z_one_tailed) {
  cat("Value of z_score_emigrants (", z_score_emigrants, ") is less than the value of critical_z (", critical_z_one_tailed, ").\n")
} else {
  cat("Value of z_score_emigrants (", z_score_emigrants, ") is greater than the value of critical_z (", critical_z_one_tailed, ").\n")
}

# Compare Z-score and critical Z-value for one-tailed test
if (z_score_emigrants < critical_z_one_tailed) {
  cat("Reject the Null Hypothesis (H0).\n")
  cat("There is sufficient evidence to suggest that the average number of emigrants is greater than 1,600,000.\n")
} else {
  cat("Fail to reject the Null Hypothesis (H0).\n")
  cat("There is not enough evidence to suggest that the average number of emigrants is not less or equal to 1,600,000.\n")
}

cat("\nIn the case of the lower-tailed test using the z-value, there is not enough evidence to suggest that the number of emigrants is not less or equal to 1,600,000. 
So, we fail to reject the null hypothesis, thus accepting it.")

##############################################################################

# And now we're going to do the one-tailed test using the p-value.

# Display hypotheses for number of emigrants
cat(
  "Null Hypothesis (H0): The average number of emigrants is greater or equal to 1,600,000\n",
  "Alternative Hypothesis (H1): The average number of emigrants is less than 1,600,000\n\n"
)

# Calculate the p-value for a one-tailed test
p_value_one_tailed_emigrants <- pnorm(z_score_emigrants)

# Display calculated p-value for one-tailed test for number of emigrants
cat("\np-value (one-tailed) for Number of Emigrants:", p_value_one_tailed_emigrants, "\n")

# Print the comparison of p-value with alpha
if (p_value_one_tailed_emigrants < alpha) {
  cat("The p-value (", p_value_one_tailed_emigrants, ") is less than alpha (", alpha, "). Reject H0.\n")
} else {
  cat("The p-value (", p_value_one_tailed_emigrants, ") is greater than or equal to alpha (", alpha, "). Fail to reject H0.\n")
}

# Comparison between p-value and alpha for one-tailed test
if (p_value_one_tailed_emigrants < alpha) {
  cat("Reject the Null Hypothesis (H0).\n")
  cat("There is sufficient evidence to suggest that the average number of emigrants is greater than 1,600,000.\n")
} else {
  cat("Fail to reject the Null Hypothesis (H0).\n")
  cat("There is not enough evidence to suggest that the average number of emigrants is not less or equal to 1,600,000.\n")
}

cat("\nIn this case, using the p-value for the lower-tailed test we fail to reject the null hypothesis because there is not enough evidence to suggest that the average
number of emigrants is not less or equal to 1,600,000, thus accepting it.")

##############################################################################

# 3. ANOVA analysis

# We chose to do the ANOVA analysis for the number of protests for a confidence level of 95%.

# Convert numeric columns to appropriate data types
countries_data$population <- as.numeric(gsub(",", "", countries_data$population))
countries_data$no_of_emigrants <- as.numeric(gsub(",", "", countries_data$no_of_emigrants))
countries_data$CPI <- as.numeric(gsub("%", "", countries_data$CPI))
countries_data$no_of_protests <- as.numeric(countries_data$no_of_protests)

# Compute group means
group_means <- countries_data %>% 
  group_by(subregion) %>% 
  summarise(mean_protests = mean(no_of_protests))

# Compute overall mean
overall_mean <- mean(countries_data$no_of_protests)

# Compute sum of squares between groups (SSB)
SSB <- sum((group_means$mean_protests - overall_mean)^2 * table(countries_data$subregion))

# Compute degrees of freedom between groups (DFB)
DFB <- length(unique(countries_data$subregion)) - 1

# Compute mean squares between groups (MSB)
MSB <- SSB / DFB

# Compute sum of squares within groups (SSW)
SSW <- sum((countries_data$no_of_protests - ave(countries_data$no_of_protests, countries_data$subregion, FUN = mean))^2)

# Compute degrees of freedom within groups (DFW)
DFW <- nrow(countries_data) - length(unique(countries_data$subregion))

# Compute mean squares within groups (MSW)
MSW <- SSW / DFW

# Compute F-value
F_value <- MSB / MSW

# Compute p-value using F-distribution
p_value <- 1 - pf(F_value, DFB, DFW)

# We display the results of our computations

cat("Overall Mean: ", overall_mean, "\n",
    "Sum of Squares Between Groups (SSB): ", SSB, "\n",
    "Degrees of Freedom Between Groups (DFB): ", DFB, "\n",
    "Mean Squares Between Groups (MSB): ", MSB, "\n",
    "Sum of Squares Within Groups (SSW): ", SSW, "\n",
    "Degrees of Freedom Within Groups (DFW): ", DFW, "\n",
    "Mean Squares Within Groups (MSW): ", MSW, "\n",
    "F-value: ", F_value, "\n",
    "p-value: ", p_value, "\n", sep = "")


# Print ANOVA results in a well organized table
cat("Analysis of Variance (ANOVA) for Number of Protests by Subregion\n",
    "==================================================================================\n",
    "Source          | Df |  Sum Sq     | Mean Sq      | F value       |  Pr(>F)      | \n",
    "==================================================================================\n",
    "Between Groups  | ", DFB, "  | ", SSB, " | ", MSB, "  | ", F_value, "   | ", p_value, " |", "\n",
    "Within Groups   | ", DFW, " | ", SSW, " | ", MSW, "  |", "\t", "\t", "  |", "\t", "\t", " |",  "\n",
    "==================================================================================\n",
    sep = "")

cat("\nThe F value of 1.17 indicates that the variation between subregions means is not much greater than the variation within subregions. \n\nThis is further supported by the p-value of 0.33, which is greater than the typical significance level of 0.05, which indicates that the \nobserved differences in means are not statistically significant.",
    "\n\nTherefore, we fail to reject the null hypothesis, suggesting that the subregions do not significantly differ in terms of the average \nnumber of protests.\n")

##############################################################################

# 4. Simple linear regression.

# Firstly, our chosen dependent variable is the number of protests and our chosen independent variable is the CPI.

# The 30 countries randomly taken
selected_countries <- c("Albania", "Romania", "Greece", "Denmark", "Iraq", "Czechia", "Mexico", 
                        "Estonia", "Bulgaria", "North Macedonia", "Iceland", "Belarus", 
                        "Netherlands", "Austria", "Hungary", "Serbia", "Lithuania", "Spain", 
                        "Philippines", "Switzerland", "Australia", "Cyprus", "Latvia", 
                        "France", "United Kingdom", "Sweden", "Montenegro", "Germany", 
                        "Slovakia", "Thailand")

# Filter the dataset for the selected countries
sampled_data <- countries_data %>% filter(country %in% selected_countries)

# Print the sampled countries
cat("Sampled Countries:\n", paste(sampled_data$country, collapse = ", "), "\n")

# Perform simple linear regression
simple_model <- lm(no_of_emigrants ~ CPI, data = sampled_data)

# Summarize the model
summary(simple_model)

cat("
Interpretations:

Intercept: The expected value of the dependent variable, number of emigrants is 3,863,901 when the independent variable is 0.

CPI: For each one-unit increase in the CPI, the number of emigrants decreases by approximately 38,661. Since the p-value is greater than 0.05,
the effect of the CPI on the number of emigrants is not statistically significant. 

Residual standard error: This value indicates the average distance between the observed and predicted values of the number of emigrants, that being 2,253,484 on 28 degrees of freedom.

R-Squared: The variation in the number of emigrants is explained in proportion of 9.6% by the independent variable, CPI.

F-statistic: While the F-statistic is higher than 1, it is not very high, suggesting that the model with CPI as the predictor does not explain
a substantially larger proportion of the variance in the number of emigrants.

p-value: This p-value is just above the 0.05 threshold, suggesting that the model as a whole is not statistically significant.

")

##############################################################################

# Now, our chosen dependent variable is the number of protests, while the independent variable is still the same, the CPI.

# Filter the dataset for the selected countries
sampled_data <- countries_data %>% filter(country %in% selected_countries)

# Print the sampled countries
cat("Sampled Countries:\n", paste(sampled_data$country, collapse = ", "), "\n")

# Perform simple linear regression
simple_model <- lm(no_of_protests ~ CPI, data = sampled_data)

# Summarize the model
summary(simple_model)

cat("
Interpretations:

Intercept: The expected value of the dependent variable, number of protests is approximately 498 when the independent variable is 0.

CPI: For each one-unit increase in the CPI, the number of protests increases by approximately 10. Since the p-value is greater than 0.05,
the effect of the CPI on the number of protests is not statistically significant. 

Residual standard error: This value indicates the average distance between the observed and predicted values of the number of protests,
that being 1781.59 on 28 degrees of freedom.

R-Squared: The variation in the number of protests is explained in proportion of 1.12% by the independent variable, CPI.

F-statistic: The F-statistic is very low, suggesting that the model with CPI as the predictor does not explain
a substantially larger proportion of the variance in the number of protests.

p-value: This p-value is substantially above the 0.05 threshold, suggesting that the model as a whole is not statistically significant.

")

##############################################################################

# And finally, our chosen dependent variable is the number of emigrants and our independent variable the is number of protests.

# Filter the dataset for the selected countries
sampled_data <- countries_data %>% filter(country %in% selected_countries)

# Print the sampled countries
cat("Sampled Countries:\n", paste(sampled_data$country, collapse = ", "), "\n")

# Perform simple linear regression
simple_model <- lm(no_of_emigrants ~ no_of_protests, data = sampled_data)

# Summarize the model
summary(simple_model)

cat("
Interpretations:

Intercept: The expected value of the dependent variable, number of emigrants is approximately 836,643 when the independent variable is 0.

Number of protests: For each one-unit increase in the number of protests, the number of emigrants increases by approximately 788. Since the p-value is lower than 0.05,
the effect of the number of protests on the number of emigrants is statistically significant. 

Residual standard error: This value indicates the average distance between the observed and predicted values of the number of emigrants,
that being 1,903,191 on 28 degrees of freedom.

R-Squared: The variation in the number of emigrants is explained in proportion of 35% by the independent variable, number of protests.

F-statistic: The F-statistic is relatively high, suggesting that the model with number of protests as the predictor explains
a substantially larger proportion of the variance in the number of emigrants.

p-value: This p-value is substantially below the 0.05 threshold, suggesting that the model as a whole is statistically significant.

")

cat("Therefore, based on our analysis of the simple linear regression, we chose the model with the number of emigrants as the dependent variable and
the number of protests as the independent variable because it is the most significant model from what we computed, due the higher values of
the R-squared and F-statistic and also the really low p-value.")

##############################################################################

# 5. Multiple linear regression

# Load necessary library
library(tidyverse)

# Convert the data to appropriate types
countries_data <- countries_data %>%
  mutate(
    population = as.numeric(gsub(",", "", population)),
    no_of_emigrants = as.numeric(gsub(",", "", no_of_emigrants)),
    CPI = as.numeric(CPI),
    no_of_protests = as.numeric(no_of_protests),
    education_level = factor(education_level, levels = c(0, 1), labels = c("low", "high"))
  )

# Create the interaction term
countries_data <- countries_data %>%
  mutate(interaction_term = CPI * no_of_protests)

# Perform multiple linear regression
model <- lm(no_of_emigrants ~ CPI + no_of_protests + education_level + interaction_term, data = countries_data)

# Summarize the model
summary(model)

# Interpretations

cat("
Interpretations:

Intercept: The expected value of the dependent variable number of emigrants is 4,247,892.77 when the other variables are 0.

CPI: For each one-unit increase in the CPI, the number of emigrants decreases by approximately 61,550, Caeteris Paribus. Since the p-value is less than 0.05, this effect is statistically significant.

Number of protests: For each additional protest, the number of emigrants increases by approximately 1,558, Caeteris Paribus. This effect is also statistically significant, as indicated by the p-value being
less than 0.05.

Education level - high: Countries with a high education level have approximately 1,033,865 more emigrants compared to countries with a low education level, Caeteris Paribus. However, this effect is not statistically significant, as the p-value is greater than 0.05.

Interaction term: The interaction term indicates how the combined effect of CPI and the number of protests influences the number of emigrants.
For each additional unit increase in the product of CPI and the number of protests, the number of emigrants decreases by approximately 18.
This effect is close to being statistically significant, with a p-value just above the 0.05 threshold (p-value = 0.064).

Residual Standard Error: This value represents the average distance that the observed values fall from the regression line. A residual standard error of 1,937,503 indicates that, on average, the actual number of emigrants deviates from the predicted number by this amount.

Multiple R-Squared: The variation in the number of emigrants is explained in proportion of 46.7% by the independent variables, CPI and number of
protests, binary variable education level and the interaction term (CPI * number of protests).

Adjusted R-Squared: It indicates that approximately 42.0% of the variability in the number of emigrants can be explained by the model, accounting for the number of predictors.

F-statistic: With a high F-statistic and a very small p-value (< 0.001), we can reject the null hypothesis that all coefficients are equal to zero.
This indicates that the model is statistically significant and the independent variables collectively have a significant effect on
the number of emigrants.

p-value: The p-value is substantially below the 0.05 threshold, suggesting that the model as a whole is statistically significant.
")