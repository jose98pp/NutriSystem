-- ============================================
-- SCRIPT DE DATOS INICIALES PARA PRODUCCIÓN
-- ============================================
-- Este script inserta datos de prueba en la base de datos de producción
-- Ejecutar desde la consola SQL de Render o pgAdmin
--
-- CONTRASEÑAS (todas usan bcrypt con 10 rounds):
-- Contraseña genérica para todos: password
-- Hash: $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

BEGIN;

-- ============================================
-- 1. USUARIOS Y ROLES
-- ============================================

-- Admin
INSERT INTO users (name, email, password, role, telefono, email_verified_at, created_at, updated_at)
VALUES (
    'Admin Sistema',
    'admin@nutrisystem.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin',
    '+59171088334',
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Nutricionista 1
INSERT INTO users (name, email, password, role, telefono, email_verified_at, created_at, updated_at)
VALUES (
    'Carlos Rodríguez',
    'carlos@nutricion.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'nutricionista',
    '+59171088335',
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Nutricionista 2
INSERT INTO users (name, email, password, role, telefono, email_verified_at, created_at, updated_at)
VALUES (
    'María González',
    'maria@nutricion.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'nutricionista',
    '+59171088336',
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Paciente 1
INSERT INTO users (name, email, password, role, telefono, email_verified_at, created_at, updated_at)
VALUES (
    'Juan Pérez',
    'juan@example.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'paciente',
    '+59171088337',
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Paciente 2
INSERT INTO users (name, email, password, role, telefono, email_verified_at, created_at, updated_at)
VALUES (
    'Ana Gómez',
    'ana@example.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'paciente',
    '+59171088338',
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Psicólogo
INSERT INTO users (name, email, password, role, telefono, email_verified_at, created_at, updated_at)
VALUES (
    'Dr. Roberto Silva',
    'roberto@psicologo.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'psicologo',
    '+59171088339',
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 2. NUTRICIONISTAS
-- ============================================

INSERT INTO nutricionistas (user_id, nombre, apellido, email, celular, especialidad, created_at, updated_at)
SELECT 
    u.id,
    'Carlos',
    'Rodríguez',
    'carlos@nutricion.com',
    '+59171088335',
    'Nutrición Deportiva',
    NOW(),
    NOW()
FROM users u
WHERE u.email = 'carlos@nutricion.com'
ON CONFLICT (email) DO NOTHING;

INSERT INTO nutricionistas (user_id, nombre, apellido, email, celular, especialidad, created_at, updated_at)
SELECT 
    u.id,
    'María',
    'González',
    'maria@nutricion.com',
    '+59171088336',
    'Nutrición Clínica',
    NOW(),
    NOW()
FROM users u
WHERE u.email = 'maria@nutricion.com'
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 3. PACIENTES
-- ============================================

INSERT INTO pacientes (user_id, nombre, apellido, email, celular, fecha_nacimiento, genero, created_at, updated_at)
SELECT 
    u.id,
    'Juan',
    'Pérez',
    'juan@example.com',
    '+59171088337',
    '1990-05-15',
    'Masculino',
    NOW(),
    NOW()
FROM users u
WHERE u.email = 'juan@example.com'
ON CONFLICT (email) DO NOTHING;

INSERT INTO pacientes (user_id, nombre, apellido, email, celular, fecha_nacimiento, genero, created_at, updated_at)
SELECT 
    u.id,
    'Ana',
    'Gómez',
    'ana@example.com',
    '+59171088338',
    '1985-08-20',
    'Femenino',
    NOW(),
    NOW()
FROM users u
WHERE u.email = 'ana@example.com'
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 4. PSICÓLOGOS
-- ============================================

INSERT INTO psicologos (user_id, nombre, apellido, email, celular, especialidad, created_at, updated_at)
SELECT 
    u.id,
    'Roberto',
    'Silva',
    'roberto@psicologo.com',
    '+59171088339',
    'Psicología Clínica',
    NOW(),
    NOW()
FROM users u
WHERE u.email = 'roberto@psicologo.com'
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 5. SERVICIOS
-- ============================================

INSERT INTO servicios (nombre, descripcion, precio, duracion_dias, created_at, updated_at)
VALUES 
    ('Plan Básico', 'Plan nutricional básico con seguimiento mensual', 150.00, 30, NOW(), NOW()),
    ('Plan Premium', 'Plan nutricional completo con seguimiento semanal y recetas personalizadas', 300.00, 30, NOW(), NOW()),
    ('Plan Elite', 'Plan nutricional elite con seguimiento diario, recetas, y consultas ilimitadas', 500.00, 30, NOW(), NOW()),
    ('Consulta Individual', 'Consulta nutricional individual de 1 hora', 50.00, 1, NOW(), NOW()),
    ('Sesión Psicológica', 'Sesión de psicología individual de 1 hora', 60.00, 1, NOW(), NOW())
ON CONFLICT (nombre) DO NOTHING;

-- ============================================
-- 6. ALIMENTOS BÁSICOS
-- ============================================

INSERT INTO alimentos (nombre, categoria, calorias, proteinas, carbohidratos, grasas, fibra, created_at, updated_at)
VALUES 
    -- Proteínas
    ('Pechuga de Pollo', 'Proteínas', 165, 31.0, 0.0, 3.6, 0.0, NOW(), NOW()),
    ('Huevo', 'Proteínas', 155, 13.0, 1.1, 11.0, 0.0, NOW(), NOW()),
    ('Atún en agua', 'Proteínas', 116, 26.0, 0.0, 1.0, 0.0, NOW(), NOW()),
    ('Salmón', 'Proteínas', 208, 20.0, 0.0, 13.0, 0.0, NOW(), NOW()),
    
    -- Carbohidratos
    ('Arroz integral', 'Carbohidratos', 370, 7.9, 77.2, 2.9, 3.5, NOW(), NOW()),
    ('Avena', 'Carbohidratos', 389, 16.9, 66.3, 6.9, 10.6, NOW(), NOW()),
    ('Pan integral', 'Carbohidratos', 247, 13.0, 41.0, 4.0, 7.0, NOW(), NOW()),
    ('Quinoa', 'Carbohidratos', 368, 14.1, 64.2, 6.1, 7.0, NOW(), NOW()),
    
    -- Vegetales
    ('Brócoli', 'Vegetales', 34, 2.8, 7.0, 0.4, 2.6, NOW(), NOW()),
    ('Espinaca', 'Vegetales', 23, 2.9, 3.6, 0.4, 2.2, NOW(), NOW()),
    ('Tomate', 'Vegetales', 18, 0.9, 3.9, 0.2, 1.2, NOW(), NOW()),
    ('Zanahoria', 'Vegetales', 41, 0.9, 10.0, 0.2, 2.8, NOW(), NOW()),
    
    -- Frutas
    ('Manzana', 'Frutas', 52, 0.3, 14.0, 0.2, 2.4, NOW(), NOW()),
    ('Plátano', 'Frutas', 89, 1.1, 23.0, 0.3, 2.6, NOW(), NOW()),
    ('Naranja', 'Frutas', 47, 0.9, 12.0, 0.1, 2.4, NOW(), NOW()),
    ('Fresa', 'Frutas', 32, 0.7, 7.7, 0.3, 2.0, NOW(), NOW()),
    
    -- Grasas saludables
    ('Aguacate', 'Grasas', 160, 2.0, 8.5, 14.7, 6.7, NOW(), NOW()),
    ('Almendras', 'Grasas', 579, 21.2, 21.6, 49.9, 12.5, NOW(), NOW()),
    ('Aceite de oliva', 'Grasas', 884, 0.0, 0.0, 100.0, 0.0, NOW(), NOW()),
    ('Nueces', 'Grasas', 654, 15.2, 13.7, 65.2, 6.7, NOW(), NOW())
ON CONFLICT (nombre) DO NOTHING;

COMMIT;

-- ============================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- ============================================

-- Mostrar usuarios creados
SELECT 
    '=== USUARIOS CREADOS ===' as info,
    '' as email,
    '' as role,
    '' as password_hint
UNION ALL
SELECT 
    u.name,
    u.email,
    u.role,
    'password' as password_hint
FROM users u
ORDER BY 
    CASE 
        WHEN role = 'admin' THEN 1
        WHEN role = 'nutricionista' THEN 2
        WHEN role = 'paciente' THEN 3
        WHEN role = 'psicologo' THEN 4
        ELSE 5
    END,
    u.email;

-- Contar registros
SELECT 
    'Usuarios' as tabla,
    COUNT(*) as total
FROM users
UNION ALL
SELECT 'Nutricionistas', COUNT(*) FROM nutricionistas
UNION ALL
SELECT 'Pacientes', COUNT(*) FROM pacientes
UNION ALL
SELECT 'Psicólogos', COUNT(*) FROM psicologos
UNION ALL
SELECT 'Servicios', COUNT(*) FROM servicios
UNION ALL
SELECT 'Alimentos', COUNT(*) FROM alimentos;

-- ============================================
-- CREDENCIALES DE ACCESO
-- ============================================
SELECT 
    '========================================' as info
UNION ALL SELECT 'CREDENCIALES DE ACCESO'
UNION ALL SELECT '========================================'
UNION ALL SELECT ''
UNION ALL SELECT '📧 Todos los usuarios usan la contraseña: password'
UNION ALL SELECT ''
UNION ALL SELECT '👤 ADMIN:'
UNION ALL SELECT '   Email: admin@nutrisystem.com'
UNION ALL SELECT ''
UNION ALL SELECT '👨‍⚕️ NUTRICIONISTAS:'
UNION ALL SELECT '   Email: carlos@nutricion.com'
UNION ALL SELECT '   Email: maria@nutricion.com'
UNION ALL SELECT ''
UNION ALL SELECT '👥 PACIENTES:'
UNION ALL SELECT '   Email: juan@example.com'
UNION ALL SELECT '   Email: ana@example.com'
UNION ALL SELECT ''
UNION ALL SELECT '🧠 PSICÓLOGO:'
UNION ALL SELECT '   Email: roberto@psicologo.com'
UNION ALL SELECT '========================================';
