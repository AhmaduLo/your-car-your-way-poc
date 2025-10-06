-- ============================================
-- Your Car Your Way - Database Schema
-- MySQL 8.0+
-- ============================================

-- Suppression des tables si elles existent (ordre inverse des dépendances)
DROP TABLE IF EXISTS document;
DROP TABLE IF EXISTS payment;
DROP TABLE IF EXISTS reservation_option;
DROP TABLE IF EXISTS reservation;
DROP TABLE IF EXISTS rate_plan;
DROP TABLE IF EXISTS vehicle;
DROP TABLE IF EXISTS location;
DROP TABLE IF EXISTS consent;
DROP TABLE IF EXISTS payment_method;
DROP TABLE IF EXISTS driver_license;
DROP TABLE IF EXISTS user;

-- ============================================
-- TABLE: user
-- ============================================
CREATE TABLE user (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    birth_date DATE,
    street VARCHAR(255),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    locale VARCHAR(10) DEFAULT 'en-US',
    currency VARCHAR(3) DEFAULT 'USD',
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: driver_license
-- ============================================
CREATE TABLE driver_license (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    country_code VARCHAR(3) NOT NULL,
    number VARCHAR(50) NOT NULL,
    expiry_date DATE NOT NULL,
    document_url VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_driver_license_user FOREIGN KEY (user_id) 
        REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: payment_method
-- ============================================
CREATE TABLE payment_method (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    psp_token_id VARCHAR(255) NOT NULL UNIQUE,
    card_last4 VARCHAR(4) NOT NULL,
    card_brand VARCHAR(20) NOT NULL,
    expiry_date DATE NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_method_user FOREIGN KEY (user_id) 
        REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: consent
-- ============================================
CREATE TABLE consent (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    consent_type ENUM('COOKIES', 'MARKETING_EMAILS', 'DATA_PROCESSING') NOT NULL,
    granted BOOLEAN NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    CONSTRAINT fk_consent_user FOREIGN KEY (user_id) 
        REFERENCES user(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_consent_type (user_id, consent_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: location
-- ============================================
CREATE TABLE location (
    id VARCHAR(36) PRIMARY KEY,
    country_code VARCHAR(3) NOT NULL,
    city VARCHAR(100) NOT NULL,
    code_iata VARCHAR(3),
    name VARCHAR(255) NOT NULL,
    timezone VARCHAR(50) NOT NULL,
    address TEXT,
    phone_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: vehicle
-- ============================================
CREATE TABLE vehicle (
    id VARCHAR(36) PRIMARY KEY,
    location_id VARCHAR(36) NOT NULL,
    acriss_code VARCHAR(4) NOT NULL,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    seats INT NOT NULL,
    doors INT NOT NULL,
    transmission ENUM('MANUAL', 'AUTOMATIC') NOT NULL,
    fuel_type ENUM('PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID') NOT NULL,
    image_url VARCHAR(500),
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vehicle_location FOREIGN KEY (location_id) 
        REFERENCES location(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: rate_plan
-- ============================================
CREATE TABLE rate_plan (
    id VARCHAR(36) PRIMARY KEY,
    acriss_code VARCHAR(4) NOT NULL,
    daily_rate DECIMAL(10,2) NOT NULL,
    weekly_rate DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: reservation
-- ============================================
CREATE TABLE reservation (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    pickup_location_id VARCHAR(36) NOT NULL,
    return_location_id VARCHAR(36) NOT NULL,
    reservation_number VARCHAR(20) NOT NULL UNIQUE,
    status ENUM('PENDING', 'CONFIRMED', 'MODIFIED', 'CANCELLED', 'COMPLETED') NOT NULL,
    start_at DATETIME NOT NULL,
    end_at DATETIME NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    offer_snapshot_json JSON NOT NULL,
    idempotency_key VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_reservation_user FOREIGN KEY (user_id) 
        REFERENCES user(id) ON DELETE RESTRICT,
    CONSTRAINT fk_reservation_pickup_location FOREIGN KEY (pickup_location_id) 
        REFERENCES location(id) ON DELETE RESTRICT,
    CONSTRAINT fk_reservation_return_location FOREIGN KEY (return_location_id) 
        REFERENCES location(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: reservation_option
-- ============================================
CREATE TABLE reservation_option (
    id VARCHAR(36) PRIMARY KEY,
    reservation_id VARCHAR(36) NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_reservation_option_reservation FOREIGN KEY (reservation_id) 
        REFERENCES reservation(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: payment
-- ============================================
CREATE TABLE payment (
    id VARCHAR(36) PRIMARY KEY,
    reservation_id VARCHAR(36) NOT NULL,
    psp_intent_id VARCHAR(255) NOT NULL UNIQUE,
    status ENUM('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    idempotency_key VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    CONSTRAINT fk_payment_reservation FOREIGN KEY (reservation_id) 
        REFERENCES reservation(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: document
-- ============================================
CREATE TABLE document (
    id VARCHAR(36) PRIMARY KEY,
    reservation_id VARCHAR(36) NOT NULL,
    document_type ENUM('CONTRACT', 'INVOICE', 'DRIVER_LICENSE') NOT NULL,
    url VARCHAR(500) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_document_reservation FOREIGN KEY (reservation_id) 
        REFERENCES reservation(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;