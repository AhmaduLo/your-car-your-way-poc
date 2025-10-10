-- ============================================
-- Your Car Your Way - Seed Data (Test Data)
-- MySQL 8.0+
-- ============================================

-- ============================================
-- USERS (Test accounts)
-- ============================================
INSERT INTO user (id, email, password_hash, first_name, last_name, birth_date, street, city, postal_code, country, locale, currency, email_verified) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'john.doe@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMye1JzJKvd1TIW6r4TjOiNj2VRqLOvLDoi', 'John', 'Doe', '1985-05-15', '123 Main St', 'New York', '10001', 'United States', 'en-US', 'USD', TRUE),
('550e8400-e29b-41d4-a716-446655440002', 'marie.dupont@example.fr', '$2a$10$N9qo8uLOickgx2ZMRZoMye1JzJKvd1TIW6r4TjOiNj2VRqLOvLDoi', 'Marie', 'Dupont', '1990-08-22', '45 Rue de la Paix', 'Paris', '75001', 'France', 'fr-FR', 'EUR', TRUE),
('550e8400-e29b-41d4-a716-446655440003', 'carlos.garcia@example.es', '$2a$10$N9qo8uLOickgx2ZMRZoMye1JzJKvd1TIW6r4TjOiNj2VRqLOvLDoi', 'Carlos', 'Garcia', '1988-12-10', 'Calle Mayor 12', 'Madrid', '28013', 'Spain', 'es-ES', 'EUR', TRUE);

-- ============================================
-- DRIVER LICENSES
-- ============================================
INSERT INTO driver_license (id, user_id, country_code, number, expiry_date, document_url) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'USA', 'D1234567', '2028-05-15', 'https://storage.ycyw.com/invoices/YCYW-00002-invoice.pdf', 
 'YCYW-00002-invoice.pdf');.ycyw.com/licenses/john-doe-license.pdf'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'FRA', 'FR987654321', '2030-08-22', 'https://storage.ycyw.com/licenses/marie-dupont-license.pdf');

-- ============================================
-- PAYMENT METHODS
-- ============================================
INSERT INTO payment_method (id, user_id, psp_token_id, card_last4, card_brand, expiry_date, is_default) VALUES
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'pm_1234567890abcdef', '4242', 'Visa', '2027-12-31', TRUE),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'pm_abcdef1234567890', '5555', 'Mastercard', '2026-06-30', TRUE);

-- ============================================
-- CONSENTS
-- ============================================
INSERT INTO consent (id, user_id, consent_type, granted, ip_address) VALUES
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'COOKIES', TRUE, '192.168.1.1'),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'MARKETING_EMAILS', TRUE, '192.168.1.1'),
('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'DATA_PROCESSING', TRUE, '192.168.1.1'),
('880e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'COOKIES', TRUE, '192.168.1.2'),
('880e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'MARKETING_EMAILS', FALSE, '192.168.1.2'),
('880e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'DATA_PROCESSING', TRUE, '192.168.1.2');

-- ============================================
-- LOCATIONS (Agencies)
-- ============================================
INSERT INTO location (id, country_code, city, code_iata, name, timezone, address, phone_number) VALUES
('990e8400-e29b-41d4-a716-446655440001', 'USA', 'New York', 'JFK', 'Your Car Your Way - JFK Airport', 'America/New_York', 'JFK International Airport, Queens, NY 11430', '+1-555-0101'),
('990e8400-e29b-41d4-a716-446655440002', 'USA', 'Los Angeles', 'LAX', 'Your Car Your Way - LAX Airport', 'America/Los_Angeles', 'LAX Airport, Los Angeles, CA 90045', '+1-555-0102'),
('990e8400-e29b-41d4-a716-446655440003', 'FRA', 'Paris', 'CDG', 'Your Car Your Way - Charles de Gaulle', 'Europe/Paris', 'Aéroport Paris-Charles de Gaulle, 95700 Roissy-en-France', '+33-1-55-01-01-01'),
('990e8400-e29b-41d4-a716-446655440004', 'ESP', 'Madrid', 'MAD', 'Your Car Your Way - Madrid Barajas', 'Europe/Madrid', 'Aeropuerto Adolfo Suárez Madrid-Barajas, 28042 Madrid', '+34-91-555-0101'),
('990e8400-e29b-41d4-a716-446655440005', 'GBR', 'London', 'LHR', 'Your Car Your Way - Heathrow', 'Europe/London', 'Heathrow Airport, Longford TW6', '+44-20-5555-0101');

-- ============================================
-- VEHICLES
-- ============================================
INSERT INTO vehicle (id, location_id, acriss_code, brand, model, seats, doors, transmission, fuel_type, image_url, available) VALUES
-- New York JFK
('aa0e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', 'ECMR', 'Toyota', 'Corolla', 5, 4, 'MANUAL', 'PETROL', 'https://cdn.ycyw.com/vehicles/toyota-corolla.jpg', TRUE),
('aa0e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440001', 'ICAR', 'Honda', 'Accord', 5, 4, 'AUTOMATIC', 'PETROL', 'https://cdn.ycyw.com/vehicles/honda-accord.jpg', TRUE),
('aa0e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440001', 'SFAR', 'BMW', '3 Series', 5, 4, 'AUTOMATIC', 'DIESEL', 'https://cdn.ycyw.com/vehicles/bmw-3series.jpg', TRUE),
-- Los Angeles LAX
('aa0e8400-e29b-41d4-a716-446655440004', '990e8400-e29b-41d4-a716-446655440002', 'CDAR', 'Ford', 'Mustang', 4, 2, 'AUTOMATIC', 'PETROL', 'https://cdn.ycyw.com/vehicles/ford-mustang.jpg', TRUE),
('aa0e8400-e29b-41d4-a716-446655440005', '990e8400-e29b-41d4-a716-446655440002', 'FVAR', 'Tesla', 'Model 3', 5, 4, 'AUTOMATIC', 'ELECTRIC', 'https://cdn.ycyw.com/vehicles/tesla-model3.jpg', TRUE),
-- Paris CDG
('aa0e8400-e29b-41d4-a716-446655440006', '990e8400-e29b-41d4-a716-446655440003', 'ECMR', 'Renault', 'Clio', 5, 4, 'MANUAL', 'DIESEL', 'https://cdn.ycyw.com/vehicles/renault-clio.jpg', TRUE),
('aa0e8400-e29b-41d4-a716-446655440007', '990e8400-e29b-41d4-a716-446655440003', 'ICAR', 'Peugeot', '308', 5, 4, 'AUTOMATIC', 'HYBRID', 'https://cdn.ycyw.com/vehicles/peugeot-308.jpg', TRUE),
-- Madrid MAD
('aa0e8400-e29b-41d4-a716-446655440008', '990e8400-e29b-41d4-a716-446655440004', 'MCMR', 'SEAT', 'Ibiza', 5, 4, 'MANUAL', 'PETROL', 'https://cdn.ycyw.com/vehicles/seat-ibiza.jpg', TRUE),
-- London LHR
('aa0e8400-e29b-41d4-a716-446655440009', '990e8400-e29b-41d4-a716-446655440005', 'PCAR', 'Jaguar', 'XE', 5, 4, 'AUTOMATIC', 'DIESEL', 'https://cdn.ycyw.com/vehicles/jaguar-xe.jpg', TRUE);

-- ============================================
-- RATE PLANS
-- ============================================
INSERT INTO rate_plan (id, acriss_code, daily_rate, weekly_rate, currency, valid_from, valid_until) VALUES
-- Economy
('bb0e8400-e29b-41d4-a716-446655440001', 'ECMR', 35.00, 210.00, 'USD', '2025-01-01', '2025-12-31'),
('bb0e8400-e29b-41d4-a716-446655440002', 'ECMR', 30.00, 180.00, 'EUR', '2025-01-01', '2025-12-31'),
-- Intermediate
('bb0e8400-e29b-41d4-a716-446655440003', 'ICAR', 55.00, 330.00, 'USD', '2025-01-01', '2025-12-31'),
('bb0e8400-e29b-41d4-a716-446655440004', 'ICAR', 50.00, 300.00, 'EUR', '2025-01-01', '2025-12-31'),
-- Standard
('bb0e8400-e29b-41d4-a716-446655440005', 'SFAR', 75.00, 450.00, 'USD', '2025-01-01', '2025-12-31'),
-- Convertible
('bb0e8400-e29b-41d4-a716-446655440006', 'CDAR', 95.00, 570.00, 'USD', '2025-01-01', '2025-12-31'),
-- Full-size Electric
('bb0e8400-e29b-41d4-a716-446655440007', 'FVAR', 85.00, 510.00, 'USD', '2025-01-01', '2025-12-31'),
-- Mini
('bb0e8400-e29b-41d4-a716-446655440008', 'MCMR', 25.00, 150.00, 'EUR', '2025-01-01', '2025-12-31'),
-- Premium
('bb0e8400-e29b-41d4-a716-446655440009', 'PCAR', 120.00, 720.00, 'GBP', '2025-01-01', '2025-12-31');

-- ============================================
-- RESERVATIONS (Sample bookings)
-- ============================================
INSERT INTO reservation (id, user_id, pickup_location_id, return_location_id, reservation_number, status, start_at, end_at, total_price, currency, offer_snapshot_json, idempotency_key) VALUES
('cc0e8400-e29b-41d4-a716-446655440001', 
 '550e8400-e29b-41d4-a716-446655440001', 
 '990e8400-e29b-41d4-a716-446655440001', 
 '990e8400-e29b-41d4-a716-446655440001', 
 'YCYW-00001', 
 'CONFIRMED', 
 '2025-11-01 10:00:00', 
 '2025-11-05 10:00:00', 
 140.00, 
 'USD', 
 '{"vehicle":{"brand":"Toyota","model":"Corolla","acrissCode":"ECMR"},"dailyRate":35.00,"days":4,"basePrice":140.00,"options":[],"totalPrice":140.00}',
 'idem-key-001'),
('cc0e8400-e29b-41d4-a716-446655440002', 
 '550e8400-e29b-41d4-a716-446655440002', 
 '990e8400-e29b-41d4-a716-446655440003', 
 '990e8400-e29b-41d4-a716-446655440003', 
 'YCYW-00002', 
 'CONFIRMED', 
 '2025-12-15 14:00:00', 
 '2025-12-22 14:00:00', 
 210.00, 
 'EUR', 
 '{"vehicle":{"brand":"Renault","model":"Clio","acrissCode":"ECMR"},"dailyRate":30.00,"days":7,"basePrice":210.00,"options":[],"totalPrice":210.00}',
 'idem-key-002');

-- ============================================
-- RESERVATION OPTIONS
-- ============================================
INSERT INTO reservation_option (id, reservation_id, code, name, price) VALUES
('dd0e8400-e29b-41d4-a716-446655440001', 'cc0e8400-e29b-41d4-a716-446655440002', 'GPS', 'GPS Navigation', 25.00),
('dd0e8400-e29b-41d4-a716-446655440002', 'cc0e8400-e29b-41d4-a716-446655440002', 'CHILD_SEAT', 'Child Safety Seat', 15.00);

-- ============================================
-- PAYMENTS
-- ============================================
INSERT INTO payment (id, reservation_id, psp_intent_id, status, amount, currency, idempotency_key, processed_at) VALUES
('ee0e8400-e29b-41d4-a716-446655440001', 
 'cc0e8400-e29b-41d4-a716-446655440001', 
 'pi_3AbCdEfGhIjKlMnO', 
 'SUCCEEDED', 
 140.00, 
 'USD', 
 'pay-idem-key-001',
 '2025-10-15 08:30:00'),
('ee0e8400-e29b-41d4-a716-446655440002', 
 'cc0e8400-e29b-41d4-a716-446655440002', 
 'pi_3PqRsTuVwXyZaBcD', 
 'SUCCEEDED', 
 250.00, 
 'EUR', 
 'pay-idem-key-002',
 '2025-11-20 15:45:00');

-- ============================================
-- DOCUMENTS
-- ============================================
INSERT INTO document (id, reservation_id, document_type, url, filename) VALUES
('ff0e8400-e29b-41d4-a716-446655440001', 
 'cc0e8400-e29b-41d4-a716-446655440001', 
 'CONTRACT', 
 'https://storage.ycyw.com/contracts/YCYW-00001-contract.pdf', 
 'YCYW-00001-contract.pdf'),
('ff0e8400-e29b-41d4-a716-446655440002', 
 'cc0e8400-e29b-41d4-a716-446655440001', 
 'INVOICE', 
 'https://storage.ycyw.com/invoices/YCYW-00001-invoice.pdf', 
 'YCYW-00001-invoice.pdf'),
('ff0e8400-e29b-41d4-a716-446655440003', 
 'cc0e8400-e29b-41d4-a716-446655440002', 
 'CONTRACT', 
 'https://storage.ycyw.com/contracts/YCYW-00002-contract.pdf', 
 'YCYW-00002-contract.pdf'),
('ff0e8400-e29b-41d4-a716-446655440004', 
 'cc0e8400-e29b-41d4-a716-446655440002', 
 'INVOICE', 
 'https://storage.ycyw.com/invoices/YCYW-00002-invoice.pdf', 