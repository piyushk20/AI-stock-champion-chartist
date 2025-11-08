# Project Roadmap & TODO List

This document outlines potential future enhancements and improvements for the AI Stock Champion Chartist application.

## UI/UX Enhancements

-   [ ] **Interactive Charts**: Integrate a lightweight charting library (e.g., Chart.js, TradingView Lightweight Charts) to display the historical data used in the analysis.
-   [ ] **Analysis History**: Implement a feature to view and revisit recently generated analysis reports.
-   [ ] **Dark/Light Mode**: Add a toggle for users to switch between a dark and light theme.
-   [ ] **Improved Mobile Responsiveness**: Enhance the layout of the analysis report for better readability on smaller mobile devices.
-   [x] **Copy to Clipboard**: Add buttons to easily copy sections of the analysis, like trade setups or key levels.

## Backend & Data Enhancements

-   [ ] **Dedicated Backend Service**: Replace the public CORS proxy with a dedicated server-side backend. This would make data fetching more reliable, secure, and allow for caching.
-   [ ] **Integrate More Data Sources**:
    -   Fetch company news and sentiment data to add a fundamental context layer.
    -   Incorporate economic calendar events (e.g., earnings dates, Fed meetings).
-   [ ] **API Response Caching**: Implement a caching layer (e.g., Redis) on the backend to store recent analysis results, reducing API costs and speeding up repeat queries.
-   [ ] **WebSocket for Live Prices**: Replace the polling mechanism with a WebSocket connection for more efficient, true real-time price updates.

## AI & Analysis Features

-   [ ] **Customizable Indicators**: Allow users to specify which technical indicators they want the AI to focus on, or to adjust the parameters (e.g., change RSI period from 14 to 9).
-   [ ] **Comparative Analysis**: Add a feature to analyze two assets side-by-side, with the AI highlighting their relative strengths and weaknesses.
-   [ ] **Cryptocurrency Support**: Expand the symbol search and data fetching capabilities to include major cryptocurrencies.
-   [ ] **Export Reports**: Add a feature to save or export the final analysis report as a PDF or a shareable image.
-   [ ] **Deeper Image Analysis**: For chart uploads, prompt the AI to identify and label user-drawn trendlines or patterns.