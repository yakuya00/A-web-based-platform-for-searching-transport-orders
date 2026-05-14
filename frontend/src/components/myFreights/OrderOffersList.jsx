import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, Clock, CheckCircle2, XCircle, Star } from 'lucide-react';
import { useOrderOffersList } from '@/hooks/useOrderOffersList';

/**
 * Seznam nabídek od dopravců pro konkrétní zakázku.
 * @param {Object} props
 * @param {number} props.orderId - ID zakázky, pro kterou se nabídky zobrazují.
 * @param {Function} props.onAccept - Callback po úspěšné akci (např. zavření dialogu nebo refresh dat).
 */
const OrderOffersList = ({ orderId, onAccept }) => {
  /** * Hook pro správu dat a operací s nabídkami.
   * @see hooks/useOrderOffersList
   */
  const { data, actions } = useOrderOffersList(orderId, onAccept);

  if (data.isLoading) {
    return (
      <div className="flex justify-center items-center py-12 text-gray-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        Načítám nabídky...
      </div>
    );
  }

  if (data.offers.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 border border-dashed rounded-xl mt-4">
        <p className="text-gray-500 font-medium">
          Zatím žádný dopravce nepodal nabídku.
        </p>
        <p className="text-sm text-gray-400 mt-1">
          Buďte trpěliví, brzy se někdo ozve.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 mt-4">
      <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
        <Wallet className="w-4 h-4 text-blue-600" />
        Nabídky ({data.offers.length})
      </h3>

      <div className="grid gap-2">
        {' '}
        {data.offers.map((offer, index) => {
          return (
            <Card
              key={offer.offer_id}
              className={`overflow-hidden transition-all ${
                offer.offer_status === 'rejected'
                  ? 'opacity-60 bg-gray-50'
                  : 'hover:shadow-sm'
              }`}
            >
              <CardContent className="p-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 w-full">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                        offer.offer_status === 'rejected'
                          ? 'bg-gray-200 text-gray-500'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {offer.company_name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-gray-900 flex items-center gap-2 leading-none">
                        {offer.company_name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium flex items-center gap-0.5 text-amber-500">
                          <Star className="w-3 h-3 fill-amber-500" />
                          {offer.rating}{' '}
                          <span className="text-gray-400">
                            ({offer.reviews_count})
                          </span>
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="text-[11px] text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(offer.offer_date).toLocaleTimeString(
                            'cs-CZ',
                            { hour: '2-digit', minute: '2-digit' }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 mt-2 sm:mt-0">
                    <div className="text-lg font-black text-gray-900 leading-none">
                      {offer.proposed_price.toLocaleString('cs-CZ')}{' '}
                      <span className="text-xs text-gray-500 font-bold">
                        {offer.currency}
                      </span>
                    </div>

                    {offer.offer_status === 'pending' ? (
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          className="h-8 bg-green-600 hover:bg-green-700 font-bold px-3 text-xs"
                          disabled={data.isProcessing}
                          onClick={() => {
                            actions.handleAcceptOffer(
                              offer.offer_id,
                              offer.company_name
                            );
                            onAccept();
                          }}
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Přijmout
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-gray-200"
                          disabled={data.isProcessing}
                          onClick={() => {
                            actions.handleRejectOffer(offer.offer_id);
                            onAccept();
                          }}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <Badge
                        variant={
                          offer.offer_status === 'accepted'
                            ? 'default'
                            : 'secondary'
                        }
                        className={`text-[10px] h-5 ${
                          offer.offer_status === 'accepted'
                            ? 'bg-green-500'
                            : ''
                        }`}
                      >
                        {offer.offer_status === 'accepted'
                          ? 'Přijato'
                          : 'Zamítnuto'}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default OrderOffersList;
