INSERT INTO company_roles (name, label, icon, description) VALUES
('carrier', 'Dopravce', '🚚', 'Mám vlastní nákladní vozy'),
('shipper', 'Odesílatel', '🏭', 'Potřebuji přepravit náklad'),
('warehouse', 'Speditér', '📦', 'Organizuji přepravu');


INSERT INTO orders (
    company_id, created_by, contact_user_id, 
    loading_address_id, unloading_address_id, 
    loading_date, unloading_date, 
    length, height, weight, volume, 
    cargo_description, cargo_type, cargo_condition, 
    price, currency, payment_term_days, payment_method, 
    vehicle_requirements, extra_info, external_comment, internal_comment
) VALUES (
    5, 4, 4, 
    1, 2, 
    '2026-03-01', '2026-03-02', 
    13.60, 2.70, 24.00, 90.00, 
    'Paletové zboží - Nábytek', 'plachta', 'běžný', 
    850.00, 'EUR', 30, 'bankovní převod', 
    'plachtový návěs', 'Zadní nakládka', 'Rychlé dodání', 'Ověřit spolehlivost dopravce'
), (
    8, 5, 5, 
    2, 3, 
    '2026-03-05', '2026-03-05', 
    13.60, 2.60, 18.50, 85.00, 
    'Mléčné výrobky a sýry', 'frigo', 'chlazeno', 
    1200.00, 'EUR', 45, 'bankovní převod', 
    'chladírenský (frigo)', 'Teplota: +4°C', 'Nutný certifikát FRC', NULL
), (
    5, 4, 4, 
    3, 1, 
    '2026-03-10', '2026-03-11', 
    4.20, 2.10, 1.20, 15.00, 
    'Elektronika a IT vybavení', 'dodavka', 'křehké', 
    15000.00, 'CZK', 14, 'bankovní převod', 
    'dodávka', 'Křehké, nekurtovat přes hrany!', 'Opatrná manipulace', 'Expresní zásilka VIP klienta'
),
(
    8, 5, 5, 
    1, 3, 
    '2026-03-15', '2026-03-16', 
    13.60, 2.75, 25.00, 80.00, 
    'Stavební materiál (Cihly)', 'plachta', 'těžký', 
    950.00, 'EUR', 60, 'bankovní převod', 
    'plachtový návěs', 'Možnost boční nakládky', 'Potřeba kurtovat', NULL
),
(
    5, 4, 4, 
    2, 1, 
    '2026-03-20', '2026-03-20', 
    3.50, 1.80, 0.80, 10.00, 
    'Zdravotnický materiál', 'dodavka', 'běžný', 
    8000.00, 'CZK', 30, 'hotově', 
    'dodávka', 'Vykládka v nemocnici', 'Kontaktovat doktora před příjezdem', 'Řidič musí mít respirátor'
);

INSERT INTO orders (
    company_id, created_by, contact_user_id, 
    loading_address_id, unloading_address_id, 
    loading_date, unloading_date, 
    length, height, weight, volume, 
    cargo_description, cargo_type, cargo_condition, 
    price, currency, payment_term_days, payment_method, 
    vehicle_requirements, extra_info, external_comment, internal_comment
) VALUES 
(5, 4, 4, 1, 2, '2026-03-21', '2026-03-22', 13.6, 2.7, 24.0, 90.0, 'Nábytek IKEA', 'plachta', 'běžný', 850, 'EUR', 30, 'převod', 'plachta', '', '', ''),
(8, 5, 5, 2, 3, '2026-03-22', '2026-03-24', 13.6, 2.7, 22.5, 85.0, 'Dřevěné desky', 'plachta', 'běžný', 920, 'EUR', 45, 'převod', 'plachta', '', '', ''),
(5, 4, 4, 3, 1, '2026-03-23', '2026-03-23', 6.0, 2.4, 5.0, 30.0, 'Plastové trubky', 'plachta', 'lehký', 400, 'EUR', 14, 'převod', 'plachta', '', '', ''),
(8, 5, 5, 1, 3, '2026-03-25', '2026-03-26', 13.6, 2.7, 25.0, 90.0, 'Cihly', 'plachta', 'těžký', 1100, 'EUR', 60, 'převod', 'plachta', '', '', ''),
(5, 4, 4, 2, 1, '2026-03-26', '2026-03-27', 8.0, 2.5, 12.0, 50.0, 'Izolační vata', 'plachta', 'lehký', 650, 'EUR', 30, 'převod', 'plachta', '', '', ''),
(8, 5, 5, 3, 2, '2026-03-27', '2026-03-28', 13.6, 2.7, 24.0, 90.0, 'Ocelové svitky', 'plachta', 'těžký', 950, 'EUR', 30, 'převod', 'plachta', 'Kurtovat', '', ''),
(5, 4, 4, 1, 2, '2026-03-29', '2026-03-30', 13.6, 2.7, 18.0, 80.0, 'Papírové role', 'plachta', 'běžný', 800, 'EUR', 30, 'převod', 'plachta', '', '', ''),
(8, 5, 5, 2, 3, '2026-03-30', '2026-04-01', 13.6, 2.7, 24.0, 90.0, 'Minerální voda', 'plachta', 'běžný', 880, 'EUR', 45, 'převod', 'plachta', '', '', ''),
(5, 4, 4, 3, 1, '2026-04-01', '2026-04-02', 13.6, 2.7, 24.0, 90.0, 'Pivo v sudech', 'plachta', 'běžný', 900, 'EUR', 30, 'převod', 'plachta', '', '', ''),
(8, 5, 5, 1, 3, '2026-04-02', '2026-04-03', 7.2, 2.4, 8.0, 40.0, 'Autodíly', 'plachta', 'běžný', 550, 'EUR', 30, 'převod', 'plachta', '', '', ''),
(5, 4, 4, 2, 1, '2026-04-04', '2026-04-05', 13.6, 2.7, 24.0, 90.0, 'Pneumatiky', 'plachta', 'lehký', 1050, 'EUR', 60, 'převod', 'plachta', '', '', ''),
(8, 5, 5, 3, 2, '2026-04-05', '2026-04-06', 13.6, 2.7, 20.0, 85.0, 'Bílá technika', 'plachta', 'křehký', 950, 'EUR', 30, 'převod', 'plachta', '', '', ''),
(5, 4, 4, 1, 3, '2026-03-22', '2026-03-23', 13.6, 2.6, 20.0, 85.0, 'Mražené maso', 'frigo', 'mražený', 1300, 'EUR', 30, 'převod', 'frigo', 'Teplota -18C', '', ''),
(8, 5, 5, 2, 1, '2026-03-24', '2026-03-25', 13.6, 2.6, 18.0, 85.0, 'Čerstvé ryby', 'frigo', 'chlazený', 1500, 'EUR', 14, 'převod', 'frigo', 'Teplota +2C', 'Spěchá!', ''),
(5, 4, 4, 3, 2, '2026-03-26', '2026-03-26', 13.6, 2.6, 22.0, 85.0, 'Mléko', 'frigo', 'chlazený', 1100, 'EUR', 30, 'převod', 'frigo', 'Teplota +4C', '', ''),
(8, 5, 5, 1, 2, '2026-03-28', '2026-03-29', 13.6, 2.6, 15.0, 85.0, 'Ovoce a zelenina', 'frigo', 'chlazený', 1250, 'EUR', 30, 'převod', 'frigo', 'Teplota +6C', '', ''),
(5, 4, 4, 2, 3, '2026-03-31', '2026-04-01', 13.6, 2.6, 24.0, 85.0, 'Čokoláda', 'frigo', 'chlazený', 1400, 'EUR', 45, 'převod', 'frigo', 'Teplota +15C', '', ''),
(8, 5, 5, 3, 1, '2026-04-02', '2026-04-03', 13.6, 2.6, 19.0, 85.0, 'Léky', 'frigo', 'chlazený', 1800, 'EUR', 30, 'převod', 'frigo', 'Teplota +8C', 'VIP', ''),
(5, 4, 4, 1, 3, '2026-04-04', '2026-04-05', 13.6, 2.6, 21.0, 85.0, 'Jogurty', 'frigo', 'chlazený', 1150, 'EUR', 30, 'převod', 'frigo', 'Teplota +4C', '', ''),
(8, 5, 5, 2, 1, '2026-04-06', '2026-04-07', 13.6, 2.6, 23.0, 85.0, 'Sýry', 'frigo', 'chlazený', 1200, 'EUR', 30, 'převod', 'frigo', 'Teplota +4C', '', ''),
(5, 4, 4, 3, 2, '2026-04-08', '2026-04-09', 13.6, 2.6, 18.0, 85.0, 'Květiny', 'frigo', 'chlazený', 1350, 'EUR', 14, 'převod', 'frigo', 'Teplota +10C', '', ''),
(8, 5, 5, 1, 2, '2026-03-21', '2026-03-21', 4.0, 2.0, 1.2, 15.0, 'Kancelářská technika', 'dodavka', 'křehký', 350, 'EUR', 14, 'převod', 'dodavka', '', '', ''),
(5, 4, 4, 2, 3, '2026-03-22', '2026-03-22', 4.0, 2.0, 0.8, 12.0, 'Krabice s oblečením', 'dodavka', 'běžný', 280, 'EUR', 30, 'převod', 'dodavka', '', '', ''),
(8, 5, 5, 3, 1, '2026-03-24', '2026-03-24', 4.0, 2.0, 1.5, 15.0, 'Náhradní díly', 'dodavka', 'běžný', 400, 'EUR', 30, 'převod', 'dodavka', 'Expres', '', ''),
(5, 4, 4, 1, 3, '2026-03-25', '2026-03-25', 4.0, 2.0, 0.5, 10.0, 'Tiskoviny', 'dodavka', 'běžný', 250, 'EUR', 30, 'převod', 'dodavka', '', '', ''),
(8, 5, 5, 2, 1, '2026-03-27', '2026-03-27', 4.0, 2.0, 1.0, 14.0, 'Kávovary', 'dodavka', 'křehký', 320, 'EUR', 14, 'převod', 'dodavka', '', '', ''),
(5, 4, 4, 3, 2, '2026-03-29', '2026-03-29', 4.0, 2.0, 1.4, 15.0, 'Barvy a laky', 'dodavka', 'nebezpečný', 450, 'EUR', 30, 'převod', 'dodavka', 'ADR', '', ''),
(8, 5, 5, 1, 2, '2026-03-31', '2026-03-31', 4.0, 2.0, 1.1, 13.0, 'Zkumavky', 'dodavka', 'křehký', 500, 'EUR', 30, 'převod', 'dodavka', '', '', ''),
(5, 4, 4, 2, 3, '2026-04-01', '2026-04-01', 4.0, 2.0, 0.9, 11.0, 'Elektrokola', 'dodavka', 'běžný', 380, 'EUR', 14, 'převod', 'dodavka', '', '', ''),
(8, 5, 5, 3, 1, '2026-04-03', '2026-04-03', 4.0, 2.0, 1.5, 15.0, 'Nářadí', 'dodavka', 'běžný', 310, 'EUR', 30, 'převod', 'dodavka', '', '', ''),
(5, 4, 4, 1, 3, '2026-04-05', '2026-04-05', 4.0, 2.0, 0.6, 10.0, 'Víno', 'dodavka', 'křehký', 420, 'EUR', 30, 'převod', 'dodavka', '', '', ''),
(8, 5, 5, 2, 1, '2026-04-07', '2026-04-07', 4.0, 2.0, 1.3, 14.0, 'Koberce', 'dodavka', 'běžný', 290, 'EUR', 30, 'převod', 'dodavka', '', '', ''),
(5, 4, 4, 3, 2, '2026-04-09', '2026-04-09', 4.0, 2.0, 1.2, 15.0, 'Doplňky stravy', 'dodavka', 'běžný', 330, 'EUR', 14, 'převod', 'dodavka', '', '', ''),
(8, 5, 5, 1, 2, '2026-04-10', '2026-04-10', 4.0, 2.0, 0.4, 8.0, 'Počítače', 'dodavka', 'křehký', 480, 'EUR', 30, 'převod', 'dodavka', '', '', ''),
(5, 4, 4, 2, 3, '2026-04-12', '2026-04-12', 4.0, 2.0, 1.5, 15.0, 'Stavební chemie', 'dodavka', 'běžný', 360, 'EUR', 30, 'převod', 'dodavka', '', '', '');


--====================================================
-- SEED DATA: Vozidla (Company 8 & 5)
--====================================================
INSERT INTO vehicles (
    company_id, vehicle_type, reg_number, brand, model, 
    year_of_manufacture, length, height, capacity, volume, notes
) VALUES
(8, 'truck', '8T1 1234', 'Volvo', 'FH 500', 2021, 6.00, 4.00, 18.00, NULL, 'Spolehlivý tahač, pravidelný servis'),
(8, 'truck', '8T2 5678', 'Scania', 'R 450', 2020, 6.00, 4.00, 18.00, NULL, 'Servisováno 03/2023'),
(8, 'truck', '8T3 9012', 'Mercedes', 'Actros 1845', 2022, 6.00, 4.00, 18.00, NULL, 'Nový vůz'),
(8, 'truck', '8T4 3456', 'DAF', 'XF 480', 2019, 6.00, 4.00, 18.00, NULL, 'Drobné oděrky na levém boku'),
(8, 'trailer', '8P1 1111', 'Krone', 'Profi Liner', 2021, 13.62, 4.00, 24.50, 90.00, 'Nová plachta'),
(8, 'trailer', '8P2 2222', 'Schmitz', 'Cargobull', 2020, 13.62, 4.00, 24.00, 90.00, NULL),
(8, 'trailer', '8P3 3333', 'Krone', 'Mega Liner', 2022, 13.62, 4.00, 24.50, 100.00, 'Mega návěs pro automotive'),
(8, 'trailer', '8P4 4444', 'Schwarzmüller', 'Jumbo', 2019, 13.62, 4.00, 24.00, 115.00, 'Velkoobjemový'),
(8, 'trailer', '8P5 5555', 'Krone', 'Cool Liner', 2023, 13.62, 4.00, 22.00, 85.00, 'Chladírenský návěs (Frigo)'),
(8, 'trailer', '8P6 6666', 'Schmitz', 'Dolly DO 18', 2021, 4.50, 1.20, 18.00, NULL, 'Dolly vozík pro spojení 2 návěsů - Skandinávie!'),
(5, 'truck', '5T1 7777', 'MAN', 'TGX', 2021, 6.00, 4.00, 18.00, NULL, NULL),
(5, 'truck', '5T2 8888', 'Scania', 'S 500 V8', 2023, 6.00, 4.00, 18.00, NULL, 'Vlajková loď firmy'),
(5, 'trailer', '5P1 9999', 'Kögel', 'Cargo', 2020, 13.62, 4.00, 24.00, 90.00, NULL),
(5, 'trailer', '5P2 0000', 'Krone', 'Profi Liner', 2018, 13.62, 4.00, 24.50, 90.00, 'Nutný servis pneu před zimou');

INSERT INTO confirmation_types (name, description) VALUES
('pickup', 'Potvrzení o vyzvednutí zboží'),
('delivered', 'Potvrzení o doručení zboží');

INSERT INTO composition_statuses (name, description) VALUES
('on_trip', 'Vozidlo je aktuálně na cestě s nákladem')
ON CONFLICT (name) DO NOTHING;

INSERT INTO chat_messages (chat_id, sender_id, message) VALUES
(13, 4, 'Hi');