import React, { Dispatch, SetStateAction } from 'react';

const FreightsTable = ({ freights, handleFreight, lastFreightElementRef }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col">
      <div className="overflow-x-auto overflow-y-scroll flex-1">
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3 font-semibold">Datum</th>
              <th className="px-4 py-3 font-semibold">Trasa (Odkud ➔ Kam)</th>
              <th className="px-4 py-3 font-semibold">
                Náklad (Váha, Objem, Typ)
              </th>
              <th className="px-4 py-3 font-semibold">Cena</th>
              <th className="px-4 py-3 font-semibold">Zadavatel</th>
              <th className="px-4 py-3 font-semibold text-right">Akce</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-800">
            {freights.map((freight, index) => {
              const isLastElement = freights.length === index + 1;
              return (
                <tr
                  key={freight.id}
                  ref={isLastElement ? lastFreightElementRef : null}
                  className="hover:bg-blue-50/50 transition-colors group cursor-pointer"
                  onClick={() => {
                    console.log('🔥 КЛИКНУЛИ НА ГРУЗ:', freight);
                    handleFreight(freight);
                  }}
                >
                  <td className="px-4 py-2.5 whitespace-nowrap font-medium text-gray-900">
                    {new Date(freight.date).toLocaleDateString(undefined, {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <div className="font-semibold text-blue-800">
                      {freight.from}
                    </div>
                    <div className="text-gray-500 text-xs mt-0.5">
                      ➔ {freight.to} ({freight.distance})
                    </div>
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <div className="font-medium">
                      {freight.weight} / {freight.volume}
                    </div>
                    <div className="text-gray-500 text-xs mt-0.5">
                      {freight.cargo_type}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span
                      className={`font-bold ${freight.price === 'Dohodou' ? 'text-gray-500' : 'text-green-600'}`}
                    >
                      {freight.price} {freight.currency}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <div className="font-medium truncate max-w-[150px]">
                      {freight.company_name}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-right">
                    <button className="opacity-0 group-hover:opacity-100 bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium px-3 py-1.5 rounded-md text-xs transition-all mr-2">
                      💬 Napsat
                    </button>
                    <button className="text-gray-400 hover:text-blue-600 font-medium px-2 py-1.5 rounded-md text-xs transition-all">
                      Detail
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FreightsTable;
