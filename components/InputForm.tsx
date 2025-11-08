import React, { useState, useRef, useEffect } from 'react';
import { UploadIcon } from './icons/Icons';
import { nifty50, indices, commodities } from '../data/assets';

interface InputFormProps {
  onAnalysisRequest: (symbol: string, image: { mimeType: string; data: string } | null, timeframe: string) => void;
  isLoading: boolean;
}

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error("Failed to convert blob to base64"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const InputForm: React.FC<InputFormProps> = ({ onAnalysisRequest, isLoading }) => {
  const [symbol, setSymbol] = useState('');
  const [image, setImage] = useState<{ file: File; preview: string } | null>(null);
  const [timeframe, setTimeframe] = useState('Daily');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Effect to clean up the object URL for the image preview to prevent memory leaks.
  useEffect(() => {
    return () => {
        if (image?.preview) {
            URL.revokeObjectURL(image.preview);
        }
    };
  }, [image]);

  const processFile = (file: File | null | undefined) => {
    if (file && file.type.startsWith('image/')) {
        // Revoke old URL if it exists
        if (image?.preview) {
            URL.revokeObjectURL(image.preview);
        }
        setImage({ file, preview: URL.createObjectURL(file) });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    processFile(event.target.files?.[0]);
  };

  const handleRemoveImage = () => {
      if (image?.preview) {
          URL.revokeObjectURL(image.preview);
      }
      setImage(null);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  };


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!symbol && !image) {
      alert('Please select an asset or upload a chart image.');
      return;
    }
    
    let imagePayload: { mimeType: string; data: string } | null = null;
    if (image) {
      const base64Data = await blobToBase64(image.file);
      imagePayload = { mimeType: image.file.type, data: base64Data };
    }

    onAnalysisRequest(symbol, imagePayload, timeframe);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="symbol" className="block text-sm font-medium text-gray-400 mb-1">
              Select an Asset
            </label>
            <div className="relative">
              <select
                id="symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-md py-2 pl-4 pr-10 focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
                disabled={isLoading}
              >
                <option value="" disabled>-- Select an Asset --</option>
                <optgroup label="Nifty 50">
                  {nifty50.map(stock => (
                    <option key={stock.symbol} value={stock.symbol}>{stock.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Major World Indices">
                  {indices.map(index => (
                    <option key={index.symbol} value={index.symbol}>{index.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Major Commodities">
                  {commodities.map(commodity => (
                    <option key={commodity.symbol} value={commodity.symbol}>{commodity.name}</option>
                  ))}
                </optgroup>
              </select>
               <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
               </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Or upload a chart image to analyze any asset.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Upload a Chart Image (Optional)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
              disabled={isLoading}
            />
            {image ? (
              <div className="relative">
                <img src={image.preview} alt="Chart preview" className="w-full h-32 object-contain rounded-md bg-gray-900 border-2 border-gray-600" />
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="bg-gray-800/80 hover:bg-gray-700 text-white rounded-md px-3 py-1 text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    Change
                  </button>
                  <button 
                    type="button" 
                    onClick={handleRemoveImage}
                    disabled={isLoading}
                    className="bg-red-600/80 hover:bg-red-500 text-white rounded-md px-3 py-1 text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div 
                className={`flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md cursor-pointer transition-colors ${isDragging ? 'border-blue-500 bg-gray-700/50' : 'hover:border-blue-500'}`}
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="space-y-1 text-center">
                  <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
                  <div className="flex text-sm text-gray-400">
                    <p className="relative bg-gray-800 rounded-md font-medium text-blue-400 hover:text-blue-500">
                      <span>Click to upload</span>
                    </p>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Preferred Timeframe
          </label>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {['Intraday', 'Daily', 'Weekly', 'Monthly'].map((tf) => (
              <div key={tf} className="flex items-center">
                <input
                  type="radio"
                  id={`timeframe-${tf.toLowerCase()}`}
                  name="timeframe"
                  value={tf}
                  checked={timeframe === tf}
                  onChange={() => setTimeframe(tf)}
                  disabled={isLoading}
                  className="h-4 w-4 bg-gray-900 border-gray-600 text-blue-500 focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor={`timeframe-${tf.toLowerCase()}`} className="ml-2 block text-sm font-medium text-gray-300">
                  {tf}
                </label>
              </div>
            ))}
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading || (!symbol && !image)}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-md transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </>
          ) : (
            'Analyze Asset'
          )}
        </button>
      </form>
    </div>
  );
};