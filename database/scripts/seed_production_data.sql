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

INSERT INTO nutricionistas (user_id, nombre, apellido, email, telefono, especialidad, created_at, updated_at)
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

INSERT INTO nutricionistas (user_id, nombre, apellido, email, telefono, especialidad, created_at, updated_at)
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

INSERT INTO pacientes (user_id, nombre, apellido, email, telefono, fecha_nacimiento, genero, created_at, updated_at)
SELECT 
    u.id,
    'Juan',
    'Pérez',
    'juan@example.com',
    '+59171088337',
    '1990-05-15',
    'M',
    NOW(),
    NOW()
FROM users u
WHERE u.email = 'juan@example.com'
ON CONFLICT (email) DO NOTHING;

INSERT INTO pacientes (user_id, nombre, apellido, email, telefono, fecha_nacimiento, genero, created_at, updated_at)
SELECT 
    u.id,
    'Ana',
    'Gómez',
    'ana@example.com',
    '+59171088338',
    '1985-08-20',
    'F',
    NOW(),
    NOW()
FROM users u
WHERE u.email = 'ana@example.com'
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 4. PSICÓLOGOS
-- ============================================

INSERT INTO psicologos (user_id, nombre, apellido, telefono, especialidad, estado, cedula_profesional, created_at, updated_at)
SELECT 
    u.id,
    'Roberto',
    'Silva',
    '+59171088339',
    'Psicología Clínica',
    'ACTIVO',
    'PSI-001',
    NOW(),
    NOW()
FROM users u
WHERE u.email = 'roberto@psicologo.com'
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. SERVICIOS
-- ============================================

INSERT INTO servicios (nombre, descripcion, costo, duracion_dias, tipo_servicio, created_at, updated_at)
SELECT v.nombre, v.descripcion, v.costo, v.duracion_dias, v.tipo_servicio, NOW(), NOW()
FROM (
    VALUES
        ('Plan Básico', 'Plan nutricional básico con seguimiento mensual', 150.00, 30, 'plan_alimenticio'),
        ('Plan Premium', 'Plan nutricional completo con seguimiento semanal y recetas personalizadas', 300.00, 30, 'plan_alimenticio'),
        ('Plan Elite', 'Plan nutricional elite con seguimiento diario, recetas, y consultas ilimitadas', 500.00, 30, 'plan_alimenticio'),
        ('Consulta Individual', 'Consulta nutricional individual de 1 hora', 50.00, 1, 'asesoramiento'),
        ('Sesión Psicológica', 'Sesión de psicología individual de 1 hora', 60.00, 1, 'asesoramiento')
) AS v(nombre, descripcion, costo, duracion_dias, tipo_servicio)
WHERE NOT EXISTS (
    SELECT 1 FROM servicios s WHERE s.nombre = v.nombre
);

-- ============================================
-- 6. ALIMENTOS BÁSICOS
-- ============================================

INSERT INTO alimentos (nombre, categoria, calorias_por_100g, proteinas_por_100g, carbohidratos_por_100g, grasas_por_100g, created_at, updated_at)
SELECT v.nombre, v.categoria, v.calorias, v.proteinas, v.carbohidratos, v.grasas, NOW(), NOW()
FROM (
    VALUES
        -- Proteínas
        ('Pechuga de Pollo', 'proteina', 165, 31.0, 0.0, 3.6),
        ('Huevo', 'proteina', 155, 13.0, 1.1, 11.0),
        ('Atún en agua', 'proteina', 116, 26.0, 0.0, 1.0),
        ('Salmón', 'proteina', 208, 20.0, 0.0, 13.0),

        -- Carbohidratos / cereales
        ('Arroz integral', 'cereal', 370, 7.9, 77.2, 2.9),
        ('Avena', 'cereal', 389, 16.9, 66.3, 6.9),
        ('Pan integral', 'cereal', 247, 13.0, 41.0, 4.0),
        ('Quinoa', 'cereal', 368, 14.1, 64.2, 6.1),

        -- Verduras
        ('Brócoli', 'verdura', 34, 2.8, 7.0, 0.4),
        ('Espinaca', 'verdura', 23, 2.9, 3.6, 0.4),
        ('Tomate', 'verdura', 18, 0.9, 3.9, 0.2),
        ('Zanahoria', 'verdura', 41, 0.9, 10.0, 0.2),

        -- Frutas
        ('Manzana', 'fruta', 52, 0.3, 14.0, 0.2),
        ('Plátano', 'fruta', 89, 1.1, 23.0, 0.3),
        ('Naranja', 'fruta', 47, 0.9, 12.0, 0.1),
        ('Fresa', 'fruta', 32, 0.7, 7.7, 0.3),

        -- Grasas saludables
        ('Aguacate', 'grasa', 160, 2.0, 8.5, 14.7),
        ('Almendras', 'grasa', 579, 21.2, 21.6, 49.9),
        ('Aceite de oliva', 'grasa', 884, 0.0, 0.0, 100.0),
        ('Nueces', 'grasa', 654, 15.2, 13.7, 65.2)
) AS v(nombre, categoria, calorias, proteinas, carbohidratos, grasas)
WHERE NOT EXISTS (
    SELECT 1 FROM alimentos a WHERE a.nombre = v.nombre
);

COMMIT;

-- ============================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- ============================================

-- Mostrar usuarios creados
SELECT 
    info,
    email,
    role,
    password_hint
FROM (
    SELECT 
        0 AS sort_order,
        '=== USUARIOS CREADOS ===' AS info,
        '' AS email,
        '' AS role,
        '' AS password_hint
    UNION ALL
    SELECT 
        CASE 
            WHEN u.role = 'admin' THEN 1
            WHEN u.role = 'nutricionista' THEN 2
            WHEN u.role = 'paciente' THEN 3
            WHEN u.role = 'psicologo' THEN 4
            ELSE 5
        END AS sort_order,
        u.name AS info,
        u.email,
        u.role,
        'password' AS password_hint
    FROM users u
) ordered_rows
ORDER BY sort_order, email;

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
UNION ALL SELECT 'Todos los usuarios usan la contraseña: password'
UNION ALL SELECT ''
UNION ALL SELECT 'ADMIN:'
UNION ALL SELECT '   Email: admin@nutrisystem.com'
UNION ALL SELECT ''
UNION ALL SELECT 'NUTRICIONISTAS:'
UNION ALL SELECT '   Email: carlos@nutricion.com'
UNION ALL SELECT '   Email: maria@nutricion.com'
UNION ALL SELECT ''
UNION ALL SELECT 'PACIENTES:'
UNION ALL SELECT '   Email: juan@example.com'
UNION ALL SELECT '   Email: ana@example.com'
UNION ALL SELECT ''
UNION ALL SELECT 'PSICÓLOGO:'
UNION ALL SELECT '   Email: roberto@psicologo.com'
UNION ALL SELECT '========================================';
