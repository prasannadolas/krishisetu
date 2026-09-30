import React, { useState } from 'react';
import { Copy, Check, Code, LayoutList, Sparkles, CheckCircle2 } from 'lucide-react';

interface FormattedJsonViewerProps {
  data: any; // string or object
  title?: string;
  defaultView?: 'human' | 'code';
}

export const FormattedJsonViewer: React.FC<FormattedJsonViewerProps> = ({
  data,
  title = "Advisory Data Details",
  defaultView = 'human'
}) => {
  const [viewMode, setViewMode] = useState<'human' | 'code'>(defaultView);
  const [copied, setCopied] = useState(false);

  // Parse object if string
  let parsedObj: any = null;
  let rawJsonStr = '';

  try {
    if (typeof data === 'string') {
      rawJsonStr = data;
      parsedObj = JSON.parse(data);
    } else {
      parsedObj = data;
      rawJsonStr = JSON.stringify(data, null, 2);
    }
  } catch {
    parsedObj = null;
    rawJsonStr = typeof data === 'string' ? data : String(data);
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(rawJsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to humanize object keys
  const formatKeyName = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/_/g, ' ');
  };

  return (
    <div className="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
      
      {/* Header Bar */}
      <div className="px-4 py-3 bg-stone-100/90 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
            <Sparkles className="w-4 h-4 text-emerald-700" />
          </div>
          <span className="text-xs font-bold text-stone-800">{title}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex p-0.5 bg-stone-200/70 rounded-lg text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setViewMode('human')}
              className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
                viewMode === 'human'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5 text-emerald-600" />
              <span>Formatted View</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('code')}
              className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
                viewMode === 'code'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Code className="w-3.5 h-3.5 text-emerald-600" />
              <span>JSON Code</span>
            </button>
          </div>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 transition text-[11px] font-medium flex items-center gap-1"
            title="Copy JSON payload"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4">
        {viewMode === 'human' && parsedObj && typeof parsedObj === 'object' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(parsedObj).map(([key, val]) => {
              if (val === null || val === undefined) return null;

              // Render arrays or nested objects nicely
              if (Array.isArray(val)) {
                return (
                  <div key={key} className="col-span-full p-3.5 bg-white rounded-xl border border-stone-200/90 space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                      {formatKeyName(key)} ({val.length})
                    </span>
                    <ul className="space-y-1 pl-2">
                      {val.map((item: any, idx: number) => (
                        <li key={idx} className="text-xs text-stone-700 flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              }

              if (typeof val === 'object') {
                return (
                  <div key={key} className="col-span-full p-3.5 bg-white rounded-xl border border-stone-200/90 space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                      {formatKeyName(key)}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.entries(val).map(([subK, subV]) => (
                        <div key={subK} className="p-2 bg-stone-50 rounded-lg text-xs">
                          <span className="text-[10px] text-stone-400 block font-semibold">{formatKeyName(subK)}</span>
                          <span className="font-bold text-stone-800">{String(subV)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <div key={key} className="p-3 bg-white rounded-xl border border-stone-200/90 space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                    {formatKeyName(key)}
                  </span>
                  <span className="text-xs font-bold text-stone-900 block leading-normal break-words">
                    {String(val)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="relative rounded-xl overflow-hidden bg-stone-950 p-4 border border-stone-800">
            <pre className="text-xs font-mono text-emerald-300 leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-72">
              {rawJsonStr}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
