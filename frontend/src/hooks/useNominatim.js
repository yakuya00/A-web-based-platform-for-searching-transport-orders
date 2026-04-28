import { useState, useEffect } from 'react';

export const useNominatim = () => {
  const [query, setQuery] = useState('');
  const [fullQuery, setFullQuery] = useState('');
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (query.trim().length < 3 || isSelected) {
      setItems([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&accept-language=cs`
        );
        const data = await res.json();
        const cleanResults = data.filter((item) => {
          // Список разрешенных категорий (class). Всё остальное пойдет лесом.
          const allowedClasses = [
            'place', // Города, деревни, районы
            'boundary', // Административные границы (страны, области)
            'highway', // Улицы, дороги
            'building', // Конкретные здания (адреса)
            'amenity', // Инфраструктура (заправки, парковки, склады)
            'office', // Офисные здания
          ];

          // Список запрещенных типов (даже если class совпал, рубим это)
          const bannedTypes = [
            'sea',
            'ocean',
            'river',
            'canal',
            'forest',
            'mountain',
          ];

          return (
            allowedClasses.includes(item.class) &&
            !bannedTypes.includes(item.type)
          );
        });
        setItems(cleanResults.slice(0, 5));
      } catch (error) {
        console.error('Ошибка Nominatim:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, isSelected]);

  const selectItem = (item) => {
    // Оставляем только Город и Страну (чтобы не пихать весь длинный адрес)
    const city =
      item.address.city ||
      item.address.town ||
      item.address.village ||
      item.display_name;
    const country = item.address.country_code
      ? item.address.country_code.toUpperCase()
      : '';
    const postcode = item.address.postcode || '';
    setQuery(`${city}, ${country}, ${postcode}`);
    setFullQuery(item.display_name);
    setSelectedItem(item);
    setItems([]);
    setIsSelected(true);
  };

  // Если юзер начал стирать выбранный город, сбрасываем статус "Выбрано"
  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setFullQuery(e.target.value);
    if (isSelected) setIsSelected(false);
  };

  return {
    query,
    fullQuery,
    items,
    isLoading,
    isSelected,
    selectedItem,
    handleInputChange,
    selectItem,
  };
};
