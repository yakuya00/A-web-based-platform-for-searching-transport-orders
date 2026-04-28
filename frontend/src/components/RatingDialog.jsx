import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import $api from '@/api/axiosInstance';

const RatingDialog = ({ orderId, toCompanyId, onRatingSuccess }) => {
  const [hoveredStar, setHoveredStar] = useState(0);
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (score === 0) return;
    setIsSubmitting(true);
    setError(null);

    try {
      await $api.post('/rating', {
        order_id: orderId,
        to_company_id: toCompanyId,
        score,
        comment,
      });
      if (onRatingSuccess) onRatingSuccess(); // Закрываем модалку или обновляем UI
    } catch (err) {
      // Показываем ошибку от твоего SQL-триггера
      setError(err.response?.data?.message || 'Něco se pokazilo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100 max-w-md w-full">
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        Ohodnoťte spolupráci
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        Jak jste byli spokojeni s průběhem přepravy?
      </p>

      {/* ЗВЕЗДОЧКИ */}
      <div className="flex gap-2 justify-center mb-6">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-10 h-10 cursor-pointer transition-all ${
              (hoveredStar || score) >= star
                ? 'fill-yellow-400 text-yellow-400 scale-110'
                : 'text-gray-300 hover:text-yellow-200'
            }`}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            onClick={() => setScore(star)}
          />
        ))}
      </div>

      {/* ТЕКСТ ОТЗЫВА */}
      <div className="mb-6">
        <textarea
          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
          rows="3"
          placeholder="Napište krátký komentář (volitelné)..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        ></textarea>
      </div>

      {error && (
        <div className="p-3 mb-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
          {error}
        </div>
      )}

      {/* КНОПКА */}
      <Button
        className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
        onClick={handleSubmit}
        disabled={score === 0 || isSubmitting}
      >
        {isSubmitting ? 'Odesílám...' : 'Odeslat hodnocení'}
      </Button>
    </div>
  );
};

export default RatingDialog;
