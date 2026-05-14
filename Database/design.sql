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

INSERT INTO countries (iso_code, name) 
VALUES ('CZ', 'Czech Republic');

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

ALTER TABLE cities ADD CONSTRAINT cities_country_id_name_unique UNIQUE (country_id, name);


--====================================================
-- Table: postcodes
-- English: Stores postcodes associated with cities
-- Czech: Uchovává PSČ (poštovní směrovací čísla) přiřazená k městům
--====================================================
DROP TABLE IF EXISTS postcodes CASCADE;

CREATE TABLE postcodes (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- ID PSČ
    city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE, -- Odkaz na město, ke kterému PSČ patří
    postcode VARCHAR(50) NOT NULL, -- Poštovní směrovací číslo (např. "110 00")
    UNIQUE(city_id, postcode) -- Zajišťuje unikátnost kombinace města a PSČ
);


--===================================================
-- Table: locates
-- English: Stores locations with geographical coordinates
-- Czech: Uchovává lokace s geografickými souřadnicemi
--===================================================
DROP TABLE IF EXISTS locates CASCADE;

CREATE TABLE locates (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- ID lokace
    country_id INTEGER NOT NULL REFERENCES countries(id) ON DELETE CASCADE, -- Odkaz na zemi (např. Česko)
    city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE, -- Odkaz na konkrétní město
    postcode_id INTEGER REFERENCES postcodes(id) ON DELETE CASCADE, -- Odkaz na PSČ (může být NULL pro oblasti bez PSČ)
    osm_id BIGINT NOT NULL, -- ID objektu v OpenStreetMap databázi
    osm_type CHAR(1) NOT NULL, -- Typ OSM objektu: 'N' (Node/Bod), 'W' (Way/Cesta), 'R' (Relation/Relace)
    street VARCHAR(150), -- Ulice (např. "Václavské náměstí")
    house_number VARCHAR(20), -- Číslo popisné nebo orientační (např. "750/1")
    display_name TEXT NOT NULL, -- Celý naformátovaný název adresy pro zobrazení
    geo_point GEOGRAPHY(Point, 4326) NOT NULL, -- Geografický bod (souřadnice ve formátu WGS84)
    UNIQUE (osm_id, osm_type)
);
CREATE INDEX idx_locates_geopoint ON locates USING GIST (geo_point); -- English: Spatial index for fast geolocation queries
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
    label VARCHAR(100) NOT NULL, -- Veřejný název role pro zobrazení v UI (např. "Dopravce", "Odesílatel")
    icon VARCHAR(20), -- Název ikony pro frontend
    description TEXT -- Popis role (např. "Dopravce zajišťující přepravu zboží")
);

INSERT INTO company_roles (name, label, icon, description) VALUES
('carrier', 'Dopravce', '🚚', 'Mám vlastní nákladní vozy'),
('shipper', 'Odesílatel', '🏭', 'Potřebuji přepravit náklad'),
('warehouse', 'Speditér', '📦', 'Organizuji přepravu');

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

INSERT INTO identifier_types (country_id, name, regex_pattern, description, is_required)
VALUES 
(
    (SELECT id FROM countries WHERE iso_code = 'CZ'), 
    'IČO', 
    '^\d{8}$', 
    'Identifikační číslo osoby (8 číslic)', 
    TRUE
),
(
    (SELECT id FROM countries WHERE iso_code = 'CZ'), 
    'DIČ', 
    '^CZ\d{8,10}$', 
    'Daňové identifikační číslo (předpona CZ + 8-10 číslic)', 
    FALSE
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
    identifier_value VARCHAR(50) NOT NULL, -- Hodnota identifikátoru (např. "CZ12345678" pro DPH)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Datum a čas vytvoření identifikátoru
    UNIQUE (company_id, identifier_value), -- Zajišťuje, že hodnota identifikátoru je unikátní pro každou firmu
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

INSERT INTO address_types (name) 
VALUES 
('Registered Office'), -- Sídlo společnosti (Oficiální adresa zapsaná v rejstříku)
('Business Address'),  -- Provoznice (Adresa, kde probíhá každodenní činnost)
('Correspondence'),    -- Korespondenční adresa (Adresa pro doručování pošty)
('Billing'),           -- Fakturační adresa (Adresa uváděná na fakturách)
('Warehouse'),         -- Sklad (Místo pro uskladnění zboží)
('Residential'),       -- Adresa bydliště (Pro fyzické osoby nebo OSVČ)
('Branch');            -- Pobočka

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

INSERT INTO user_roles (name, description) 
VALUES 
(
    'Admin', 
    'System administrator with full access to all settings, user management, and system logs.'
),
(
    'Driver', 
    'Authorized to access delivery schedules, update shipment statuses, and manage route information.'
),
(
    'Manager', 
    'Responsible for overseeing operations, managing drivers, and viewing performance reports.'
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
    password_hash TEXT NOT NULL, -- Hash hesla (např. bcrypt)
    is_verified BOOLEAN DEFAULT FALSE, -- Status ověření uživatele
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE RESTRICT, -- Odkaz na firmu, ke které uživatel patří
    role_id INTEGER NOT NULL REFERENCES user_roles(id) ON DELETE RESTRICT, -- Odkaz na roli uživatele
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Datum a čas registrace uživatele v databázi
    is_active BOOLEAN DEFAULT true -- Indikátor, zda je účet aktivní (místo fyzického mazání dat)
);

--====================================================
-- Table: token_purposes
-- English: Stores purposes for tokens (e.g. email verification, password reset)
-- Czech: Uchovává účely tokenů (např. ověření emailu, reset hesla)
--====================================================
DROP TABLE IF EXISTS token_purposes CASCADE;
CREATE TABLE token_purposes (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- ID účelu
    name VARCHAR(50) NOT NULL UNIQUE, -- Název účelu (např. "email_verification", "password_reset")
    description TEXT -- Podrobný popis, k čemu token slouží
);

INSERT INTO token_purposes (name, description) 
VALUES 
(
    'Email Verification', 
    'Used to verify the user''s email address during registration or after an update.'
),
(
    'Password Reset', 
    'Used for temporary links or codes to allow a user to change a forgotten password.'
);

--====================================================
-- Table: user_tokens
-- English: Stores security tokens for verification and password resets
-- Czech: Uchovává bezpečnostní tokeny pro ověření a reset hesel
--====================================================
DROP TABLE IF EXISTS user_tokens CASCADE;
CREATE TABLE user_tokens (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- ID tokenu
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Odkaz na uživatele
    purpose_id INTEGER NOT NULL REFERENCES token_purposes(id), -- Účel (reset hesla, ověření emailu)
    token_hash TEXT NOT NULL, -- Hash tokenu
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Čas vytvoření
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL CHECK (expires_at > created_at), -- Platnost do
    consumed_at TIMESTAMP WITH TIME ZONE CHECK (consumed_at IS NULL OR consumed_at >= created_at), -- Čas využití tokenu
    metadata JSONB, -- Doplňující data ve formátu JSON
    UNIQUE(user_id, purpose_id, token_hash)
);

-- Index pro rychlé vyhledávání aktivních (nepoužitých) tokenů
CREATE INDEX idx_user_tokens_active
ON user_tokens (token_hash, purpose_id)
WHERE consumed_at IS NULL;


--====================================================
-- Table: refresh_tokens
-- English: Stores refresh tokens for maintaining persistent user sessions
-- Czech: Uchovává refresh tokeny pro udržení trvalého přihlášení uživatele
--====================================================
DROP TABLE IF EXISTS refresh_tokens CASCADE;

CREATE TABLE refresh_tokens (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- ID sezení
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Odkaz na uživatele
    token_hash TEXT NOT NULL, -- Hash dlouhodobého tokenu
    metadata JSONB, -- Informace o zařízení (např. prohlížeč, IP adresa)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Čas přihlášení
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL CHECK (expires_at > created_at), -- Platnost sezení
    UNIQUE(user_id, token_hash)
);

-- Index pro okamžité ověření platnosti tokenu při obnově přístupu
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);

--====================================================
-- Table: vehicles
-- English: Stores vehicles with their specifications
-- Czech: Uchovává vozidla s jejich specifikacemi
--====================================================
DROP TABLE IF EXISTS vehicles CASCADE;

-- Definice výčtového typu pro rozlišení tahačů a návěsů
CREATE TYPE vehicle_type AS ENUM ('truck', 'trailer');
CREATE TABLE vehicles (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- ID vozidla
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE, -- Odkaz na firmu, které vozidlo patří
    vehicle_type vehicle_type NOT NULL , -- Typ vozidla
    reg_number VARCHAR(10) UNIQUE, -- Registrační značka vozidla (např. "1A2B3C4")
    brand VARCHAR(50), -- Značka vozidla (např. "Scania", "Mercedes")
    model VARCHAR(50), -- Model vozidla (např. "R 450", "Actros")
    year_of_manufacture INTEGER CHECK (year_of_manufacture > 1900), -- Rok výroby vozidla (např. 2020)
    length DECIMAL(6,2) CHECK (length > 0), -- Délka vozidla v metrech (např. 12.50)
    height DECIMAL(6,2) CHECK (height > 0), -- Výška vozidla v metrech (např. 4.00)
    capacity DECIMAL(7,2) CHECK (capacity > 0), -- Nosnost vozidla v tunách (např. 20.00)
    volume DECIMAL(7,2) CHECK (volume >= 0), -- Objem vozidla v kubických metrech (např. 60.00)
    notes TEXT, -- Poznámky k vozidlu (např. "Nový motor", "Servisováno 2023")
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Datum a čas přidání vozidla do databáze
    is_active BOOLEAN DEFAULT true -- Indikátor, zda je vozidlo stále v provozu
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

-- Insert statuses
INSERT INTO composition_statuses (name, description) VALUES
('active', 'Active vehicle composition'),
('inactive', 'Inactive vehicle composition'),
('maintenance', 'Vehicle composition under maintenance'),
('on_trip', 'Vozidlo je aktuálně na cestě s nákladem');

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
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE, -- Firma, která soupravu provozuje
    truck_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE, -- Odkaz na nákladní auto, které je součástí složení
    driver_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Odkaz na řidiče, který řídí toto složení (může být NULL, pokud není přiřazen)
    status_id INTEGER NOT NULL REFERENCES composition_statuses(id) ON DELETE RESTRICT, -- Odkaz na stav složení vozidel
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Datum a čas vytvoření složení vozidel
    is_active BOOLEAN DEFAULT true -- Indikátor, zda je tato souprava stále aktuální/používaná
);

--====================================================
-- Trigger: trg_set_inactive_status
-- Purpose (CZ): Automaticky nastaví výchozí stav 'inactive', pokud není při vkládání zadán jiný status.
-- Purpose (EN): Automatically sets the default 'inactive' status if no status_id is provided during insert.
--====================================================
CREATE OR REPLACE FUNCTION set_default_inactive_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Если статус не указан, проставляем ID для inactive
    IF NEW.status_id IS NULL THEN
        SELECT id INTO NEW.status_id FROM composition_statuses WHERE name = 'inactive' LIMIT 1;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_inactive_status
BEFORE INSERT ON vehicle_compositions
FOR EACH ROW
EXECUTE FUNCTION set_default_inactive_status();

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
    trailer_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE, -- Odkaz na přívěs, který je součástí složení
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Datum a čas přidání přívěsu do složení
    CHECK (position_order > 0), -- Zajišťuje, že pořadí přívěsu je kladné
    UNIQUE(vehicle_composition_id, position_order) -- Zajišťuje, že každé složení může mít pouze jeden přívěs na daném pořadí
);


--====================================================
-- Table: orders
-- English: Stores transportation orders with cargo details, pricing, and logistics data
-- Czech: Uchovává přepravní objednávky s detaily nákladu, cenou a logistickými daty
--====================================================
DROP TABLE IF EXISTS orders CASCADE;

CREATE TABLE orders (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- ID objednávky
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE RESTRICT, -- Odkaz na firmu, která objednávku vytvořila
    loading_date DATE, -- Datum nakládky (může být NULL, pokud není specifikováno)
    loading_address_id INTEGER NOT NULL REFERENCES locates(id) ON DELETE RESTRICT, -- Odkaz na lokaci nakládky (adresu)
    unloading_date DATE, -- Datum vykládky (může být NULL, pokud není specifikováno)
    unloading_address_id INTEGER NOT NULL REFERENCES locates(id) ON DELETE RESTRICT, -- Odkaz na lokaci vykládky (adresu)
    recipient_email VARCHAR(254) NOT NULL, -- Email příjemce pro automatické odeslani QR kodu
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Datum a čas vytvoření objednávky
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT, -- Uživatel, který objednávku vytvořil
    vehicle_composition_id INTEGER REFERENCES vehicle_compositions(id) ON DELETE SET NULL, -- Přiřazená souprava (tahač + návěs)
    CHECK (unloading_date IS NULL OR loading_date IS NULL OR unloading_date >= loading_date) -- Zajišťuje, že datum vykládky není před datem nakládky
);

-- Index pro řazení seznamu všech objednávek podle data vytvoření (optimalizace pro ORDER BY created_at DESC)
CREATE INDEX idx_orders_created_at_desc ON orders (created_at DESC);

-- Složený index pro filtrování podle firmy a hmotnosti nákladu (optimalizace vyhledávání)
CREATE INDEX idx_orders_company_weight ON orders (company_id, weight);

-- Indexy pro zrychlení spojování tabulek (JOIN) přes cizí klíče adres
CREATE INDEX idx_orders_loading_address_id ON orders (loading_address_id);
CREATE INDEX idx_orders_unloading_address_id ON orders (unloading_address_id);

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

INSERT INTO order_statuses (name, description) 
VALUES 
(
    'created', 
    'Aktivní - The order has been created and is waiting for action.'
),
(
    'assign', 
    'Přiděleno - The order has been assigned to a specific driver or processor.'
),
(
    'in_progress', 
    'V řešení - The order is currently being processed or is in transit.'
),
(
    'completed', 
    'Dokončeno - The order has been successfully finished.'
),
(
    'cancelled', 
    'Stornováno - The order has been terminated or voided.'
);


--====================================================
-- Table: order_offers
-- English: Stores price offers from carriers for specific orders
-- Czech: Uchovává cenové nabídky dopravců pro konkrétní objednávky
--====================================================
DROP TABLE IF EXISTS order_offers CASCADE;

CREATE TABLE order_offers (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- ID nabídky
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE, -- Odkaz na poptávanou objednávku
    transport_company_id INTEGER NOT NULL REFERENCES companies(id), -- Dopravce, který nabízí přepravu
    proposed_price DECIMAL(10, 2) NOT NULL, -- Navržená cena za přepravu
    status VARCHAR(20) DEFAULT 'pending', -- Stav nabídky: 'pending' (čekající), 'accepted' (přijata), 'rejected' (zamítnuta)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Datum a čas podání nabídky
    UNIQUE(order_id, transport_company_id)
);

-- Optimalizace pro vyhledávání všech nabídek k jedné zakázce (pro zadavatele)
CREATE INDEX idx_order_offers_order_id ON order_offers (order_id);

-- Optimalizace pro vyhledávání vlastních nabídek (pro dopravce)
CREATE INDEX idx_order_offers_transport_company_id ON order_offers (transport_company_id);

-- Optimalizace pro řazení nabídek podle nejvýhodnější ceny (proposed_price ASC)
CREATE INDEX idx_order_offers_price ON order_offers (proposed_price);

--====================================================
-- Table: order_status_history
-- English: Stores history of status changes for orders
-- Czech: Uchovává historii změn stavů objednávek
--====================================================
DROP TABLE IF EXISTS order_status_history CASCADE;

CREATE TABLE order_status_history(
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- ID záznamu historie stavu
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE, -- Odkaz na objednávku, ke které se vztahuje tento záznam
    status_id INTEGER NOT NULL REFERENCES order_statuses(id) ON DELETE RESTRICT, -- Odkaz na nový stav objednávky 
    changed_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT, -- Odkaz na uživatele, který změnil stav objednávky
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Datum a čas změny stavu objednávky
    UNIQUE (order_id, changed_at) -- Zajišťuje, že pro každou objednávku existuje pouze jeden záznam pro daný čas změny
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

INSERT INTO confirmation_types (name, description) VALUES
('pickup', 'Potvrzení o vyzvednutí zboží'),
('delivered', 'Potvrzení o doručení zboží');


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

CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX idx_order_status_history_changed_at ON order_status_history(changed_at DESC);

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

CREATE INDEX idx_ratings_to_company_id ON ratings (to_company_id);


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
ALTER TABLE chats ADD COLUMN carrier_id INT;

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

-- --====================================================
-- -- Table: notification_types
-- -- English: Stores types of notifications (e.g. order status change, new message)
-- -- Czech: Uchovává typy oznámení (např. změna stavu objednávky, nová zpráva)
-- --====================================================
-- DROP TABLE IF EXISTS notification_types CASCADE;

-- CREATE TABLE notification_types (
--     id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- ID typu oznámení
--     name VARCHAR(50) NOT NULL UNIQUE, -- Název typu oznámení (např. "order_status_change", "new_message")
--     description TEXT -- Popis typu oznámení (např. "Oznámení o změně stavu objednávky", "Nová zpráva v chatu")
-- );

-- --====================================================
-- -- Table: notifications
-- -- English: Stores notifications for users
-- -- Czech: Uchovává oznámení pro uživatele
-- --====================================================
-- DROP TABLE IF EXISTS notifications CASCADE;

-- CREATE TABLE notifications (
--     id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- ID oznámení
--     to_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Odkaz na uživatele, kterému je oznámení určeno
--     type_id INTEGER NOT NULL REFERENCES notification_types(id) ON DELETE RESTRICT, -- Odkaz na typ oznámení
--     content TEXT, -- Obsah oznámení (např. "Stav objednávky se změnil na 'completed'")
--     is_read BOOLEAN DEFAULT FALSE, -- Příznak, zda bylo oznámení přečteno (výchozí je FALSE)
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP -- Datum a čas vytvoření oznámení
-- );




--====================================================
-- Trigger Function: check_order_status_transition
-- Purpose (CZ): Kontrola logiky přechodu stavů objednávky. 
-- Zabraňuje změně stavu, pokud je objednávka již v konečné fázi (completed/cancelled).
--====================================================
CREATE OR REPLACE FUNCTION check_order_status_transition()
RETURNS TRIGGER AS $$
DECLARE
    prev_status_name VARCHAR(50);
    new_status_name  VARCHAR(50);
BEGIN
    -- 1. Získání názvu nového stavu
    SELECT name INTO new_status_name 
    FROM order_statuses 
    WHERE id = NEW.status_id;

    -- 2. Vyhledání POSLEDNÍHO stavu této objednávky v historii
    SELECT os.name INTO prev_status_name
    FROM order_status_history osh
    JOIN order_statuses os ON osh.status_id = os.id
    WHERE osh.order_id = NEW.order_id
    ORDER BY osh.changed_at DESC, osh.id DESC
    LIMIT 1;

    -- 3. Kontrola logiky: Pokud je objednávka uzavřena, nelze měnit stav
    IF prev_status_name IS NOT NULL THEN
        IF prev_status_name IN ('completed', 'cancelled') 
           AND new_status_name NOT IN ('completed', 'cancelled') THEN
            RAISE EXCEPTION 'Objednávka je již uzavřena (%). Změna na % není povolena!', 
                prev_status_name, new_status_name;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_order_status_transition
BEFORE INSERT ON order_status_history
FOR EACH ROW
EXECUTE FUNCTION check_order_status_transition();



--====================================================
-- Trigger Function: check_driver_and_truck_company
-- Purpose (CZ): Validace příslušnosti řidiče a vozidla k jedné firmě.
-- Zajišťuje, aby dispečer nemohl přiřadit řidiče z jedné firmy k vozidlu jiné firmy.
--====================================================
CREATE OR REPLACE FUNCTION check_driver_and_truck_company()
RETURNS TRIGGER AS $$
DECLARE
    driver_company_id INTEGER;
    truck_company_id  INTEGER;
BEGIN
    -- Kontrola pouze v případě, že je přiřazen řidič i vozidlo
    IF NEW.driver_id IS NOT NULL AND NEW.truck_id IS NOT NULL THEN
        -- Získání ID firmy řidiče
        SELECT company_id INTO driver_company_id FROM users WHERE id = NEW.driver_id;
        
        -- Získání ID firmy vozidla
        SELECT company_id INTO truck_company_id FROM vehicles WHERE id = NEW.truck_id;

        -- Pokud se firmy neshodují, vyvolá se chyba
        IF driver_company_id IS DISTINCT FROM truck_company_id THEN
            RAISE EXCEPTION 'Řidič (ID: %) a vozidlo (ID: %) patří různým firmám!', 
                NEW.driver_id, NEW.truck_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_driver_and_truck_company
BEFORE INSERT OR UPDATE ON vehicle_compositions
FOR EACH ROW
EXECUTE FUNCTION check_driver_and_truck_company();


-- Zrychluje vyhledávání všech měst v konkrétním státě (např. pro našeptávač v UI)
CREATE INDEX idx_cities_country_id ON cities(country_id);

-- Optimalizuje propojení lokací s městy při vykreslování adres v objednávkách
CREATE INDEX idx_locates_city_id ON locates(city_id);

-- Umožňuje okamžité filtrování firem podle jejich role (např. seznam všech dopravců)
CREATE INDEX idx_companies_role_id ON companies(role_id);

-- Výrazně zrychluje načítání všech adres (sídlo, sklady) pro profil konkrétní firmy
CREATE INDEX idx_company_addresses_company_id ON company_addresses(company_id);


--====================================================
-- TEST DATA
--====================================================

INSERT INTO cities (country_id, "name") OVERRIDING SYSTEM VALUE VALUES(1, 'Praha');

INSERT INTO postcodes (city_id, postcode) OVERRIDING SYSTEM VALUE VALUES
(1, '140 00'),
(1, '102 00'),
(1, '186 00');

INSERT INTO companies ("name", role_id, created_at) OVERRIDING SYSTEM VALUE VALUES
('Trans-Logistic s.r.o', 1, '2026-05-04 10:59:13.996'),
('Czech Industrial Hub a.s.', 2, '2026-05-04 11:00:41.077'),
('European Forwarding Group s.r.o.', 3, '2026-05-04 11:01:38.455');

INSERT INTO locates (country_id, city_id, postcode_id, osm_id, osm_type, street, house_number, display_name, geo_point) OVERRIDING SYSTEM VALUE VALUES
(1, 1, 1, 13347414169, 'N', 'Na Strži', '1702/65', '1702/65, Na Strži, Zelená Liška, Nusle, Praha 4, obvod Praha 4, Praha, 140 00, Česko', 'SRID=4326;POINT (14.4395131 50.050215)'::public.geography),
(1, 1, 2, 1968144260, 'N', 'Průmyslová', '1472/11', '1472/11, Průmyslová, Hostivař, Praha 15, obvod Praha 10, Praha, 102 00, Česko', 'SRID=4326;POINT (14.535954 50.0662172)'::public.geography),
(1, 1, 3, 3050704550, 'N', 'Rohanské nábřeží', '678/23', '678/23, Rohanské nábřeží, Karlín, Praha 8, obvod Praha 8, Praha, 186 00, Česko', 'SRID=4326;POINT (14.4514307 50.0951001)'::public.geography);

INSERT INTO company_addresses (company_id, address_id, address_type_id, created_at) OVERRIDING SYSTEM VALUE VALUES
(1, 1, 1, '2026-05-04 10:59:13.996'),
(2, 2, 1, '2026-05-04 11:00:41.077'),
(3, 3, 1, '2026-05-04 11:01:38.455');

INSERT INTO company_identifiers (company_id, identifier_type_id, identifier_value, created_at) OVERRIDING SYSTEM VALUE VALUES
(1, 1, '25596641', '2026-05-04 10:59:13.996'),
(2, 1, '45792281', '2026-05-04 11:00:41.077'),
(3, 1, '03645224', '2026-05-04 11:01:38.455');

INSERT INTO users (name, surname, birthday, phone, email, password_hash, is_verified, company_id, role_id, created_at) OVERRIDING SYSTEM VALUE VALUES
('Jan', 'Novák', '1996-02-08', '+420603123456', 'dopravce@logix.cz', '$2b$10$G9qf8D5dO08j2YmRzwduI.BZpyl11pG/c93pMcLX06ZuAr.r5MerK', true, 1, 1, '2026-05-04 10:59:13.996'),
('Petr', 'Svoboda', '1988-11-17', '+420775123456', 'odesilatel@logix.cz', '$2b$10$H1qIrISdceDtCt/CXWdBYec9auwd4F.Wj9grnjMv4/uvLMYnc9Hxq', true, 2, 1, '2026-05-04 11:00:41.077'),
('Michal', 'Černý', '1972-07-06', '+420775123457', 'spediter@logix.cz', '$2b$10$B0oTPBkL3xqJWpVb7P.3peAu26LpltQMPoxz7Dw8yS.FQLS0xt98e', true, 3, 1, '2026-05-04 11:01:38.455');

INSERT INTO countries (iso_code, name) VALUES 
('DE', 'Germany'),
('PL', 'Poland'),
('SK', 'Slovakia'),
('AT', 'Austria'), 
('IT', 'Italy'), 
('FR', 'France'), 
('NL', 'Netherlands'), 
('HU', 'Hungary')
ON CONFLICT DO NOTHING;

INSERT INTO cities (country_id, "name") OVERRIDING SYSTEM VALUE VALUES
(2, 'Berlin'),
(3, 'Warszawa'),
(4, 'Bratislava'),
(5, 'Wien'),      
(6, 'Milano'),     
(7, 'Paris'),     
(8, 'Rotterdam'),  
(9, 'Budapest'),   
(2, 'Hamburg');   
INSERT INTO postcodes (city_id, postcode) OVERRIDING SYSTEM VALUE VALUES
(2, '10115'), -- Berlin
(3, '00-001'), -- Warszawa
(4, '811 01'), -- Bratislava
(5, '1010'), 
(6, '20121'), 
(7, '75001'), 
(8, '3011'), 
(9, '1051'), 
(10, '20095');

INSERT INTO locates (country_id, city_id, postcode_id, osm_id, osm_type, street, house_number, display_name, geo_point) 
OVERRIDING SYSTEM VALUE VALUES
(2, 2, 4, 1000000001, 'N', 'Friedrichstraße', '100', 'Friedrichstraße 100, 10117 Berlin, Germany', 
'SRID=4326;POINT (13.3888 52.5170)'::public.geography),
(3, 3, 5, 1000000002, 'N', 'Aleje Jerozolimskie', '100', 'Aleje Jerozolimskie 100, 00-001 Warszawa, Poland', 
'SRID=4326;POINT (21.0000 52.2300)'::public.geography),
(4, 4, 6, 1000000003, 'N', 'Mlynské nivy', '10', 'Mlynské nivy 10, 811 09 Bratislava, Slovakia', 
'SRID=4326;POINT (17.1270 48.1460)'::public.geography),
(5, 5, 7, 1000000004, 'N', 'Stephansplatz', '1', 'Stephansplatz 1, 1010 Wien, Austria', 
'SRID=4326;POINT (16.3731 48.2085)'::public.geography),
(6, 6, 8, 1000000005, 'N', 'Via Dante', '10', 'Via Dante 10, 20121 Milano, Italy', 
'SRID=4326;POINT (9.1859 45.4642)'::public.geography),
(7, 7, 9, 1000000006, 'N', 'Rue de Rivoli', '50', 'Rue de Rivoli 50, 75001 Paris, France', 
'SRID=4326;POINT (2.3412 48.8566)'::public.geography),
(8, 8, 10, 1000000007, 'N', 'Coolsingel', '40', 'Coolsingel 40, 3011 AD Rotterdam, Netherlands', 
'SRID=4326;POINT (4.4791 51.9225)'::public.geography),
(9, 9, 11, 1000000008, 'N', 'Váci u.', '1', 'Váci u. 1, 1051 Budapest, Hungary', 
'SRID=4326;POINT (19.0503 47.4979)'::public.geography),
(2, 10, 12, 1000000009, 'N', 'Reeperbahn', '1', 'Reeperbahn 1, 20359 Hamburg, Germany', 
'SRID=4326;POINT (9.9620 53.5497)'::public.geography);

INSERT INTO orders (
    company_id, 
    loading_date, loading_address_id, 
    unloading_date, unloading_address_id, 
    recipient_email,
    length, height, weight, volume, 
    cargo_description, cargo_type, cargo_condition, 
    price, currency, payment_term_days, payment_method, 
    contact_user_id, created_by
) VALUES 
-- Zakázky od Odesílatele (Company ID 2, User ID 2 - Czech Industrial Hub)
(2, '2026-05-10', 1, '2026-05-11', 4, 'logistics@skoda-auto.cz', 13.6, 2.7, 24.0, 90.0, 'Automobilové díly - motory', 'palety', 'standardní', 1100, 'EUR', 30, 'bankovní převod', 2, 2),
(2, '2026-05-12', 5, '2026-05-13', 1, 'sklad.praha@penny.cz', 6.0, 2.4, 8.5, 30.0, 'Čerstvá jablka (třída A)', 'bedny', 'podléhá zkáze', 850, 'EUR', 14, 'bankovní převod', 2, 2),
(2, '2026-05-15', 10, '2026-05-17', 7, 'prijem@agropodnik.sk', 13.6, 2.6, 22.0, 88.0, 'Průmyslová chemie (ne-ADR)', 'IBC kontejnery', 'kapalina', 2100, 'EUR', 60, 'bankovní převod', 2, 2),
(2, '2026-05-21', 11, '2026-05-22', 1, 'info@potraviny-velkoobchod.cz', 13.6, 2.7, 24.0, 92.0, 'Konzervované potraviny', 'palety', 'těžký náklad', 950, 'EUR', 30, 'bankovní převod', 2, 2),
(2, '2026-05-26', 1, '2026-05-28', 10, 'export@sklo-bohemia.cz', 13.6, 2.7, 15.0, 80.0, 'Skleněné výrobky', 'palety', 'křehké', 1300, 'EUR', 30, 'bankovní převod', 2, 2),

-- Zakázky od Speditéra (Company ID 3, User ID 3 - European Forwarding)
(3, '2026-05-14', 6, '2026-05-16', 12, 'warehouse@alza.cz', 13.6, 3.0, 18.0, 85.0, 'Elektronika - televize a monitory', 'krabice', 'křehké', 1450, 'EUR', 45, 'bankovní převod', 3, 3),
(3, '2026-05-18', 8, '2026-05-20', 9, 'store.manager@hm.com', 8.0, 2.5, 12.0, 45.0, 'Módní oblečení - letní kolekce', 'ramínka', 'standardní', 1800, 'EUR', 30, 'bankovní převod', 3, 3),
(3, '2026-05-23', 4, '2026-05-25', 8, 'service@siemens.de', 13.6, 2.8, 20.0, 86.0, 'Strojní součásti', 'dřevěné bedny', 'těžký náklad', 1650, 'EUR', 30, 'bankovní převod', 3, 3),
(3, '2026-05-29', 7, '2026-05-31', 5, 'objednavky@ikea.com', 10.0, 2.5, 14.0, 50.0, 'Nábytek - kancelářské židle', 'volně ložené', 'standardní', 1100, 'EUR', 15, 'hotovost', 3, 3),
(3, '2026-06-01', 9, '2026-06-03', 6, 'distribution@pilsner.cz', 13.6, 2.7, 24.0, 90.0, 'Víno a lihoviny', 'palety', 'křehké', 2200, 'EUR', 30, 'bankovní převod', 3, 3);

INSERT INTO order_status_history (order_id, status_id, changed_by)
SELECT id, 1, created_by FROM orders 
WHERE id > (SELECT COALESCE(MAX(order_id), 0) FROM order_status_history WHERE status_id = 1);

INSERT INTO users ("name", surname, birthday, phone, email, password_hash, is_verified, company_id, role_id, created_at) VALUES('Jiří', 'Dvořák', '1990-02-07', '+420608111222', 'driver1@logix.cz', '$2b$10$E67g2EmjPG2cl2bIupuxZ.UKWoItJJCptk3DTrLnkD39lA3pLvHyO', false, 1, 2, '2026-05-04 14:32:41.719');
INSERT INTO users ("name", surname, birthday, phone, email, password_hash, is_verified, company_id, role_id, created_at) VALUES('Alena', 'Konečná', '1994-07-13', '+420608333444', 'manager1@logix.cz', '$2b$10$l32JAXHSMSRqVgy8GXtxfO3w0u5uU33qCH93cLoTLsrql/VZmin/W', false, 1, 3, '2026-05-04 14:33:44.513');
INSERT INTO users ("name", surname, birthday, phone, email, password_hash, is_verified, company_id, role_id, created_at) VALUES('Markéta', 'Němcová', '1985-07-11', '+420777555666', 'obchod@hub.cz', '$2b$10$0gyU11RL1T8MzU4ktxSsp.tVpYWyg/ZUDH3Au/iHrAOoxudJExcN2', false, 2, 3, '2026-05-04 14:35:06.417');
INSERT INTO users ("name", surname, birthday, phone, email, password_hash, is_verified, company_id, role_id, created_at) VALUES('Jakub', 'Krejčí', '1992-12-17', '+420777888999', 'dispecer@forwarding.cz', '$2b$10$P5dyJMbxaovRCEM2UqgyV.kToVPkJB30ueJzqko8/n4LAv2XalPge', false, 3, 3, '2026-05-04 14:36:39.796');
INSERT INTO users ("name", surname, birthday, phone, email, password_hash, is_verified, company_id, role_id, created_at) VALUES('Tomáš', 'Marek', '1980-06-17', '+420777000111', 'driver2@forwarding.cz', '$2b$10$ePAZ1XTfnF0ElJIz4OCKSeIzeKW09Qe33/B8OQmt3QarSaz.5nk3W', false, 3, 2, '2026-05-04 14:37:53.257');
INSERT INTO users ("name", surname, birthday, phone, email, password_hash, is_verified, company_id, role_id, created_at) VALUES('Martin', 'Kučera', '1982-02-03', '+420602999888', 'driver2@logix.cz', '$2b$10$Y4qIkz6kQILeFfznTS1dB.p12xFOihGlFKekcd/9pwZ.ITAngUeT6', false, 3, 2, '2026-05-04 14:39:51.976');
INSERT INTO users ("name", surname, birthday, phone, email, password_hash, is_verified, company_id, role_id, created_at) VALUES('Lukáš', 'Pospíšil', '1995-04-12', '+420602777666', 'driver3@logix.cz', '$2b$10$J/n.MMyTwx2nKaXkixv4Hu/4l.JNKtO7IRnmIMy7Qpb51I88z1u2W', false, 3, 2, '2026-05-04 14:40:39.700');
INSERT INTO users ("name", surname, birthday, phone, email, password_hash, is_verified, company_id, role_id, created_at) VALUES('Pavel', 'Beneš', '1978-09-22', '+420602555444', 'driver4@logix.cz', '$2b$10$BPiEmaKhV/qd.IHrcJNzMO9KvxhO1f0GpYyoA3/wJDDswgoHX0dUe', false, 1, 2, '2026-05-04 14:42:04.322');
INSERT INTO users ("name", surname, birthday, phone, email, password_hash, is_verified, company_id, role_id, created_at) VALUES('Filip', 'Fiala', '2000-01-05', '+420602333222', 'driver5@logix.cz', '$2b$10$RLOC1DpkCcspOuxm5uXs5eQJxi4eB7KAQweqhQr3cPr8LMUIR.MWC', false, 1, 2, '2026-05-04 14:42:43.417');

INSERT INTO vehicles (company_id, vehicle_type, reg_number, brand, model, year_of_manufacture, length, height, capacity, volume, notes)
VALUES 
(1, 'truck', '7A1 2345', 'Scania', 'R 450', 2022, 6.00, 3.90, 18.00, 10.00, 'Hlavní tahač, po servisu 2025'),
(1, 'truck', '7A2 5678', 'Volvo', 'FH 16', 2023, 5.90, 3.80, 18.50, 9.50, 'Nové vozidlo v záruce'),
(1, 'truck', '1BE 9012', 'Mercedes', 'Actros', 2021, 6.10, 4.00, 17.50, 11.00, 'Vybaveno GPS sledováním'),
(1, 'truck', '5S3 4455', 'MAN', 'TGX', 2020, 6.00, 3.95, 18.00, 10.00, 'Rezervní tahač'),
(1, 'trailer', 'V01 99AA', 'Schmitz', 'Cargobull', 2022, 13.60, 2.70, 24.00, 90.00, 'Standardní plachta, XL certifikát'),
(1, 'trailer', 'V02 88BB', 'Krone', 'Profi Liner', 2021, 13.60, 2.75, 24.00, 92.00, 'Zesílená podlaha'),
(1, 'trailer', 'V03 77CC', 'Kögel', 'Cargo', 2023, 13.60, 2.80, 25.00, 95.00, 'Návěs pro těžké náklady'),
(1, 'trailer', 'V04 66DD', 'Schwarzmüller', 'Hledat', 2020, 13.60, 2.65, 23.50, 88.00, 'Chladírenský návěs (Frigo)'),

(3, 'truck', '2AF 1122', 'DAF', 'XF 530', 2022, 6.00, 3.90, 18.00, 10.00, 'Vlastní vozidlo spedice'),
(3, 'trailer', 'V05 55EE', 'Wielton', 'Curtain Master', 2021, 13.60, 2.70, 24.00, 90.00, 'Plachtový návěs'),
(1, 'truck', '8A5 1122', 'Iveco', 'S-Way', 2023, 6.00, 3.85, 18.00, 10.00, 'Nové vozidlo, LNG pohon'),
(1, 'truck', '2EL 4455', 'Renault', 'T-Range', 2021, 5.95, 3.90, 18.00, 9.80, 'Pravidelný servis Renault'),
(1, 'truck', '9S1 0011', 'MAN', 'TGL 12.250', 2022, 8.50, 3.40, 5.50, 35.00, 'Sólo vozidlo pro rozvoz po ČR'),
(1, 'truck', '4AA 7788', 'Mercedes', 'Sprinter', 2023, 7.00, 2.80, 1.50, 14.00, 'Expresní dodávka, do 3.5t'),
(1, 'truck', '3B2 9900', 'Scania', 'R 500 V8', 2024, 6.00, 4.00, 19.00, 10.50, 'Vlajková loď flotily, Showtruck'),
(1, 'trailer', 'V06 11XX', 'Schmitz', 'S.KO COOL', 2023, 13.60, 2.70, 22.00, 88.00, 'Mrazírenský návěs s termografem'),
(1, 'trailer', 'V07 22YY', 'Krone', 'Mega Liner', 2022, 13.60, 3.00, 24.00, 100.00, 'Mega návěs, vnitřní výška 3m'),
(1, 'trailer', 'V08 33ZZ', 'Panav', 'NS 1 36', 2021, 13.60, 2.75, 25.00, 92.00, 'Český návěs, po rekonstrukci brzd'),
(1, 'trailer', 'V09 44WW', 'Lamberet', 'SR2 Futura', 2022, 13.60, 2.65, 22.50, 86.00, 'Chladírenský návěs pro farmacii'),
(1, 'trailer', 'V10 55QQ', 'Goldhofer', 'STZ-L', 2020, 15.00, 1.20, 45.00, 0.00, 'Podvalník pro nadrozměrné náklady');
SELECT setval(pg_get_serial_sequence('vehicles', 'id'), COALESCE(MAX(id), 1)) FROM vehicles;

INSERT INTO vehicle_compositions (name, description, company_id, truck_id, driver_id, status_id) 
VALUES 
('Souprava 01 - Scania', 'Hlavní dálková souprava pro EU', 1, 1, 4, 1), -- Truck 1 (Scania), Driver 4 (Jiří Dvořák)
('Souprava 02 - Volvo', 'Souprava pro přepravu chlazeného zboží', 1, 2, 11, 1), -- Truck 2 (Volvo), Driver 11 (Pavel Beneš)
('Souprava 03 - Mercedes', 'Standardní plachtová souprava', 1, 3, 12, 1), -- Truck 3 (Mercedes), Driver 9 (Martin Kučera)
('Souprava 04 - Iveco', 'Souprava s LNG pohonem', 1, 11, null, 1), -- Truck 11 (Iveco), Driver 10 (Lukáš Pospíšil)

('Spediční souprava DAF', 'Vlastní vozidlo spedice', 3, 9, 8, 1); -- Truck 9 (DAF), Driver 8 (Tomáš Marek)

INSERT INTO composition_trailers (position_order, vehicle_composition_id, trailer_id) 
VALUES 
(1, 1, 5),  -- Schmitz Cargobull к Scania
(1, 2, 16), -- Schmitz S.KO COOL (реф) к Volvo
(1, 3, 6),  -- Krone Profi Liner к Mercedes
(1, 4, 17), -- Krone Mega Liner к Iveco
(1, 5, 10); -- Wielton к DAF