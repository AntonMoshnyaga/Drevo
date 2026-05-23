CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    photo_url LONGTEXT
);

CREATE TABLE IF NOT EXISTS families (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS connections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    family_id INT NOT NULL,
    account_id INT NOT NULL,
    role_id INT NOT NULL,
    FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS family_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    family_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    gender BOOLEAN NOT NULL,
    birth_date DATE,
    death_date DATE,
    photo_url LONGTEXT,
    FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS relationships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT NOT NULL,
    child_id INT NOT NULL,
    relation_type ENUM('biological', 'step', 'adopted') DEFAULT 'biological',
    FOREIGN KEY (parent_id) REFERENCES family_members(id) ON DELETE CASCADE,
    FOREIGN KEY (child_id) REFERENCES family_members(id) ON DELETE CASCADE,
    UNIQUE KEY unique_rel (parent_id, child_id)
);

CREATE TABLE IF NOT EXISTS join_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    family_id INT NOT NULL,
    account_id INT NOT NULL,
    role_id INT NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    expiry_date DATETIME,
    max_uses INT DEFAULT 1,
    uses_count INT DEFAULT 0,
    FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

INSERT INTO roles (id, role_name) VALUES (1, 'Owner'), (2, 'Redactor'), (3, 'Guest');