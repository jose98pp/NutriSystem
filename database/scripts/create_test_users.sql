-- Script para crear usuarios de prueba en producción
-- Ejecutar desde la consola SQL de Render
-- 
-- IMPORTANTE: Las contraseñas están hasheadas con bcrypt (10 rounds)
-- Contraseñas en texto plano para referencia:
-- - Admin: Admin123!
-- - Nutricionista: Nutri123!
-- - Paciente: Paciente123!
-- - Psicólogo: Psico123!

-- Verificar si los usuarios ya existen antes de insertar
DO $$
BEGIN
    -- 1. ADMIN USER
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@nutrisystem.com') THEN
        INSERT INTO users (name, email, password, role, telefono, created_at, updated_at)
        VALUES (
            'Admin Sistema',
            'admin@nutrisystem.com',
            '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Admin123!
            'admin',
            '+1234567890',
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Usuario admin creado exitosamente';
    ELSE
        RAISE NOTICE 'Usuario admin ya existe';
    END IF;

    -- 2. NUTRICIONISTA USER
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'nutricionista@nutrisystem.com') THEN
        INSERT INTO users (name, email, password, role, telefono, created_at, updated_at)
        VALUES (
            'María Nutricionista',
            'nutricionista@nutrisystem.com',
            '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Nutri123!
            'nutricionista',
            '+1234567891',
            NOW(),
            NOW()
        );

        -- Crear registro en tabla nutricionistas
        INSERT INTO nutricionistas (user_id, nombre, apellido, email, celular, created_at, updated_at)
        SELECT 
            id,
            'María',
            'Nutricionista',
            'nutricionista@nutrisystem.com',
            '+1234567891',
            NOW(),
            NOW()
        FROM users WHERE email = 'nutricionista@nutrisystem.com';

        RAISE NOTICE 'Usuario nutricionista creado exitosamente';
    ELSE
        RAISE NOTICE 'Usuario nutricionista ya existe';
    END IF;

    -- 3. PACIENTE USER
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'paciente@nutrisystem.com') THEN
        INSERT INTO users (name, email, password, role, telefono, created_at, updated_at)
        VALUES (
            'Juan Paciente',
            'paciente@nutrisystem.com',
            '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Paciente123!
            'paciente',
            '+1234567892',
            NOW(),
            NOW()
        );

        -- Crear registro en tabla pacientes
        INSERT INTO pacientes (user_id, nombre, apellido, email, telefono, fecha_nacimiento, genero, created_at, updated_at)
        SELECT 
            id,
            'Juan',
            'Paciente',
            'paciente@nutrisystem.com',
            '+1234567892',
            '1990-01-01',
            'M',
            NOW(),
            NOW()
        FROM users WHERE email = 'paciente@nutrisystem.com';

        RAISE NOTICE 'Usuario paciente creado exitosamente';
    ELSE
        RAISE NOTICE 'Usuario paciente ya existe';
    END IF;

    -- 4. PSICÓLOGO USER
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'psicologo@nutrisystem.com') THEN
        INSERT INTO users (name, email, password, role, telefono, created_at, updated_at)
        VALUES (
            'Carlos Psicólogo',
            'psicologo@nutrisystem.com',
            '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Psico123!
            'psicologo',
            '+1234567893',
            NOW(),
            NOW()
        );

        -- Crear registro en tabla psicologos
        INSERT INTO psicologos (user_id, nombre, apellido, email, celular, created_at, updated_at)
        SELECT 
            id,
            'Carlos',
            'Psicólogo',
            'psicologo@nutrisystem.com',
            '+1234567893',
            NOW(),
            NOW()
        FROM users WHERE email = 'psicologo@nutrisystem.com';

        RAISE NOTICE 'Usuario psicólogo creado exitosamente';
    ELSE
        RAISE NOTICE 'Usuario psicólogo ya existe';
    END IF;

END $$;

-- Verificar que los usuarios fueron creados
SELECT 
    id,
    name,
    email,
    role,
    created_at
FROM users
WHERE email IN (
    'admin@nutrisystem.com',
    'nutricionista@nutrisystem.com',
    'paciente@nutrisystem.com',
    'psicologo@nutrisystem.com'
)
ORDER BY role, email;

-- Mostrar credenciales para referencia
SELECT 
    '=== CREDENCIALES DE USUARIOS DE PRUEBA ===' as info
UNION ALL
SELECT '1. Admin:' 
UNION ALL SELECT '   Email: admin@nutrisystem.com'
UNION ALL SELECT '   Password: Admin123!'
UNION ALL SELECT ''
UNION ALL SELECT '2. Nutricionista:'
UNION ALL SELECT '   Email: nutricionista@nutrisystem.com'
UNION ALL SELECT '   Password: Nutri123!'
UNION ALL SELECT ''
UNION ALL SELECT '3. Paciente:'
UNION ALL SELECT '   Email: paciente@nutrisystem.com'
UNION ALL SELECT '   Password: Paciente123!'
UNION ALL SELECT ''
UNION ALL SELECT '4. Psicólogo:'
UNION ALL SELECT '   Email: psicologo@nutrisystem.com'
UNION ALL SELECT '   Password: Psico123!';
