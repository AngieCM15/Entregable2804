-- Crear la base de datos entregable
CREATE DATABASE entregable;
USE entregable;

-- Crear la tabla marcas
CREATE TABLE marcas
(
    idmarca 	INT AUTO_INCREMENT PRIMARY KEY,
    marca 		VARCHAR(40) 	NOT NULL,
    CONSTRAINT uk_marca UNIQUE (marca)
)ENGINE = INNODB;

-- Crear la tabla licores
CREATE TABLE licores
(
    idlicor 		INT AUTO_INCREMENT PRIMARY KEY,
    idmarca 		INT 			NOT NULL,
    nombre 			VARCHAR(40)		NOT NULL,
    dni 			VARCHAR(8)		NOT NULL,
    cantidad 		INT 			NOT NULL,
    condicion 		ENUM('Seco', 'Semiseco', 'Dulce') NOT NULL,
    CONSTRAINT fk_idmarca_lic FOREIGN KEY (idmarca) REFERENCES marcas (idmarca)
)ENGINE = INNODB;

-- Insertar datos en la tabla marcas
INSERT INTO marcas (marca) VALUES 
    ('Finca Rotondo'),  -- 1
    ('Montesierpe'),    -- 2
    ('Vargas'),         -- 3
    ('Borgoña'),        -- 4
    ('Malbec Viña Vieja'); -- 5

-- Insertar datos en la tabla licores
INSERT INTO licores (idmarca, nombre, dni, cantidad, condicion) VALUES
    (1, 'Pisco Finca Rotondo', '12345678', 20, 'Seco'),  
    (2, 'Pisco Montesierpe', '23456789', 15, 'Semiseco'), 
    (3, 'Pisco Acholado Vargas', '34567890', 25, 'Seco'),  
    (4, 'Vino Borgoña', '45678901', 10, 'Dulce'),        
    (5, 'Malbec Viña Vieja', '56789012', 30, 'Semiseco');
