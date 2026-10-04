const presentation = document.querySelector("[data-research-presentation]");

if (presentation) {
  const iraqSlides = [
    { image: "research-assets/slides/slide-01.png", alt: "Cover slide for Work without a safety net? Iraq vulnerable employment estimates, 1991 to 2025.", kicker: "01 / OVERVIEW", title: "Work without a safety net?", copy: "This brief follows vulnerable employment estimates in Iraq from 1991 through 2025. It focuses on differences by sex and treats the figures as descriptive estimates, not explanations of why change happened." },
    { image: "research-assets/slides/slide-02.png", alt: "Definition slide explaining vulnerable employment as own-account and contributing family workers.", kicker: "02 / DEFINITION", title: "What the indicator counts", copy: "Vulnerable employment combines own-account workers and contributing family workers as a share of employed people in the same group. It describes employment status; it does not count every informal job or measure the entire shadow economy." },
    { image: "research-assets/slides/slide-03.png", alt: "Line chart of female, male, and total vulnerable employment estimates in Iraq, 1991 to 2025.", kicker: "03 / ANNUAL ESTIMATES", title: "Three rates trend down; the gap remains", copy: "The editable chart displays milestone years to keep its labels readable. The accompanying CSV has all 35 annual observations, including the uneven movements between those milestones." },
    { image: "research-assets/slides/slide-04.png", alt: "2025 estimates: 36.1 percent female, 26.0 percent male, about a 10 point gap.", kicker: "04 / LATEST YEAR", title: "The 2025 estimates", copy: "The modelled rates are 36.1% of employed women and 26.0% of employed men. The difference is approximately 10 percentage points. These are rates, not counts of workers." },
    { image: "research-assets/slides/slide-05.png", alt: "Overall vulnerable employment estimate decreases from 35.4 percent in 1991 to 27.1 percent in 2025.", kicker: "05 / LONG-RUN CHANGE", title: "Down across the full series", copy: "The overall estimate declined by about 8.2 percentage points between 1991 and 2025. Most of the endpoint change occurred before 2012; this comparison describes the series and does not identify a cause." },
    { image: "research-assets/slides/slide-06.png", alt: "Limitations of the modelled vulnerable employment series.", kicker: "06 / INTERPRETATION", title: "Read the estimates with care", copy: "The series can combine reported observations with imputation and projections. Imputed values carry uncertainty, and a trend by itself cannot show that a policy or event caused a change." },
    { image: "research-assets/slides/slide-07.png", alt: "Future evidence needs include job arrangements, earnings, household context, and local qualitative data.", kicker: "07 / NEXT EVIDENCE", title: "What would strengthen the next answer?", copy: "Household survey data on job arrangements, earnings stability, social protection, and household context could answer questions this broad indicator cannot. Local interviews or microdata could add lived experience." }
  ];

  const projects = {
    iraq: { base: "research-assets/slides", slides: iraqSlides },
    "beyond-the-map": { base: "research-assets/projects/beyond-the-map/slides", slides: [
      ["COVER / EUROPE", "Decoding Europe’s crimes", "The team frames a regional study of theft-related offences and socioeconomic conditions. The deck is a student project built from European regional data."],
      ["02 / RESEARCH QUESTION", "Education, work, income and recorded crime", "The presentation asks how regional education, employment and income indicators relate to recorded theft-related offences at the NUTS 2 level. Its stated study year is 2022."],
      ["03 / LITERATURE", "Economic models, education and social class", "The review introduces opportunity and labour-market explanations, considers how education can shape crime risks, and notes that offence patterns may differ across social and economic settings."],
      ["04 / VARIABLES", "A regional comparison", "The core presentation maps population, tertiary education, household income, unemployment, robberies and burglaries. The report also discusses additional social indicators and theft categories."],
      ["05 / MAPPING", "Start with the geography", "The team uses five-quantile maps to compare the regional distribution of the selected measures and look for visible clustering and outliers before spatial tests."],
      ["06 / POPULATION & EDUCATION", "Regional patterns are uneven", "The maps show population concentrated around metropolitan areas, while tertiary education is distributed differently. Counts and rates need distinct interpretation because regions differ in size."],
      ["07 / OFFENCES", "Robberies and burglaries", "The deck maps recorded robbery and burglary counts. Overlapping high-count areas may reflect urban density and the concentration of valuable targets as well as socioeconomic context."],
      ["08 / ECONOMIC CONDITIONS", "Unemployment and household income", "These maps describe where labour-market conditions and household income cluster. Regional differences give context for the crime maps but do not establish a direct mechanism."],
      ["09 / UNIVARIATE SPATIAL TESTS", "Education clusters across neighboring regions", "The report gives a small positive Moran’s I for tertiary education (I = 0.056, permutation p = 0.002). Local cluster maps distinguish high-high and low-low neighborhoods."],
      ["10 / UNIVARIATE SPATIAL TESTS", "Robbery and burglary clusters", "The report reports small positive spatial autocorrelation for recorded robberies and burglaries (I = 0.016 and 0.024). Local patterns vary, so a continent-wide average does not describe every region."],
      ["11 / UNIVARIATE SPATIAL TESTS", "Economic measures also show clustering", "The report finds positive spatial autocorrelation for unemployment (I = 0.144, p = 0.001) and household income (I = 0.022, p = 0.015), using 999 permutations."],
      ["12 / BIVARIATE ANALYSIS", "Education and neighboring crime counts", "The deck examines whether tertiary education in one region is associated with offence counts in neighboring regions. The reported results are spatial associations, not individual-level effects."],
      ["13 / BIVARIATE ANALYSIS", "Income and unemployment", "The report describes several local combinations of income and unemployment. Its maps highlight contrasts between neighboring regions rather than one uniform relationship."],
      ["14 / CONCLUSION", "Patterns are more complex than one cause", "The authors connect education, employment and income to crime patterns. This page presents their conclusion as an interpretation to investigate further, not proof that socioeconomic conditions cause crime."],
      ["15 / DATA SOURCES", "Eurostat regional indicators", "The source slide lists Eurostat tables for population, education, police-recorded offences, unemployment and household income. The supporting report contains the full bibliography."],
      ["16 / TEAM", "A collaborative course project", "Prepared by Nooruldeen Al-Sammarraie, David-Adrian Lițescu, Alexandra-Maria Dincă and Andrei Neagu, with scientific leadership credited to Elena Maria Prada."]
    ].map(([kicker, title, copy]) => ({ kicker, title, copy, alt: `Beyond the Map presentation slide: ${title}.` })) },
    "shifting-shadows": { base: "research-assets/projects/shifting-shadows/slides", slides: [
      ["COVER / RESEARCH QUESTION", "Shifting Shadows", "A student study of the relationships among corruption perceptions, public protests and emigration, based on cross-country data and statistical models."],
      ["02 / INTRODUCTION", "Voice, exit and country comparisons", "The project asks whether protest activity and corruption perceptions are associated with emigration. The report describes 2022 indicators across an initial set of 50 countries."],
      ["03 / CONCEPTS", "Three measures, several meanings", "The deck defines corruption through the Corruption Perceptions Index (CPI), counts recorded protest events, and measures emigration. These indicators capture different concepts and have different units."],
      ["04 / LITERATURE", "What earlier studies suggest", "The literature review discusses corruption as a possible migration pressure, the relationship between protest and emigration, and how the option to leave may affect collective action."],
      ["05 / DATA & TOOLS", "Sources and RStudio", "The team describes its data sources and uses RStudio for statistical analysis. Source selection and processing are part of the project and should be read alongside the reported sample changes."],
      ["06 / CPI", "Corruption Perceptions Index", "This slide summarizes the CPI values in the selected country sample. CPI is a perception-based index; a higher score generally corresponds to a cleaner public sector, not more perceived corruption."],
      ["07 / DESCRIPTIVE STATISTICS", "Emigration and protest counts", "The presentation summarizes emigrant totals and protest counts. The report distinguishes an initial sample of 50 countries from a final 35-country sample used in some analyses."],
      ["08 / CONFIDENCE INTERVALS", "Protest counts", "The deck reports 90% and 95% confidence intervals for the mean protest count. These intervals summarize uncertainty under the project’s sampling assumptions."],
      ["09 / CONFIDENCE INTERVALS", "Emigration totals", "The slide gives intervals for the mean emigration total. Because these are total counts, country population differences matter when comparing countries."],
      ["10 / HYPOTHESIS TESTS", "Testing a 1.6 million reference value", "The report’s tests do not reject the stated null about the mean emigrant count at the selected significance level. That result is limited to the project’s sample and test setup."],
      ["11 / ANOVA", "Protest counts by subregion", "The reported ANOVA gives p ≈ 0.34, so the project does not find statistically significant differences in mean protest counts across its subregions under this test."],
      ["12 / SIMPLE REGRESSION", "CPI on its own explains little variation", "The presentation reports a weak CPI–protest relationship and a modest CPI–emigration fit that does not meet the usual 5% significance threshold. The sample is small and cross-sectional."],
      ["13 / SIMPLE REGRESSION", "Protests and emigration", "The project reports an association between protest counts and emigration totals, with R² around 0.35 in its simple regression. Counts may be driven by country size, and the model does not show that protests cause people to leave."],
      ["14 / MULTIPLE REGRESSION", "A larger model needs careful checking", "The deck reports a higher fit for a model with several predictors, but sample definitions and coefficient interpretation should be reconciled with the underlying data before drawing substantive conclusions."],
      ["15 / CONCLUSIONS", "Association is not a causal chain", "The presentation discusses corruption, protest and emigration as connected themes. Its country-level observational design cannot establish a sequence in which corruption causes protest and protest causes emigration."],
      ["16 / REFERENCES", "Data and literature cited in the project", "The bibliography identifies the CPI, protest events, emigration and population sources along with the literature reviewed by the team. The report and supporting workbook are available below."],
      ["17 / TEAM", "A collaborative 2024 study", "Prepared by Nooruldeen Al-Sammarraie, David Adrian Lițescu and Casandra Gagiu. The source presentation credits the project’s academic supervisors."]
    ].map(([kicker, title, copy]) => ({ kicker, title, copy, alt: `Shifting Shadows presentation slide: ${title}.` })) },
    "beyond-oil": { base: "research-assets/projects/beyond-oil/slides", slides: [
      ["01 / COVER", "Beyond Oil: Iraq’s economic landscape", "The team introduces Iraq’s reliance on oil and frames diversification as the central economic question. This is a student presentation, and the statistics should be read in the historical context in which the deck was prepared."],
      ["02 / INTRODUCTION", "A resource-rich economy", "The opening section describes Iraq’s economic background and the role of energy resources. It sets up the tension between oil wealth and the challenge of building a broader productive base."],
      ["03 / ECONOMIC SIGNIFICANCE", "Oil shapes the national picture", "This section considers how oil production, exports and public revenues shape the wider economy. The figures are reproduced from the original student deck and are not independently updated here."],
      ["04 / SNAPSHOT", "Iraq at a glance", "A set of population and national-account indicators provides the deck’s 2023-era starting point. Treat these as dated presentation figures rather than current estimates."],
      ["05 / GOODS, SERVICES & TRADE", "Four parts of the economic story", "The presentation shifts to goods, services and the external sector, then moves through the labor market, money and currency markets, and strategic reforms."],
      ["06 / EXPORTS", "Oil dominates the export profile", "The deck emphasizes the concentration of export earnings in oil and discusses exposure to global price changes. A diversified export base would reduce reliance on a narrow range of goods."],
      ["07 / PRODUCTION", "Building capacity beyond extraction", "Agriculture, manufacturing and services are discussed as areas with room to expand. The student analysis presents underdevelopment and oil dependence as connected structural challenges."],
      ["08 / TRADE", "A focused export base and import needs", "This slide reviews the deck’s account of Iraq’s trade profile, including dependence on imports and concentration in exports. The supplied presentation does not include a separate data appendix."],
      ["09 / LABOR MARKET", "Work is the next diversification test", "The labor-market section frames employment as a central part of economic diversification. It introduces constraints and possible responses that the team develops in later slides."],
      ["10 / LABOR MARKET", "A workforce in transition", "This divider introduces the labor-market chapter. The following slides examine workforce composition, employment conditions and the skills needed to support a broader economy."],
      ["11 / WORKFORCE", "Demographics and participation", "The deck looks at Iraq’s working-age population and labor-force participation, including differences by gender. The displayed statistics are historical claims from the source presentation."],
      ["12 / EMPLOYMENT", "Unemployment, informality and mobility", "The presentation discusses unemployment and informal work alongside migration and displacement. These are complex topics: the slide figures alone cannot explain the reasons behind individual employment or migration choices."],
      ["13 / SKILLS", "Education and the skills gap", "The team connects education and workforce skills with the demands of a more diverse economy. The slide raises alignment between training and employment opportunities as an area for attention."],
      ["14 / MONEY & CURRENCY", "Stability supports long-term planning", "The presentation moves from work to currency and financial conditions. It frames monetary stability as part of the environment needed for investment and economic development."],
      ["15 / CURRENCY MARKETS", "The monetary chapter", "This divider introduces the currency and financial-market section, including exchange rates, inflation, interest rates and reserves."],
      ["16 / EXCHANGE & PRICES", "Currency and inflation", "The deck discusses the Iraqi dinar, exchange-rate pressures and inflation. Its historical figures are presented as part of the team’s analysis at the time."],
      ["17 / CENTRAL BANK", "Rates, trade and reserves", "The slide considers interest rates, trade balances and foreign reserves as connected elements of the monetary picture. It does not provide a current policy update."],
      ["18 / REFORM", "A strategic response", "The presentation shifts to possible economic reforms and frames structural diversification as a long-term policy challenge."],
      ["19 / STRATEGIC OUTLOOK", "From diagnosis to direction", "This divider opens the final chapter: structural challenges, opportunities and recommendations for Iraq’s economic future."],
      ["20 / CHALLENGES", "Structural constraints", "The deck brings together oil dependence, employment pressures, limited productive diversity and monetary challenges. These are the team’s organizing themes, not a comprehensive assessment of every current policy issue."],
      ["21 / OPPORTUNITIES", "Human capital and productive capacity", "The team highlights opportunities to invest in people and expand activity beyond oil. Education, skills and a wider range of industries are presented as important ingredients."],
      ["22 / RECOMMENDATIONS", "A broader foundation for growth", "The recommendations summarize the team’s proposed direction for diversification and economic development. They are student recommendations, not evaluated interventions or official policy."],
      ["23 / CONCLUSION", "An economic crossroads", "The final argument returns to the need to reduce concentration and widen Iraq’s sources of jobs, exports and public revenue. The deck presents this as a long-term challenge."],
      ["24 / CREDITS", "Thank you", "The closing slide credits the student team. The original editable PowerPoint is available below for readers who want to inspect the source presentation."]
    ].map(([kicker, title, copy]) => ({ kicker, title, copy, alt: "Beyond Oil presentation slide: " + title + "." })) },
    "charging-ahead": { base: "research-assets/projects/charging-ahead/slides", slides: [
      ["COVER / ROMANIA", "Charging Ahead", "A team marketing study exploring the electric vehicle market in Romania and developing strategic recommendations around Tesla."],
      ["02 / MARKET INTRODUCTION", "A growing market, in 2023 context", "The deck introduces European and Romanian electric-vehicle adoption using figures presented for 2023. These are historical claims from the original coursework, not current market statistics."],
      ["03 / MARKET ANALYSIS", "Battery-electric vehicle growth", "This slide compares 2023 adoption and market-share figures. Its numbers should be read with their original time frame and source context rather than as a live market update."],
      ["04 / TESLA IN ROMANIA", "Company and product position", "The team introduces Tesla’s position and discusses the Model Y and Model 3 as products in the Romanian market context covered by the study."],
      ["05 / SWOT", "Strengths, weaknesses, opportunities and threats", "The SWOT slide groups the team’s claims about Tesla’s brand and innovation, product range and production constraints, potential expansion opportunities, and competitive or safety risks."],
      ["06 / PRODUCT", "Recommendations for the offer", "The product recommendations emphasize ongoing vehicle improvements, broader model choices and investment in battery, software and energy technologies."],
      ["07 / TARGET MARKET", "Audience and positioning", "The team proposes focusing on affluent, sustainability-minded and technology-oriented buyers, while tailoring messages for urban commuters, families and luxury consumers."],
      ["08 / PRICING", "Balancing premium value and access", "Recommendations include competitive premium pricing, communicating long-term ownership costs, and considering financing or incentives to reduce purchase barriers."],
      ["09 / DISTRIBUTION", "Make the purchase and service journey easier", "The deck proposes expanding stores, service and charging access, improving inventory decisions, and strengthening online discovery and purchase options."],
      ["10 / PROMOTION", "Digital storytelling and partnerships", "The promotion plan combines media, social platforms, customer stories and partnerships to explain product technology and sustainability positioning."],
      ["11 / CUSTOMER RELATIONSHIP", "Support after the sale", "The recommendations focus on service quality, staff training and loyalty benefits as ways to improve the ownership experience and retention."],
      ["12 / CONCLUSION", "A roadmap for future positioning", "The final slide brings the marketing recommendations together. They are proposed strategies from a class project; the deck does not report a campaign test or measured business outcomes."]
    ].map(([kicker, title, copy]) => ({ kicker, title, copy, alt: `Charging Ahead presentation slide: ${title}.` })) }
  };

  const project = projects[presentation.dataset.project || "iraq"];
  if (!project) {
    presentation.hidden = true;
  } else {
    const slides = project.slides.map((slide, index) => ({
      ...slide,
      image: slide.image || `${project.base}/slide-${String(index + 1).padStart(2, "0")}.webp`,
      alt: slide.alt || `Slide ${index + 1}: ${slide.title}`
    }));
    const image = presentation.querySelector("[data-slide-image]");
    const count = presentation.querySelector("[data-slide-count]");
    const kicker = presentation.querySelector("[data-slide-kicker]");
    const title = presentation.querySelector("[data-slide-title]");
    const copy = presentation.querySelector("[data-slide-copy]");
    const previous = presentation.querySelector("[data-slide-previous]");
    const next = presentation.querySelector("[data-slide-next]");
    const progress = presentation.querySelector("[data-slide-progress]");
    const progressTrack = presentation.querySelector(".presentation-progress");
    let activeSlide = 0;

    slides.slice(1).forEach((slide) => {
      const preload = new Image();
      preload.src = slide.image;
    });

    const showSlide = (index) => {
      activeSlide = Math.max(0, Math.min(slides.length - 1, index));
      const slide = slides[activeSlide];
      image.src = slide.image;
      image.alt = slide.alt;
      count.textContent = `${String(activeSlide + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
      kicker.textContent = slide.kicker;
      title.textContent = slide.title;
      copy.textContent = slide.copy;
      previous.disabled = activeSlide === 0;
      next.disabled = activeSlide === slides.length - 1;
      progress.style.width = `${((activeSlide + 1) / slides.length) * 100}%`;
      progressTrack.setAttribute("aria-valuenow", String(activeSlide + 1));
      progressTrack.setAttribute("aria-valuemax", String(slides.length));
    };

    previous.addEventListener("click", () => showSlide(activeSlide - 1));
    next.addEventListener("click", () => showSlide(activeSlide + 1));
    presentation.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showSlide(activeSlide - 1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        showSlide(activeSlide + 1);
      }
    });
    showSlide(0);
  }
}
