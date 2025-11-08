export interface SummaryTableData {
  analysisDate: string;
  asset: string;
  symbol: string; // The official ticker symbol for reliable polling
  currentPrice: string;
  trend: string;
  keySupport: string;
  keyResistance: string;
  primaryPattern: string;
  rsi14: string;
  macdSignal: string;
  overallSignal: 'BUY' | 'SELL' | 'HOLD';
  convictionLevel: 'High' | 'Medium' | 'Low';
  suggestedAction: string;
}

export interface MarketStructureData {
  trendIdentification: string;
  priceActionAnalysis: string;
  momentumEvaluation: string;
  swingStructure: string;
}

export interface CriticalLevelsData {
  r2: string;
  r1: string;
  currentPrice: string;
  s1: string;
  s2: string;
}

export type IndicatorSignal = '🟢' | '🔴' | '⚪';

export interface Indicator {
  name: string;
  value: string;
  signal: IndicatorSignal;
  interpretation: string;
}

export interface ChartPatternData {
  activePattern: {
    name: string;
    description: string;
  };
  monitoredPatterns: string[];
  rsiDivergence: {
    detected: boolean;
    type: 'Bullish' | 'Bearish' | 'None';
    description: string;
  };
}

export interface TradeSetup {
  entry: string;
  target1: string;
  target2: string;
  stopLoss: string;
  risk: string;
}

export interface TradeSetupData {
  bullish: TradeSetup;
  bearish: TradeSetup;
}

export interface ConfluenceData {
  bullishSignals: number;
  bearishSignals: number;
  neutralSignals: number;
  overallScore: number;
}

export interface RiskFactorData {
  factors: string[];
}

export interface MultiTimeframeData {
  daily: { trend: string; keyLevel: string; bias: string; };
  weekly: { trend: string; keyLevel: string; bias: string; };
  monthly: { trend: string; keyLevel: string; bias: string; };
}

export interface AnalysisReport {
  summaryTable: SummaryTableData;
  marketStructure: MarketStructureData;
  criticalLevels: CriticalLevelsData;
  indicatorMatrix: Indicator[];
  chartPatterns: ChartPatternData;
  tradeSetups: TradeSetupData;
  confluenceAnalysis: ConfluenceData;
  riskFactors: RiskFactorData;
  multiTimeframe: MultiTimeframeData;
  narrative: {
    summary: string;
    levels: string;
    patterns: string;
    triggers: string;
    invalidation: string;
  };
}