import React, { useState, useEffect, useRef } from 'react';
import type { AnalysisReport, SummaryTableData, CriticalLevelsData, Indicator, TradeSetup } from '../types';
import { TrendUpIcon, TrendDownIcon, NeutralIcon, CopyIcon, CheckIcon, WarningIcon } from './icons/Icons';

interface AnalysisDisplayProps {
  report: AnalysisReport;
  livePrice: string | null;
  isPollingHalted: boolean;
}

/**
 * A custom hook to manage the visual "flash" effect when the price updates.
 * @param price The live price string.
 * @returns A CSS class string for the background flash effect.
 */
const usePriceFlash = (price: string | null) => {
    const [flash, setFlash] = useState<'up' | 'down' | 'none'>('none');
    const prevPriceRef = useRef<string | null>(null);

    useEffect(() => {
        if (price && prevPriceRef.current && price !== prevPriceRef.current) {
            const current = parseFloat(price);
            const prev = parseFloat(prevPriceRef.current);
            if (!isNaN(current) && !isNaN(prev)) {
                if (current > prev) setFlash('up');
                else if (current < prev) setFlash('down');
            }
            const timer = setTimeout(() => setFlash('none'), 1000);
            return () => clearTimeout(timer);
        }
    }, [price]);

    useEffect(() => {
        prevPriceRef.current = price;
    }, [price]);

    const flashClass = {
        up: 'bg-green-500/30',
        down: 'bg-red-500/30',
        none: 'bg-transparent'
    }[flash];

    return flashClass;
};

const CopyButton: React.FC<{ textToCopy: string | undefined }> = ({ textToCopy }) => {
  const [isCopied, setIsCopied] = React.useState(false);

  const handleCopy = async () => {
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center space-x-1 px-2 py-1 text-xs rounded-md transition-colors duration-200 ${
        isCopied
          ? 'bg-green-500/20 text-green-400'
          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
      }`}
      aria-label="Copy to clipboard"
    >
      {isCopied ? (
        <>
          <CheckIcon className="h-4 w-4" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <CopyIcon className="h-4 w-4" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
};


const Section: React.FC<{ title: string; children: React.ReactNode; copyText?: string; }> = ({ title, children, copyText }) => (
  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold text-blue-400">{title}</h2>
      {copyText && <CopyButton textToCopy={copyText} />}
    </div>
    {children}
  </div>
);

const PriceDisplay: React.FC<{ price: string; flashClass: string; isHalted: boolean; }> = ({ price, flashClass, isHalted }) => (
    <div className="flex items-center justify-start space-x-2">
      <p className={`font-semibold text-white p-1 rounded-md transition-colors duration-300 ${flashClass}`}>{price || 'N/A'}</p>
      {isHalted && (
        <div className="relative group">
          <WarningIcon className="h-5 w-5 text-yellow-500" />
          <div className="absolute bottom-full mb-2 w-48 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-gray-700 shadow-lg z-10">
            Live updates stopped due to connection issues. The price shown may be outdated.
          </div>
        </div>
      )}
    </div>
  );
  
const RsiGauge: React.FC<{ value: string }> = ({ value }) => {
    const rsi = parseFloat(value);
    if (isNaN(rsi)) {
        return <span className="font-mono">{value}</span>;
    }

    const percentage = Math.max(0, Math.min(100, rsi));
    const isOverbought = rsi > 70;
    const isOversold = rsi < 30;

    let colorClass = 'bg-gray-500';
    if (isOverbought) colorClass = 'bg-red-500';
    if (isOversold) colorClass = 'bg-green-500';

    return (
        <div className="flex items-center space-x-2">
            <div className="w-24 h-2 bg-gray-700 rounded-full" title={`RSI: ${rsi.toFixed(2)}`}>
                <div 
                    className="h-2 rounded-full relative" 
                    style={{ background: 'linear-gradient(to right, #28a745, #A0AEC0 30%, #A0AEC0 70%, #dc3545)' }}
                >
                    <div 
                        className={`absolute top-1/2 -translate-y-1/2 h-3 w-1 bg-white rounded-full border border-gray-900`}
                        style={{ left: `${percentage}%`}}
                    ></div>
                </div>
            </div>
            <span className={`font-mono font-semibold ${isOverbought ? 'text-red-400' : isOversold ? 'text-green-400' : 'text-white'}`}>
                {rsi.toFixed(2)}
            </span>
        </div>
    );
};

const SummaryTable: React.FC<{ data: SummaryTableData, livePrice: string | null, isPollingHalted: boolean }> = ({ data, livePrice, isPollingHalted }) => {
    const signalConfig = {
        BUY: { color: 'text-green-400', icon: <TrendUpIcon className="h-5 w-5"/>, text: 'BUY' },
        SELL: { color: 'text-red-400', icon: <TrendDownIcon className="h-5 w-5"/>, text: 'SELL' },
        HOLD: { color: 'text-yellow-400', icon: <NeutralIcon className="h-5 w-5"/>, text: 'HOLD' }
    };
    const currentSignal = signalConfig[data.overallSignal] || signalConfig.HOLD;

    const displayPrice = livePrice || data.currentPrice;
    const priceFlashClass = usePriceFlash(livePrice);

    const summaryItems = [
        { label: "Asset", value: data.asset, isPrice: false },
        { label: "Current Price", value: displayPrice, isPrice: true },
        { label: "Trend", value: data.trend, isPrice: false },
        { label: "Key Support", value: data.keySupport, isPrice: false },
        { label: "Key Resistance", value: data.keyResistance, isPrice: false },
        { label: "Primary Pattern", value: data.primaryPattern, isPrice: false },
        { label: "RSI (14)", value: data.rsi14, isPrice: false },
        { label: "MACD Signal", value: data.macdSignal, isPrice: false },
        { label: "Conviction", value: data.convictionLevel, isPrice: false },
    ];

    return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-bold text-blue-400 mb-4">Quick Summary</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                {summaryItems.map(item => (
                    <div key={item.label}>
                        <p className="text-gray-400">{item.label}</p>
                        {item.isPrice ? (
                            <PriceDisplay price={item.value} flashClass={priceFlashClass} isHalted={isPollingHalted} />
                        ) : (
                            <p className="font-semibold text-white">{item.value || 'N/A'}</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
        <div className="md:col-span-4 bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-blue-400 mb-2">Overall Signal</h3>
              <div className={`flex items-center text-3xl font-bold ${currentSignal.color}`}>
                  {currentSignal.icon}
                  <span className="ml-2">{currentSignal.text}</span>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-bold text-blue-400 mb-2">Suggested Action</h3>
              <p className="text-white font-medium">{data.suggestedAction}</p>
            </div>
        </div>
    </div>
    );
};

const indicatorExplanations: Record<string, { value: string; interpretation: string }> = {
    '20-Day SMA': {
        value: 'The average closing price over the last 20 trading days.',
        interpretation: 'A short-term trend filter. Price above the SMA is generally bullish; below is bearish.'
    },
    '50-Day SMA': {
        value: 'The average closing price over the last 50 trading days.',
        interpretation: 'An intermediate-term trend indicator. Often acts as a key support or resistance level.'
    },
    '200-Day SMA': {
        value: 'The average closing price over the last 200 trading days.',
        interpretation: 'A long-term trend indicator, widely used to define major bull and bear markets.'
    },
    'RSI (14)': {
        value: 'The Relative Strength Index measures the speed and change of price movements on a scale of 0 to 100.',
        interpretation: 'Readings over 70 suggest overbought conditions (potential for a pullback), while readings below 30 suggest oversold conditions (potential for a bounce).'
    },
    'MACD': {
        value: 'The Moving Average Convergence Divergence line value.',
        interpretation: 'Compares two moving averages to show momentum. A crossover of the MACD line above its signal line is bullish; a crossover below is bearish.'
    },
    'Bollinger Bands': {
        value: 'Price position relative to the upper, middle (20-day SMA), or lower band.',
        interpretation: 'Indicates volatility. Bands widening ("expansion") suggest increased volatility, while bands narrowing ("squeeze") suggest low volatility and a potential for a large price move.'
    }
};

const IndicatorMatrix: React.FC<{ indicators: Indicator[] }> = ({ indicators }) => (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-700/50 text-gray-400 uppercase tracking-wider">
          <tr>
            <th className="p-3">Indicator</th>
            <th className="p-3">Value</th>
            <th className="p-3 text-center">Signal</th>
            <th className="p-3">Interpretation</th>
          </tr>
        </thead>
        <tbody>
          {indicators.map((indicator, index) => (
            <React.Fragment key={index}>
                <tr className="border-b border-gray-700">
                    <td className="p-3 font-semibold text-white">{indicator.name}</td>
                    <td className="p-3">
                        {indicator.name === 'RSI (14)' ? <RsiGauge value={indicator.value} /> : <span className="font-mono">{indicator.value}</span>}
                    </td>
                    <td className="p-3 text-2xl text-center">{indicator.signal}</td>
                    <td className="p-3">{indicator.interpretation}</td>
                </tr>
                {indicatorExplanations[indicator.name] && (
                     <tr className="bg-gray-900/50">
                        <td colSpan={4} className="px-3 py-2 text-xs text-gray-400">
                           <p><strong>Value: </strong>{indicatorExplanations[indicator.name].value}</p>
                           <p><strong>Interpretation: </strong>{indicatorExplanations[indicator.name].interpretation}</p>
                        </td>
                    </tr>
                )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
);

const TradeSetupCard: React.FC<{ title: string; data: TradeSetup; isBullish: boolean; }> = ({ title, data, isBullish }) => (
    <div className={`p-4 rounded-lg border ${isBullish ? 'bg-green-500/10 border-green-500/50' : 'bg-red-500/10 border-red-500/50'}`}>
        <h3 className={`flex items-center text-lg font-bold ${isBullish ? 'text-green-400' : 'text-red-400'}`}>
            {isBullish ? <TrendUpIcon className="mr-2"/> : <TrendDownIcon className="mr-2"/>}
            {title}
        </h3>
        <div className="mt-3 space-y-2 text-sm">
            <p><strong className="text-gray-400 w-24 inline-block">Entry:</strong> <span className="font-mono">{data.entry}</span></p>
            <p><strong className="text-gray-400 w-24 inline-block">Target 1:</strong> <span className="font-mono">{data.target1}</span></p>
            <p><strong className="text-gray-400 w-24 inline-block">Target 2:</strong> <span className="font-mono">{data.target2}</span></p>
            <p><strong className="text-gray-400 w-24 inline-block">Stop Loss:</strong> <span className="font-mono">{data.stopLoss}</span></p>
            <p><strong className="text-gray-400 w-24 inline-block">Risk:</strong> <span className="font-mono">{data.risk}</span></p>
        </div>
    </div>
);

const CriticalLevelsSection: React.FC<{ data: CriticalLevelsData; livePrice: string | null; isPollingHalted: boolean; }> = ({ data, livePrice, isPollingHalted }) => {
    const displayPrice = livePrice || data.currentPrice;
    const priceFlashClass = usePriceFlash(livePrice);

    const copyText = `RESISTANCE
- R2: ${data.r2}
- R1: ${data.r1}

CURRENT PRICE: ${displayPrice}

SUPPORT
- S1: ${data.s1}
- S2: ${data.s2}`.trim().replace(/^\s+/gm, '');

    return (
      <Section title="Critical Support & Resistance" copyText={copyText}>
        <div className="font-mono text-center space-y-2">
            <div className="text-red-400"><span className="font-bold">R2:</span> {data.r2}</div>
            <div className="text-red-400/80"><span className="font-bold">R1:</span> {data.r1}</div>
            <div className={`py-2 my-2 border-y-2 border-dashed border-gray-600 rounded-md transition-colors duration-300 ${priceFlashClass}`}>
               <div className="flex items-center justify-center space-x-2 text-white text-lg font-bold">
                    <span>{displayPrice}</span>
                    {isPollingHalted && (
                        <div className="relative group">
                            <WarningIcon className="h-5 w-5 text-yellow-500" />
                            <div className="absolute bottom-full mb-2 w-48 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-gray-700 shadow-lg z-10">
                                Live updates stopped. Price may be outdated.
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="text-green-400/80"><span className="font-bold">S1:</span> {data.s1}</div>
            <div className="text-green-400"><span className="font-bold">S2:</span> {data.s2}</div>
        </div>
      </Section>
    );
};


export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ report, livePrice, isPollingHalted }) => {
    const { 
        summaryTable, marketStructure, criticalLevels, indicatorMatrix, chartPatterns, 
        tradeSetups, confluenceAnalysis, riskFactors, multiTimeframe, narrative 
    } = report;
    
    const overallScore = confluenceAnalysis?.overallScore ?? 0;
    const scoreColor = overallScore >= 70 ? 'bg-green-500' : overallScore >= 40 ? 'bg-yellow-500' : 'bg-red-500';
    const scoreTextColor = overallScore >= 70 ? 'text-green-400' : overallScore >= 40 ? 'text-yellow-400' : 'text-red-400';
    
    let convictionText = 'Low Conviction';
    if (overallScore >= 70) {
        convictionText = 'Strong Conviction';
    } else if (overallScore >= 40) {
        convictionText = 'Moderate Conviction';
    }

    const narrativeText = narrative ? `1. What the chart is telling us:
${narrative.summary}

2. Why certain levels matter:
${narrative.levels}

3. How patterns are developing:
${narrative.patterns}

4. What could trigger the next move:
${narrative.triggers}

5. What could invalidate the analysis:
${narrative.invalidation}`.trim().replace(/^\s+/gm, '') : undefined;

    const tradeSetupsText = (tradeSetups && tradeSetups.bullish && tradeSetups.bearish) ? `📈 BULLISH SCENARIO
Entry: ${tradeSetups.bullish.entry}
Target 1: ${tradeSetups.bullish.target1}
Target 2: ${tradeSetups.bullish.target2}
Stop Loss: ${tradeSetups.bullish.stopLoss}
Risk: ${tradeSetups.bullish.risk}

📉 BEARISH SCENARIO
Entry: ${tradeSetups.bearish.entry}
Target 1: ${tradeSetups.bearish.target1}
Target 2: ${tradeSetups.bearish.target2}
Stop Loss: ${tradeSetups.bearish.stopLoss}
Risk: ${tradeSetups.bearish.risk}`.trim() : undefined;


  return (
    <div className="space-y-6">
      {summaryTable && <SummaryTable data={summaryTable} livePrice={livePrice} isPollingHalted={isPollingHalted} />}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {narrative && <Section title="Detailed Narrative Explanation" copyText={narrativeText}>
             <div className="space-y-4 text-gray-300">
                <div><h4 className="font-semibold text-white">1. What the chart is telling us</h4><p>{narrative.summary}</p></div>
                <div><h4 className="font-semibold text-white">2. Why certain levels matter</h4><p>{narrative.levels}</p></div>
                <div><h4 className="font-semibold text-white">3. How patterns are developing</h4><p>{narrative.patterns}</p></div>
                <div><h4 className="font-semibold text-white">4. What could trigger the next move</h4><p>{narrative.triggers}</p></div>
                <div><h4 className="font-semibold text-white">5. What could invalidate the analysis</h4><p>{narrative.invalidation}</p></div>
             </div>
          </Section>}
          {tradeSetups && <Section title="Trade Setup Recommendations" copyText={tradeSetupsText}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tradeSetups.bullish && <TradeSetupCard title="Bullish Scenario" data={tradeSetups.bullish} isBullish={true} />}
                {tradeSetups.bearish && <TradeSetupCard title="Bearish Scenario" data={tradeSetups.bearish} isBullish={false} />}
            </div>
          </Section>}
        </div>
        <div className="space-y-6">
            {criticalLevels && <CriticalLevelsSection data={criticalLevels} livePrice={livePrice} isPollingHalted={isPollingHalted} />}
            <Section title="Confluence Analysis">
                <div className="space-y-3">
                    <div className="flex justify-between items-center"><span className="text-green-400">Bullish Signals:</span> <span className="font-bold text-white">{confluenceAnalysis?.bullishSignals ?? 'N/A'}</span></div>
                    <div className="flex justify-between items-center"><span className="text-red-400">Bearish Signals:</span> <span className="font-bold text-white">{confluenceAnalysis?.bearishSignals ?? 'N/A'}</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-400">Neutral Signals:</span> <span className="font-bold text-white">{confluenceAnalysis?.neutralSignals ?? 'N/A'}</span></div>
                    <hr className="border-gray-700 my-3" />
                    <div>
                        <div className="flex mb-1 items-center justify-between">
                            <h4 className="text-lg font-bold text-white">Overall Technical Score</h4>
                            <div className="text-right">
                                <span className={`text-xl font-bold ${scoreTextColor}`}>{overallScore}</span>
                                <span className="text-sm text-gray-400">/100</span>
                            </div>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                            <div 
                                className={`${scoreColor} h-4 rounded-full transition-all duration-700 ease-out`} 
                                style={{ width: `${overallScore}%` }}
                                role="progressbar"
                                aria-valuenow={overallScore}
                                aria-valuemin="0"
                                aria-valuemax="100"
                            ></div>
                        </div>
                        <div className="text-right mt-1">
                            <span className={`text-sm font-semibold ${scoreTextColor}`}>{convictionText}</span>
                        </div>
                    </div>
                </div>
            </Section>
        </div>
      </div>
      
      {indicatorMatrix && indicatorMatrix.length > 0 && <Section title="Technical Indicator Matrix">
        <IndicatorMatrix indicators={indicatorMatrix} />
      </Section>}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {marketStructure && <Section title="Market Structure Assessment">
            <ul className="space-y-2 list-disc list-inside">
                <li><strong>Trend:</strong> {marketStructure.trendIdentification}</li>
                <li><strong>Price Action:</strong> {marketStructure.priceActionAnalysis}</li>
                <li><strong>Momentum:</strong> {marketStructure.momentumEvaluation}</li>
                <li><strong>Swing Structure:</strong> {marketStructure.swingStructure}</li>
            </ul>
        </Section>}
        {chartPatterns && <Section title="Chart Pattern Recognition">
            <div className="space-y-3">
              <h4 className="font-semibold text-white">Active Pattern: {chartPatterns.activePattern?.name ?? 'N/A'}</h4>
              <p className="text-sm">{chartPatterns.activePattern?.description ?? ''}</p>
              
              {chartPatterns.rsiDivergence?.detected && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                    <h4 className={`font-semibold text-white flex items-center ${
                        chartPatterns.rsiDivergence.type === 'Bullish' ? 'text-green-400' : 'text-red-400'
                    }`}>
                        {chartPatterns.rsiDivergence.type === 'Bullish' && <TrendUpIcon className="h-5 w-5 mr-2" />}
                        {chartPatterns.rsiDivergence.type === 'Bearish' && <TrendDownIcon className="h-5 w-5 mr-2" />}
                        RSI Divergence Detected: {chartPatterns.rsiDivergence.type}
                    </h4>
                    <p className="text-sm mt-1">{chartPatterns.rsiDivergence.description}</p>
                </div>
              )}

              <h4 className="font-semibold text-white mt-4 pt-4 border-t border-gray-700">Monitored Patterns:</h4>
              <p className="text-sm">{chartPatterns.monitoredPatterns?.join(', ') ?? 'N/A'}</p>
            </div>
        </section>}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {riskFactors && riskFactors.factors?.length > 0 && <Section title="Risk Factors & Caveats">
            <ul className="space-y-2 text-sm text-yellow-400">
                {riskFactors.factors.map((factor, i) => <li key={i} className="flex items-start"><span className="mr-2 mt-1">⚠️</span>{factor}</li>)}
            </ul>
        </Section>}
        {multiTimeframe && <Section title="Multi-Timeframe Context">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-700/50 text-gray-400 uppercase tracking-wider">
                        <tr>
                            <th className="p-3">Timeframe</th><th className="p-3">Trend</th><th className="p-3">Key Level</th><th className="p-3">Bias</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-gray-700">
                            <td className="p-3 font-semibold text-white">Daily</td><td>{multiTimeframe.daily?.trend}</td><td>{multiTimeframe.daily?.keyLevel}</td><td>{multiTimeframe.daily?.bias}</td>
                        </tr>
                        <tr className="border-b border-gray-700">
                            <td className="p-3 font-semibold text-white">Weekly</td><td>{multiTimeframe.weekly?.trend}</td><td>{multiTimeframe.weekly?.keyLevel}</td><td>{multiTimeframe.weekly?.bias}</td>
                        </tr>
                        <tr>
                            <td className="p-3 font-semibold text-white">Monthly</td><td>{multiTimeframe.monthly?.trend}</td><td>{multiTimeframe.monthly?.keyLevel}</td><td>{multiTimeframe.monthly?.bias}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>}
      </div>

    </div>
  );
};