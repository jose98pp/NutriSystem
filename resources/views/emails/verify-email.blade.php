<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifica tu correo electrónico</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>¡Bienvenido a NutriSystem!</h1>
    </div>
    <div class="content">
        <p>Hola {{ $user->name }},</p>
        
        <p>Gracias por registrarte en NutriSystem. Para completar tu registro, por favor verifica tu correo electrónico haciendo clic en el siguiente botón:</p>
        
        <div style="text-align: center;">
            <a href="{{ $verificationUrl }}" class="button">Verificar mi correo</a>
        </div>
        
        <p>O copia y pega este enlace en tu navegador:</p>
        <p style="word-break: break-all; color: #667eea;">{{ $verificationUrl }}</p>
        
        <p>Este enlace expirará en 24 horas.</p>
        
        <p>Si no creaste esta cuenta, puedes ignorar este correo.</p>
        
        <p>Saludos,<br>El equipo de NutriSystem</p>
    </div>
    <div class="footer">
        <p>&copy; {{ date('Y') }} NutriSystem. Todos los derechos reservados.</p>
    </div>
</body>
</html>
