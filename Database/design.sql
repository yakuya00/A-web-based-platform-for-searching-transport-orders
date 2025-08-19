CREATE EXTENSION IF NOT EXISTS postgis;


-- ==============================================
-- Table: countries
-- English: Stores the list of countries with ISO codes
-- Czech: Uchovává seznam zemí s ISO kódy
-- ==============================================
DROP TABLE IF EXISTS countries CASCADE;

CREATE TABLE countries (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- ID země
    iso_code CHAR(2) UNIQUE NOT NULL,  -- ISO kód země (např. "CZ", "US")
    name VARCHAR(100) NOT NULL -- Název země (např. "Czech Republic", "United States")
);

--==============================================
-- Table: cities
-- English: Stores cities with references to countries
-- Czech: Uchovává města s odkazy na země
--==============================================

DROP TABLE IF EXISTS cities CASCADE;

CREATE TABLE cities (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- ID města
    country_id INTEGER NOT NULL REFERENCES countries(id) ON DELETE CASCADE, -- Odkaz na zemi
    name VARCHAR(100) NOT NULL -- Název města (např. "Prague", "New York")
);

CREATE UNIQUE INDEX uq_cities_country_name_lower
    ON cities(country_id, LOWER(name)); -- English: Prevents duplicate city names within one country (case-insensitive)
                                       -- Czech: Zabraňuje duplicitním názvům měst v jedné zemi (bez rozlišení velikosti písmen)


--===================================================
-- Table: locates
-- English: Stores locations with geographical coordinates
-- Czech: Uchovává lokace s geografickými souřadnicemi
--===================================================
DROP TABLE IF EXISTS locates CASCADE;

CREATE TABLE locates (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- ID lokace
    city_id INT NOT NULL REFERENCES cities(id) ON DELETE RESTRICT, -- Odkaz na město
    street VARCHAR(150), -- Ulice (např. "Václavské náměstí")
    zip VARCHAR(10), -- PSČ (např. "110 00")
    geo_point GEOGRAPHY(Point, 4326) -- Geografický bod (souřadnice ve formátu WGS84)
);

CREATE INDEX idx_locates_geopoint ON locates USING GIST (geo_point);-- English: Spatial index for fast geolocation queries
                                                                     -- Czech: Prostorový index pro rychlé geolokační dotazy


--===================================================
-- Table: company_roles
-- English: Stores roles of companies (e.g. carrier, shipper)
-- Czech: Uchovává role firem (např. dopravce, odesílatel)
--===================================================
DROP TABLE IF EXISTS company_roles CASCADE;

CREATE TABLE company_roles (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- ID role
    name VARCHAR(50) NOT NULL UNIQUE, -- Název role (např. "carrier", "shipper")
    description TEXT -- Popis role (např. "Dopravce zajišťující přepravu zboží")
);

--===================================================
-- Table: company_identifiers
-- English: Stores identifiers for companies (e.g. VAT, DIC)
-- Czech: Uchovává identifikátory firem (např. DPH, DIČ)
--===================================================
DROP TABLE IF EXISTS identifier_types CASCADE;

CREATE TABLE identifier_types (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- ID typu identifikátoru
    country_id INT NOT NULL REFERENCES countries(id) ON DELETE RESTRICT, -- Odkaz na zemi (např. "CZ" pro Českou republiku)
    name VARCHAR(50) NOT NULL, -- Název typu identifikátoru (např. "VAT", "DIC")
    regex_pattern VARCHAR(100) NOT NULL, -- Regulární výraz pro validaci (např. '^\d{8,10}$' pro DIC)   
    description TEXT, -- Popis typu identifikátoru (např. "Identifikační číslo pro daň z přidané hodnoty")
    is_required BOOLEAN DEFAULT FALSE, -- Povinný identifikátor (např. DPH je povinné v EU)
    UNIQUE(country_id, name) -- Zajišťuje, že každý typ identifikátoru je unikátní v rámci země
);

--===================================================
-- Table: companies
-- English: Stores companies with their roles and identifiers
-- Czech: Uchovává firmy s jejich rolemi a identifikátory
--===================================================
DROP TABLE IF EXISTS companies CASCADE;

CREATE TABLE companies (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- ID firmy
    name VARCHAR(150) NOT NULL, -- Název firmy (např. "ABC Logistics")
    role_id INTEGER NOT NULL REFERENCES company_roles(id) ON DELETE RESTRICT, -- Odkaz na roli firmy
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- Datum a čas registrace firmy v databázi
);


--====================================================
-- Table: company_identifiers
-- English: Stores specific identifiers for companies
-- Czech: Uchovává konkrétní identifikátory firem
--====================================================
DROP TABLE IF EXISTS company_identifiers CASCADE;

CREATE TABLE company_identifiers (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- ID identifikátoru
    company_id INT NOT NULL REFERENCES companies(id) ON DELETE CASCADE, -- Odkaz na firmu
    identifier_type_id INT NOT NULL REFERENCES identifier_types(id) ON DELETE RESTRICT, -- Odkaz na typ identifikátoru
    id_value VARCHAR(50) NOT NULL, -- Hodnota identifikátoru (např. "CZ12345678" pro DPH)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Datum a čas vytvoření identifikátoru
    UNIQUE (company_id, id_value), -- Zajišťuje, že hodnota identifikátoru je unikátní pro každou firmu
    UNIQUE (company_id, identifier_type_id) -- Zajišťuje, že každý typ identifikátoru může být přiřazen pouze jednou firmě
);

--====================================================
-- Table: address_types
-- English: Stores types of addresses for companies
-- Czech: Uchovává typy adres pro firmy
--====================================================
DROP TABLE IF EXISTS address_types CASCADE;

CREATE TABLE address_types (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- ID typu adresy
    name VARCHAR(50) NOT NULL UNIQUE -- Název typu adresy (např. "headquarters", "branch", "warehouse")
);

--====================================================
-- Table: company_addresses
-- English: Stores addresses for companies with types
-- Czech: Uchovává adresy firem s typy
--====================================================
DROP TABLE IF EXISTS company_addresses CASCADE;

CREATE TABLE company_addresses (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- ID adresy
    company_id INT NOT NULL REFERENCES companies(id) ON DELETE CASCADE, -- Odkaz na firmu
    address_id INT NOT NULL REFERENCES locates(id) ON DELETE CASCADE, -- Odkaz na lokaci (adresu)
    address_type_id INT NOT NULL REFERENCES address_types(id) ON DELETE RESTRICT, -- Odkaz na typ adresy
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Datum a čas vytvoření adresy
    UNIQUE (company_id, address_type_id) -- Zajišťuje, že každá firma může mít pouze jednu adresu pro každý typ (např. pouze jedna "headquarters")
);

--====================================================
-- Table: user_roles
-- English: Stores roles for users (e.g. admin, driver)
-- Czech: Uchovává role pro uživatele (např. administrátor, řidič)
--====================================================
DROP TABLE IF EXISTS user_roles CASCADE;

CREATE TABLE user_roles(
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- ID role uživatele
    name VARCHAR(50) NOT NULL UNIQUE, -- Název role (např. "admin", "driver")
    description TEXT --Popis role (např. "Administrátor systému", "Řidič kamionu")
);

--====================================================
-- Table: users
-- English: Stores users with their roles and company affiliations
-- Czech: Uchovává uživatele s jejich rolemi a příslušností k firmám
--====================================================
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- ID uživatele
    name VARCHAR(50) NOT NULL, -- Jméno uživatele (např. "Jan")
    surname VARCHAR(50) NOT NULL, -- Příjmení uživatele (např. "Novák")
    birthday DATE NOT NULL CHECK (birthday < CURRENT_DATE), -- Datum narození uživatele (nesmí být v budoucnosti)
    phone VARCHAR(15) UNIQUE NOT NULL CHECK (phone ~ '^\+?[0-9]{7,15}$'), -- Telefonní číslo (např. "+420123456789")
    email VARCHAR(100) UNIQUE NOT NULL CHECK (email ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'), -- Emailová adresa
    password_hash VARCHAR(255) NOT NULL, -- Hash hesla (např. bcrypt)
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE RESTRICT, -- Odkaz na firmu, ke které uživatel patří
    role_id INTEGER NOT NULL REFERENCES user_roles(id) ON DELETE RESTRICT, -- Odkaz na roli uživatele
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- Datum a čas registrace uživatele v databázi
);

--====================================================
-- Table: vehicles
-- English: Stores vehicles with their specifications
-- Czech: Uchovává vozidla s jejich specifikacemi
--====================================================
DROP TABLE IF EXISTS vehicles CASCADE;
CREATE TABLE vehicles (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- ID vozidla
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE, -- Odkaz na firmu, které vozidlo patří
    reg_number VARCHAR(10) UNIQUE, -- Registrační značka vozidla (např. "1A2B3C4")
    brand VARCHAR(50), -- Značka vozidla (např. "Scania", "Mercedes")
    model VARCHAR(50), -- Model vozidla (např. "R 450", "Actros")
    year_of_manufacture INTEGER CHECK (year_of_manufacture > 1900), -- Rok výroby vozidla (např. 2020)
    length DECIMAL(6,2) CHECK (length > 0), -- Délka vozidla v metrech (např. 12.50)
    height DECIMAL(6,2) CHECK (height > 0), -- Výška vozidla v metrech (např. 4.00)
    capacity DECIMAL(7,2) CHECK (capacity > 0), -- Nosnost vozidla v tunách (např. 20.00)
    volume DECIMAL(7,2) CHECK (volume > 0), -- Objem vozidla v kubických metrech (např. 60.00)
    notes TEXT, -- Poznámky k vozidlu (např. "Nový motor", "Servisováno 2023")
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- Datum a čas přidání vozidla do databáze
);

--====================================================
-- Table: trucks
-- English: Stores trucks with references to vehicles
-- Czech: Uchovává nákladní auta s odkazy na vozidla
--====================================================
DROP TABLE IF EXISTS trucks CASCADE;
CREATE TABLE trucks (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- ID nákladního auta
    vehicle_id INTEGER NOT NULL UNIQUE REFERENCES vehicles(id) ON DELETE CASCADE -- Odkaz na vozidlo, které je nákladním autem
);

--====================================================
-- Table: trailers
-- English: Stores trailers with references to vehicles
-- Czech: Uchovává přívěsy s odkazy na vozidla
--====================================================
DROP TABLE IF EXISTS trailers CASCADE;

CREATE TABLE trailers (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- ID přívěsu
    vehicle_id INTEGER NOT NULL UNIQUE REFERENCES vehicles(id) ON DELETE CASCADE -- Odkaz na vozidlo, které je přívěsem
);

--====================================================
-- Table: composition_statuses
-- English: Stores statuses for vehicle compositions
-- Czech: Uchovává stavy pro složení vozidel
--====================================================
DROP TABLE IF EXISTS composition_statuses CASCADE;

CREATE TABLE composition_statuses (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- ID stavu složení vozidel
    name VARCHAR(50) NOT NULL UNIQUE, -- Název stavu (např. "active", "inactive", "maintenance")
    description TEXT -- Popis stavu (např. "Aktivní složení vozidel", "Údržba vozidel")
);

--====================================================
-- Table: vehicle_compositions
-- English: Stores compositions of vehicles (trucks and trailers)
-- Czech: Uchovává složení vozidel (nákladní auta a přívěsy)
--====================================================
DROP TABLE IF EXISTS vehicle_compositions CASCADE;
CREATE TABLE vehicle_compositions (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- ID složení vozidel
    name VARCHAR(150), -- Název složení (např. "Složení 1", "Složení pro objednávku 123")
    description TEXT, -- Popis složení (např. "Složení pro přepravu zboží z Prahy do Brna")
    truck_id INTEGER NOT NULL REFERENCES trucks(id) ON DELETE CASCADE, -- Odkaz na nákladní auto, které je součástí složení
    driver_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Odkaz na řidiče, který řídí toto složení (může být NULL, pokud není přiřazen)
    status_id INTEGER NOT NULL REFERENCES composition_statuses(id) ON DELETE RESTRICT, -- Odkaz na stav složení vozidel
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- Datum a čas vytvoření složení vozidel
);

--====================================================
-- Table: composition_trailers
-- English: Stores trailers in vehicle compositions
-- Czech: Uchovává přívěsy ve složení vozidel
--====================================================
DROP TABLE IF EXISTS composition_trailers CASCADE;

CREATE TABLE composition_trailers (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- ID záznamu o přívěsu ve složení
    position_order INTEGER NOT NULL CHECK (position_order > 0), -- Pořadí přívěsu ve složení (např. 1 pro první přívěs, 2 pro druhý)
    vehicle_composition_id INTEGER NOT NULL REFERENCES vehicle_compositions(id) ON DELETE CASCADE, -- Odkaz na složení vozidel, ke kterému přívěs patří
    trailer_id INTEGER NOT NULL UNIQUE REFERENCES trailers(id) ON DELETE CASCADE, -- Odkaz na přívěs, který je součástí složení
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Datum a čas přidání přívěsu do složení
    CHECK (position_order > 0), -- Zajišťuje, že pořadí přívěsu je kladné
    UNIQUE(vehicle_composition_id, position_order) -- Zajišťuje, že každé složení může mít pouze jeden přívěs na daném pořadí
);


--====================================================
-- Table: order_info
-- English: Stores detailed information about orders
-- Czech: Uchovává podrobné informace o objednávkách
--====================================================
DROP TABLE IF EXISTS order_info CASCADE;

CREATE TABLE order_info (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- ID objednávky
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE RESTRICT, -- Odkaz na firmu, která objednávku vytvořila
    loading_date DATE, -- Datum nakládky (může být NULL, pokud není specifikováno)
    loading_address_id INTEGER NOT NULL REFERENCES locates(id) ON DELETE RESTRICT, -- Odkaz na lokaci nakládky (adresu)
    unloading_date DATE, -- Datum vykládky (může být NULL, pokud není specifikováno)
    unloading_address_id INTEGER NOT NULL REFERENCES locates(id) ON DELETE RESTRICT, -- Odkaz na lokaci vykládky (adresu)
    length DECIMAL(6,2) CHECK (length > 0), -- Délka nákladu v metrech (např. 5.00)
    height DECIMAL(6,2) CHECK (height > 0), -- Výška nákladu v metrech (např. 2.50)
    weight DECIMAL(7,2) CHECK (weight > 0), -- Hmotnost nákladu v tunách (např. 10.00)
    volume DECIMAL(7,2) CHECK (volume > 0), -- Objem nákladu v kubických metrech (např. 20.00)
    cargo_description TEXT, -- Popis nákladu (např. "Elektronika", "Potraviny")
    cargo_type VARCHAR(50), -- Typ nákladu (např. "paletové zboží", "sypké zboží")
    cargo_condition VARCHAR(50), -- Stav nákladu (např. "křehké", "nebezpečné")
    extra_info TEXT, -- Další informace o nákladu (např. "Požadavek na chlazení", "Speciální manipulace")
    price NUMERIC(12,2), -- Cena objednávky (např. 1500.00)
    currency VARCHAR(10), -- Měna ceny (např. "CZK", "EUR")
    payment_term_days INTEGER, -- Platební podmínky v dnech (např. 30)
    payment_method VARCHAR(50), -- Způsob platby (např. "bankovní převod", "hotově")
    vehicle_requirements VARCHAR(50), -- Požadavky na vozidlo (např. "chlazené", "plachtové")
    external_comment TEXT, -- Externí komentář k objednávce (např. "Zákazník požaduje rychlé doručení")
    internal_comment TEXT, -- Interní komentář k objednávce (např. "Zkontrolovat dostupnost vozidel")
    contact_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT, -- Odkaz na uživatele, který je kontaktní osobou pro objednávku
    CHECK (unloading_date IS NULL OR loading_date IS NULL OR unloading_date >= loading_date) -- Zajišťuje, že datum vykládky není před datem nakládky
);

--====================================================
-- Table: orders
-- English: Stores orders with references to order_info and vehicle compositions
-- Czech: Uchovává objednávky s odkazy na informace o objednávce a složení vozidel
--====================================================  
DROP TABLE IF EXISTS orders CASCADE;

CREATE TABLE orders (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- ID objednávky
    order_info_id INTEGER NOT NULL REFERENCES order_info(id) ON DELETE CASCADE, -- Odkaz na informace o objednávce
    vehicle_composition_id INTEGER REFERENCES vehicle_compositions(id) ON DELETE SET NULL, -- Odkaz na složení vozidel, které je přiřazeno k objednávce (může být NULL, pokud není přiřazeno)
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT, -- Odkaz na uživatele, který objednávku vytvořil
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- Datum a čas vytvoření objednávky
);


--====================================================
-- Table: order_statuses
-- English: Stores statuses for orders (e.g. created, assigned, in_progress, completed)
-- Czech: Uchovává stavy objednávek (např. vytvořena, přiřazena, v průběhu, dokončena)
--====================================================
DROP TABLE IF EXISTS order_statuses CASCADE;

CREATE TABLE order_statuses (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- ID stavu objednávky
    name VARCHAR(50) NOT NULL UNIQUE, -- Název stavu (např. "created", "assigned", "in_progress", "completed", "cancelled")
    description TEXT -- Popis stavu (např. "Objednávka byla vytvořena", "Objednávka je přiřazena řidiči", "Objednávka byla dokončena")
);


--====================================================
-- Table: order_status_history
-- English: Stores history of status changes for orders
-- Czech: Uchovává historii změn stavů objednávek
--====================================================
DROP TABLE IF EXISTS order_status_history CASCADE;

CREATE TABLE order_status_history(
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- ID záznamu historie stavu
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE, -- Odkaz na objednávku, ke které se vztahuje tento záznam
    previous_status_id INTEGER REFERENCES order_statuses(id) ON DELETE RESTRICT, -- Odkaz na předchozí stav objednávky (může být NULL, pokud je to první záznam)
    new_status_id INTEGER NOT NULL REFERENCES order_statuses(id) ON DELETE RESTRICT, -- Odkaz na nový stav objednávky 
    changed_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT, -- Odkaz na uživatele, který změnil stav objednávky
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Datum a čas změny stavu objednávky
    UNIQUE (order_id, changed_at), -- Zajišťuje, že pro každou objednávku existuje pouze jeden záznam pro daný čas změny
    CHECK (previous_status_id IS DISTINCT FROM new_status_id) -- Zajišťuje, že stav se nemůže změnit na stejný stav
);


--====================================================
-- Table: confirmation_types
-- English: Stores types of confirmations for orders (e.g. pickup, delivered) 
-- Czech: Uchovává typy potvrzení pro objednávky (např. vyzvednutí, doručení)
--====================================================
DROP TABLE IF EXISTS confirmation_types CASCADE;

CREATE TABLE confirmation_types (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- ID typu potvrzení
    name VARCHAR(50) NOT NULL UNIQUE, -- Název typu potvrzení (např. "pickup", "delivered")
    description TEXT -- Popis typu potvrzení (např. "Potvrzení o vyzvednutí zboží", "Potvrzení o doručení zboží")
);


--====================================================
-- Table: order_qr_tokens
-- English: Stores QR tokens for order confirmations
-- Czech: Uchovává QR tokeny pro potvrzení objednávek
--====================================================
DROP TABLE IF EXISTS order_qr_tokens CASCADE;

CREATE TABLE order_qr_tokens (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- ID QR tokenu
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE, -- Odkaz na objednávku, ke které se vztahuje tento QR token
    confirmation_type_id INTEGER NOT NULL REFERENCES confirmation_types(id) ON DELETE RESTRICT, -- Odkaz na typ potvrzení, které tento QR token reprezentuje
    qr_token VARCHAR(255) NOT NULL UNIQUE, -- QR token pro potvrzení objednávky
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Datum a čas vytvoření QR tokenu
    UNIQUE(order_id, confirmation_type_id) -- Zajišťuje, že pro každou objednávku a typ potvrzení existuje pouze jeden QR token
);


--====================================================
-- Table: order_confirmations
-- English: Stores confirmations of orders using QR tokens
-- Czech: Uchovává potvrzení objednávek pomocí QR tokenů
--====================================================
DROP TABLE IF EXISTS order_confirmations CASCADE;

CREATE TABLE order_confirmations (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- ID potvrzení objednávky
    order_qr_token_id INTEGER NOT NULL REFERENCES order_qr_tokens(id) ON DELETE CASCADE, -- Odkaz na QR token objednávky, který byl použit pro potvrzení
    confirmed_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT, -- Odkaz na uživatele, který provedl potvrzení
    confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- Datum a čas potvrzení objednávky
);

--====================================================
-- Table: ratings
-- English: Stores ratings given by users to companies based on orders
-- Czech: Uchovává hodnocení, která uživatelé dávají firmám
--====================================================
DROP TABLE IF EXISTS ratings CASCADE;

CREATE TABLE ratings (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- ID hodnocení
    from_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT, -- Odkaz na uživatele, který dává hodnocení
    to_company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE RESTRICT, -- Odkaz na firmu, kterou hodnotí
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE RESTRICT, -- Odkaz na objednávku, ke které se hodnocení vztahuje
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 5), -- Skóre hodnocení (např. 0-5)
    comment TEXT, -- Komentář k hodnocení (např. "Rychlé doručení", "Spokojenost s kvalitou služeb")
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Datum a čas vytvoření hodnocení
    UNIQUE (from_user_id, to_company_id, order_id) -- Zajišťuje, že uživatel může hodnotit firmu pouze jednou na objednávku
);


--====================================================
-- Table: chats
-- English: Stores chat sessions related to orders
-- Czech: Uchovává chatové relace spojené s objednávkami
--====================================================
DROP TABLE IF EXISTS chats CASCADE;

CREATE TABLE chats (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- ID chatové relace
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE, -- Odkaz na objednávku, ke které se chat vztahuje
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- Datum a čas vytvoření chatové relace
);

--====================================================
-- Table: chat_messages
-- English: Stores messages in chat sessions
-- Czech: Uchovává zprávy v chatových relacích
--====================================================
DROP TABLE IF EXISTS chat_messages CASCADE;

CREATE TABLE chat_messages (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- ID zprávy v chatu
    chat_id INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE, -- Odkaz na chatovou relaci, ke které zpráva patří
    sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Odkaz na uživatele, který zprávu poslal (může být NULL, pokud je anonymní)
    message TEXT NOT NULL, -- Obsah zprávy (např. "Dobrý den, jak mohu pomoci?")
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- Datum a čas odeslání zprávy
);

--====================================================
-- Table: notification_types
-- English: Stores types of notifications (e.g. order status change, new message)
-- Czech: Uchovává typy oznámení (např. změna stavu objednávky, nová zpráva)
--====================================================
DROP TABLE IF EXISTS notification_types CASCADE;

CREATE TABLE notification_types (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- ID typu oznámení
    name VARCHAR(50) NOT NULL UNIQUE, -- Název typu oznámení (např. "order_status_change", "new_message")
    description TEXT -- Popis typu oznámení (např. "Oznámení o změně stavu objednávky", "Nová zpráva v chatu")
);

--====================================================
-- Table: notifications
-- English: Stores notifications for users
-- Czech: Uchovává oznámení pro uživatele
--====================================================
DROP TABLE IF EXISTS notifications CASCADE;

CREATE TABLE notifications (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- ID oznámení
    to_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Odkaz na uživatele, kterému je oznámení určeno
    type_id INTEGER NOT NULL REFERENCES notification_types(id) ON DELETE RESTRICT, -- Odkaz na typ oznámení
    content TEXT, -- Obsah oznámení (např. "Stav objednávky se změnil na 'completed'")
    is_read BOOLEAN DEFAULT FALSE, -- Příznak, zda bylo oznámení přečteno (výchozí je FALSE)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- Datum a čas vytvoření oznámení
);




-- Проверка допустимости перехода статусов заказа
CREATE OR REPLACE FUNCTION check_order_status_transition()
RETURNS TRIGGER AS $$
DECLARE
    prev_status VARCHAR(50);
    new_status VARCHAR(50);
BEGIN
    SELECT name INTO prev_status FROM order_statuses WHERE id = NEW.previous_status_id;
    SELECT name INTO new_status FROM order_statuses WHERE id = NEW.new_status_id;

    -- Пример: запрещаем переход из 'completed' или 'cancelled' в любой другой статус
    IF prev_status IN ('completed', 'cancelled') AND new_status NOT IN ('completed', 'cancelled') THEN
        RAISE EXCEPTION 'Нельзя менять статус после завершения или отмены заказа';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_order_status_transition
BEFORE INSERT ON order_status_history
FOR EACH ROW
EXECUTE FUNCTION check_order_status_transition();



-- Проверка, что водитель и транспорт одной компании
CREATE OR REPLACE FUNCTION check_driver_and_truck_company()
RETURNS TRIGGER AS $$
DECLARE
    driver_company_id INTEGER;
    truck_company_id INTEGER;
BEGIN
    IF NEW.driver_id IS NOT NULL THEN
        SELECT company_id INTO driver_company_id FROM users WHERE id = NEW.driver_id;
        SELECT v.company_id INTO truck_company_id
        FROM trucks t JOIN vehicles v ON t.vehicle_id = v.id
        WHERE t.id = NEW.truck_id;

        IF driver_company_id IS DISTINCT FROM truck_company_id THEN
            RAISE EXCEPTION 'Водитель и транспорт должны принадлежать одной компании';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_driver_and_truck_company
BEFORE INSERT OR UPDATE ON vehicle_compositions
FOR EACH ROW
EXECUTE FUNCTION check_driver_and_truck_company();



-- -- Проверка, что рейтинг можно ставить только по завершённым заказам
-- ALTER FUNCTION check_rating_constraints() 
-- RENAME TO check_rating_constraints_old;

CREATE OR REPLACE FUNCTION check_rating_constraints()
RETURNS TRIGGER AS $$
DECLARE
    user_company_id INTEGER;
    order_status VARCHAR(50);
BEGIN
    SELECT company_id INTO user_company_id
    FROM users
    WHERE id = NEW.from_user_id;

    IF user_company_id = NEW.to_company_id THEN
        RAISE EXCEPTION 'Нельзя поставить рейтинг своей компании';
    END IF;

    IF NOT EXISTS (
         SELECT 1
         FROM orders o
         JOIN order_info oi ON o.order_info_id = oi.id
         WHERE o.id = NEW.order_id
           AND oi.company_id = user_company_id
     ) THEN
         RAISE EXCEPTION 'Пользователь не связан с данным заказом';
     END IF;

    -- Проверяем, что заказ завершён
    SELECT os.name INTO order_status
    FROM order_status_history osh
    JOIN order_statuses os ON osh.new_status_id = os.id
    WHERE osh.order_id = NEW.order_id
    ORDER BY osh.changed_at DESC
    LIMIT 1;

    IF order_status IS DISTINCT FROM 'completed' THEN
        RAISE EXCEPTION 'Рейтинг можно ставить только по завершённым заказам';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Запрет на одновременное использование vehicle_id в trucks и trailers
CREATE OR REPLACE FUNCTION check_vehicle_not_in_both_truck_and_trailer()
RETURNS TRIGGER AS $$
BEGIN
    -- Проверка для trucks
    IF TG_TABLE_NAME = 'trucks' THEN
        IF EXISTS (SELECT 1 FROM trailers WHERE vehicle_id = NEW.vehicle_id) THEN
            RAISE EXCEPTION 'Одна и та же машина не может быть и в trucks, и в trailers';
        END IF;
    END IF;
    -- Проверка для trailers
    IF TG_TABLE_NAME = 'trailers' THEN
        IF EXISTS (SELECT 1 FROM trucks WHERE vehicle_id = NEW.vehicle_id) THEN
            RAISE EXCEPTION 'Одна и та же машина не может быть и в trucks, и в trailers';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_vehicle_in_trucks
BEFORE INSERT OR UPDATE ON trucks
FOR EACH ROW
EXECUTE FUNCTION check_vehicle_not_in_both_truck_and_trailer();

CREATE TRIGGER trg_check_vehicle_in_trailers
BEFORE INSERT OR UPDATE ON trailers
FOR EACH ROW
EXECUTE FUNCTION check_vehicle_not_in_both_truck_and_trailer();


-- Проверка веса/объёма заказа против возможностей транспорта
CREATE OR REPLACE FUNCTION check_order_vehicle_capacity()
RETURNS TRIGGER AS $$
DECLARE
    max_weight DECIMAL;
    max_volume DECIMAL;
BEGIN
    IF NEW.vehicle_composition_id IS NOT NULL THEN
        SELECT SUM(v.capacity), SUM(v.volume)
        INTO max_weight, max_volume
        FROM composition_trailers ct
        JOIN trailers t ON t.id = ct.trailer_id
        JOIN vehicles v ON v.id = t.vehicle_id
        WHERE ct.vehicle_composition_id = NEW.vehicle_composition_id;

        -- Плюс грузовик
        SELECT v.capacity, v.volume
        INTO max_weight, max_volume
        FROM vehicle_compositions vc
        JOIN trucks tr ON tr.id = vc.truck_id
        JOIN vehicles v ON v.id = tr.vehicle_id
        WHERE vc.id = NEW.vehicle_composition_id;

        IF EXISTS (
            SELECT 1
            FROM order_info oi
            WHERE oi.id = NEW.order_info_id
              AND (oi.weight > max_weight OR oi.volume > max_volume)
        ) THEN
            RAISE EXCEPTION 'Груз превышает возможности транспорта';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_order_vehicle_capacity
BEFORE INSERT OR UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION check_order_vehicle_capacity();


-- Проверка, что водитель не назначен на другой активный рейс
CREATE OR REPLACE FUNCTION check_driver_not_in_two_active_compositions()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.driver_id IS NOT NULL THEN
        IF EXISTS (
            SELECT 1
            FROM vehicle_compositions vc
            JOIN orders o ON o.vehicle_composition_id = vc.id
            JOIN order_status_history osh ON osh.order_id = o.id
            JOIN order_statuses os ON os.id = osh.new_status_id
            WHERE vc.driver_id = NEW.driver_id
              AND os.name IN ('created', 'assigned', 'in_progress')
              AND vc.id <> NEW.id
        ) THEN
            RAISE EXCEPTION 'Водитель уже назначен на другой активный рейс';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_driver_not_in_two_active_compositions
BEFORE INSERT OR UPDATE ON vehicle_compositions
FOR EACH ROW
EXECUTE FUNCTION check_driver_not_in_two_active_compositions();

-- -- Функция проверки
-- CREATE OR REPLACE FUNCTION check_rating_constraints()
-- RETURNS TRIGGER AS $$
-- DECLARE
--     user_company_id INTEGER;
-- BEGIN
--     SELECT company_id INTO user_company_id
--     FROM users
--     WHERE id = NEW.from_user_id;

--     -- 1. Проверка, что юзер не ставит рейтинг своей компании
--     IF user_company_id = NEW.to_company_id THEN
--         RAISE EXCEPTION 'Нельзя поставить рейтинг своей компании';
--     END IF;

--     -- 2. Проверка, что компания-заказчик реально участвовала в заказе
--     -- (опционально, если хочешь, чтобы рейтинг ставили только по своим заказам)
--     -- Например:
--      IF NOT EXISTS (
--          SELECT 1
--          FROM orders o
--          JOIN order_info oi ON o.order_info_id = oi.id
--          WHERE o.id = NEW.order_id
--            AND oi.company_id = user_company_id
--      ) THEN
--          RAISE EXCEPTION 'Пользователь не связан с данным заказом';
--      END IF;

--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- -- Триггер
-- CREATE TRIGGER trg_check_rating
-- BEFORE INSERT OR UPDATE ON ratings
-- FOR EACH ROW
-- EXECUTE FUNCTION check_rating_constraints();



CREATE INDEX idx_cities_country_id ON cities(country_id);
CREATE INDEX idx_locates_city_id ON locates(city_id);
CREATE INDEX idx_identifier_types_country_id ON identifier_types(country_id);
CREATE INDEX idx_companies_role_id ON companies(role_id);
CREATE INDEX idx_company_addresses_company_id ON company_addresses(company_id);