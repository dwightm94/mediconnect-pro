// Find this section in your existing page.tsx (around line 350-380)
// Replace the Epic Card section with this simpler version:

          {/* Epic Card - Single Connect Button */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-2xl flex-shrink-0">🏥</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">Epic MyChart</h3>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs font-medium rounded-full">Production</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Used by Mayo Clinic, Johns Hopkins, Cleveland Clinic, and 800+ health systems nationwide</p>
                <div className="flex flex-wrap gap-1.5 mt-3">{EPIC_DATA_TYPES.map(dt => <DataTag key={dt} dt={dt} />)}</div>
                <button 
                  onClick={() => handleDirectEpicConnect()} 
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg hover:-translate-y-0.5" 
                  style={{ background: 'linear-gradient(135deg, #E8173A, #E8173Add)' }}
                >
                  <ExternalLink className="w-4 h-4" />Connect Epic MyChart
                </button>
              </div>
            </div>
          </div>
