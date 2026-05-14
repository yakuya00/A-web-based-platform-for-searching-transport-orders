import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputAutoComplete from '@/components/ui/InputAutoComplete';
import { Input } from '@/components/ui/input';
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { useNominatim } from '@/hooks/useNominatim';
import $api from '@/api/axiosInstance';
import { useAuth } from '@/context/AuthContext';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const cargoTypes = [
  { id: 'plachta', name: 'Plachta (Standard)' },
  { id: 'frigo', name: 'Frigo (Chlaďák)' },
  { id: 'dodavka', name: 'Dodávka (do 3.5t)' },
  { id: 'skrin', name: 'Skříň' },
];

const currencies = [
  { id: 'EUR', name: 'EUR (€)' },
  { id: 'CZK', name: 'CZK (Kč)' },
];

const paymentMethods = [
  { id: 'bankovni prevod', name: 'bankovni prevod' },
  { id: 'hotove', name: 'hotove' },
];

/**
 * Komponenta pro vytvoření a publikaci nové poptávky po přepravě (Freight).
 * @todo (Validation) Přesunout validaci do Zod/React-Hook-Form. Nyní chybí kontrola, zda uživatel skutečně vybral adresu z našeptávače (isSelected), nebo jen napsal text.
 * @todo (UX) Přidat automatický výpočet vzdálenosti mezi body pomocí OSRM po vybrání obou adres a zobrazit odhadovanou cenu za kilometr.
 * @todo (UI) Implementovat "Duplikovat poslední" – tlačítko pro předvyplnění dat z minulé zakázky (častý use-case u pravidelných tras).
 */
const AddFreight = () => {
  const navigate = useNavigate();
  const fromLocation = useNominatim();
  const toLocation = useNominatim();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    loading_date: '',
    unloading_date: '',
    recipient_email: '',
    weight: '',
    volume: '',
    length: '',
    height: '',
    cargo_type: 'plachta',
    cargo_description: '',
    cargo_condition: 'běžný',
    vehicle_requirements: '',
    price: '',
    currency: 'EUR',
    payment_term_days: '30',
    payment_method: 'bankovni prevod',
    extra_info: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        loading_address: fromLocation.selectedItem,
        unloading_address: toLocation.selectedItem,
        external_comment: '',
        internal_comment: '',
        contact_user_id: user?.id,
      };
      console.log(payload);
      await $api.post('/order', payload);
      navigate('/');
    } catch (error) {
      console.error('Chyba při odesílání:', error);
      alert('Nepodařilo se vytvořit náklad. Zkuste to prosím znovu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Přidat nový náklad</h1>
        <p className="text-gray-500 mt-2">
          Vyplňte detaily přepravy pro zveřejnění v systému.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
            <span>📍</span> Trasa a termín
          </h2>
          <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputAutoComplete
              label="Odkud (Nakládka)"
              placeholder="Země, Město nebo PSČ..."
              value={fromLocation.query}
              onChange={fromLocation.handleInputChange}
              items={fromLocation.items}
              isLoading={fromLocation.isLoading}
              isSelected={fromLocation.isSelected}
              onItemSelect={fromLocation.selectItem}
            />
            <InputAutoComplete
              label="Kam (Vykládka)"
              placeholder="Město nebo PSČ"
              value={toLocation.query}
              onChange={toLocation.handleInputChange}
              items={toLocation.items}
              isLoading={toLocation.isLoading}
              isSelected={toLocation.isSelected}
              onItemSelect={toLocation.selectItem}
            />

            <Field>
              <FieldLabel>Datum nakládky</FieldLabel>
              <Input
                name="loading_date"
                type="date"
                value={formData.loading_date}
                onChange={handleChange}
                required
              />
            </Field>

            <Field>
              <FieldLabel>Datum vykládky</FieldLabel>
              <Input
                name="unloading_date"
                type="date"
                value={formData.unloading_date}
                onChange={handleChange}
              />
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel>E-mail příjemce</FieldLabel>
              <Input
                name="recipient_email"
                type="email"
                placeholder="např. sklad@firma.cz"
                value={formData.recipient_email}
                onChange={handleChange}
              />
              <FieldDescription>
                Na tento e-mail automaticky zašleme QR kód pro potvrzení
                vykládky.
              </FieldDescription>
            </Field>
          </FieldGroup>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
            <span>📦</span> Informace o nákladu
          </h2>

          <FieldGroup className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Field>
              <FieldLabel>Váha (t)</FieldLabel>
              <Input
                name="weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={handleChange}
                required
              />
            </Field>

            <Field>
              <FieldLabel>Objem (m³)</FieldLabel>
              <Input
                name="volume"
                type="number"
                step="1"
                value={formData.volume}
                onChange={handleChange}
              />
            </Field>

            <Field>
              <FieldLabel>Délka (m)</FieldLabel>
              <Input
                name="length"
                type="number"
                step="0.1"
                value={formData.length}
                onChange={handleChange}
              />
            </Field>

            <Field>
              <FieldLabel>Výška (m)</FieldLabel>
              <Input
                name="height"
                type="number"
                step="0.1"
                value={formData.height}
                onChange={handleChange}
              />
            </Field>
          </FieldGroup>

          <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field>
              <FieldLabel>Typ nákladu</FieldLabel>
              <Select
                value={formData.cargo_type}
                onValueChange={(value) =>
                  handleChange({ target: { name: 'cargo_type', value } })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Vyberte typ" />
                </SelectTrigger>
                <SelectContent>
                  {cargoTypes.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {opt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Stav nákladu</FieldLabel>
              <Input
                name="cargo_condition"
                type="text"
                value={formData.cargo_condition}
                onChange={handleChange}
              />
            </Field>

            <Field>
              <FieldLabel>Popis</FieldLabel>
              <Input
                name="cargo_description"
                type="text"
                placeholder="např. Palety, Ocel"
                value={formData.cargo_description}
                onChange={handleChange}
                required
              />
            </Field>

            <Field>
              <FieldLabel>Požadavky na vozidlo</FieldLabel>
              <Input
                name="vehicle_requirements"
                type="text"
                value={formData.vehicle_requirements}
                onChange={handleChange}
              />
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel>Další informace (volitelné)</FieldLabel>
              <textarea
                name="extra_info"
                value={formData.extra_info}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg text-sm px-3 py-2 focus:ring-4 focus:border-blue-600  focus:ring-blue-600/10 outline-none transition-all"
                placeholder="Zde můžete uvést specifické požadavky na kurtování, chlazení atd..."
              />
            </Field>
          </FieldGroup>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
            <span>💰</span> Cena a platba
          </h2>
          <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field>
              <FieldLabel>Cena za přepravu</FieldLabel>
              <Input
                name="price"
                type="number"
                placeholder="Např. 1500"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </Field>

            <Field>
              <FieldLabel>Měna</FieldLabel>
              <Select
                value={formData.currency}
                onValueChange={(value) =>
                  handleChange({ target: { name: 'currency', value } })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Vyberte měnu" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {opt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Metoda platby</FieldLabel>
              <Select
                value={formData.payment_method}
                onValueChange={(value) =>
                  handleChange({ target: { name: 'payment_method', value } })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Vyberte platbu" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {opt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Splatnost (ve dnech)</FieldLabel>
              <Input
                name="payment_term_days"
                type="number"
                value={formData.payment_term_days}
                onChange={handleChange}
              />
            </Field>
          </FieldGroup>
        </div>

        <Field orientation="horizontal" className="flex justify-end gap-4 mt-4">
          <Button
            type="button"
            variant="tab"
            onClick={() => navigate('/')}
            className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
          >
            Zrušit
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md active:scale-95 disabled:bg-blue-400"
          >
            {isSubmitting ? 'Ukládám...' : 'Zveřejnit náklad'}
          </Button>
        </Field>
      </form>
    </div>
  );
};

export default AddFreight;
