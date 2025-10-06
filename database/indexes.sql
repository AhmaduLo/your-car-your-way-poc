-- ============================================
-- Your Car Your Way - Performance Indexes
-- MySQL 8.0+
-- ============================================

-- ============================================
-- INDEX: user
-- ============================================
CREATE INDEX idx_user_email ON user(email);
CREATE INDEX idx_user_created_at ON user(created_at);

-- ============================================
-- INDEX: payment_method
-- ============================================
CREATE INDEX idx_payment_method_user_id ON payment_method(user_id);
CREATE INDEX idx_payment_method_is_default ON payment_method(user_id, is_default);

-- ============================================
-- INDEX: consent
-- ============================================
CREATE INDEX idx_consent_user_id ON consent(user_id);

-- ============================================
-- INDEX: location
-- ============================================
CREATE INDEX idx_location_country_city ON location(country_code, city);
CREATE INDEX idx_location_code_iata ON location(code_iata);

-- ============================================
-- INDEX: vehicle
-- ============================================
CREATE INDEX idx_vehicle_location_id ON vehicle(location_id);
CREATE INDEX idx_vehicle_location_acriss ON vehicle(location_id, acriss_code);
CREATE INDEX idx_vehicle_available ON vehicle(available);

-- ============================================
-- INDEX: rate_plan
-- ============================================
CREATE INDEX idx_rate_plan_acriss_dates ON rate_plan(acriss_code, valid_from, valid_until);

-- ============================================
-- INDEX: reservation
-- ============================================
CREATE INDEX idx_reservation_user_id ON reservation(user_id);
CREATE INDEX idx_reservation_user_created ON reservation(user_id, created_at);
CREATE INDEX idx_reservation_status_start ON reservation(status, start_at);
CREATE INDEX idx_reservation_pickup_location ON reservation(pickup_location_id);
CREATE INDEX idx_reservation_return_location ON reservation(return_location_id);
CREATE INDEX idx_reservation_dates ON reservation(start_at, end_at);

-- ============================================
-- INDEX: reservation_option
-- ============================================
CREATE INDEX idx_reservation_option_reservation_id ON reservation_option(reservation_id);

-- ============================================
-- INDEX: payment
-- ============================================
CREATE INDEX idx_payment_reservation_id ON payment(reservation_id);
CREATE INDEX idx_payment_status_created ON payment(status, created_at);
CREATE INDEX idx_payment_psp_intent_id ON payment(psp_intent_id);

-- ============================================
-- INDEX: document
-- ============================================
CREATE INDEX idx_document_reservation_id ON document(reservation_id);
CREATE INDEX idx_document_reservation_type ON document(reservation_id, document_type);