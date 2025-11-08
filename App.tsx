import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { AnalysisReport } from './types';
import { getTechnicalAnalysis, fetchLivePrice } from './services/geminiService';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { AnalysisDisplay } from './components/AnalysisDisplay';
import { Loader } from './components/Loader';
import { ErrorMessage } from './components/ErrorMessage';
import { Intro } from './components/Intro';

const App: React.FC = () => {
  const [analysisReport, setAnalysisReport] = useState<AnalysisReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [livePrice, setLivePrice] = useState<string | null>(null);
  const [isPollingHalted, setIsPollingHalted] = useState<boolean>(false);
  const priceUpdateInterval = useRef<number | null>(null);
  const pollingFailureCount = useRef<number>(0);

  const stopPolling = useCallback((halted: boolean = false) => {
    if (priceUpdateInterval.current) {
      clearInterval(priceUpdateInterval.current);
      priceUpdateInterval.current = null;
      pollingFailureCount.current = 0;
      if (halted) {
        setIsPollingHalted(true);
      }
    }
  }, []);

  // Effect to clear interval on component unmount
  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const handleAnalysisRequest = useCallback(async (symbol: string, image: { mimeType: string; data: string } | null, timeframe: string) => {
    setIsLoading(true);
    setError(null);
    setAnalysisReport(null);
    setLivePrice(null);
    setIsPollingHalted(false); // Reset halted state on new request
    stopPolling(); // Clear any existing interval

    try {
      const report = await getTechnicalAnalysis(symbol, image, timeframe);
      setAnalysisReport(report);

      // Use the dedicated symbol from the report for reliable polling.
      const assetSymbol = report.summaryTable?.symbol;

      if (assetSymbol) {
        // Start live polling for the new asset
        priceUpdateInterval.current = window.setInterval(async () => {
          const newPrice = await fetchLivePrice(assetSymbol);
          if (newPrice) {
            setLivePrice(newPrice);
            pollingFailureCount.current = 0; // Reset counter on success
          } else {
            pollingFailureCount.current += 1; // Increment counter on failure
            // If polling fails 5 consecutive times, stop to prevent spamming the network.
            if (pollingFailureCount.current >= 5) {
              console.warn(`Live price polling failed 5 times for ${assetSymbol}. Stopping updates.`);
              stopPolling(true); // Pass true to indicate it was halted due to errors
            }
          }
        }, 5000); // Poll every 5 seconds
      }

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [stopPolling]);

  return (
    <div className="min-h-screen bg-gray-900 font-sans text-gray-300">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <InputForm onAnalysisRequest={handleAnalysisRequest} isLoading={isLoading} />
        
        <div className="mt-8">
          {isLoading && <Loader />}
          {error && <ErrorMessage message={error} />}
          {analysisReport && <AnalysisDisplay report={analysisReport} livePrice={livePrice} isPollingHalted={isPollingHalted} />}
          {!isLoading && !error && !analysisReport && <Intro />}
        </div>
      </main>
       <footer className="text-center py-4 text-gray-600 text-sm">
          <p>AI Stock Champion Chartist. Educational purposes only. Not financial advice.</p>
        </footer>
    </div>
  );
};

export default App;