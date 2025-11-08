import React from 'react';
import { SearchIcon, UploadIcon, ArrowRightIcon } from './icons/Icons';

export const Intro: React.FC = () => {
    return (
        <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 text-center">
            <h2 className="text-2xl font-bold text-blue-400 mb-2">Welcome to the Analysis Dashboard</h2>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                To begin, provide an asset and let the AI generate a professional-grade technical analysis report.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="bg-gray-700/50 p-4 rounded-lg">
                    <div className="flex items-center text-white font-semibold mb-2">
                        <SearchIcon className="h-5 w-5 mr-2 text-blue-500" />
                        1. Provide an Asset
                    </div>
                    <p className="text-sm text-gray-400">
                        Enter a stock, index, or commodity name/ticker (e.g., "AAPL", "NIFTY 50").
                    </p>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg">
                    <div className="flex items-center text-white font-semibold mb-2">
                        <UploadIcon className="h-5 w-5 mr-2 text-blue-500" />
                        2. (Optional) Upload Chart
                    </div>
                    <p className="text-sm text-gray-400">
                        For more specific analysis, upload a chart image. The AI will analyze the visual data.
                    </p>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg">
                    <div className="flex items-center text-white font-semibold mb-2">
                        <ArrowRightIcon className="h-5 w-5 mr-2 text-blue-500" />
                        3. Get Analysis
                    </div>
                    <p className="text-sm text-gray-400">
                        Click "Analyze Asset" to receive your comprehensive technical breakdown.
                    </p>
                </div>
            </div>
        </div>
    );
};
