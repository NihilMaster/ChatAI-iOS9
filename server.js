// server.js - Backend con parser CORREGIDO
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors({ origin: '*' }));

// Log de requests
app.use(function (req, res, next) {
    console.log('📨 Request recibida:', req.method, req.url);
    next();
});

// Headers CORS
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    next();
});

// Manejar OPTIONS
app.options('*', function (req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
    res.sendStatus(200);
});

// Ruta raíz
app.get('/', function (req, res) {
    res.json({
        status: 'OK',
        message: 'Backend funcionando',
        timestamp: new Date().toISOString(),
    });
});

// Ruta test
app.get('/test', function (req, res) {
    res.json({
        success: true,
        message: 'Test exitoso desde el backend',
        data: { test: 'funcionando' },
    });
});

// Ruta principal del chat con parser CORREGIDO
app.post('/chat', async function (req, res) {
    try {
        console.log('🔍 Chat endpoint llamado');
        var message = req.body.message;
        var apiKey = req.body.apiKey;

        if (!message || !apiKey) {
            return res.json({
                success: false,
                error: 'Faltan message o apiKey',
            });
        }

        console.log('💬 Mensaje recibido:', message);

        var geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: message,
                                },
                            ],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1000,
                    }
                }),
            }
        );

        console.log('📡 Status de Gemini:', geminiResponse.status);

        if (!geminiResponse.ok) {
            var errorText = await geminiResponse.text();
            console.error('❌ Error de Gemini:', errorText);
            return res.json({
                success: false,
                error: 'Error en la API de Gemini. Código: ' + geminiResponse.status,
            });
        }

        var geminiData = await geminiResponse.json();
        console.log('✅ Respuesta de Gemini recibida');

        if (geminiData.candidates && geminiData.candidates[0] && geminiData.candidates[0].content) {
            var rawResponse = geminiData.candidates[0].content.parts[0].text;
            var formattedResponse = parseMarkdownForIOS9(rawResponse);
            
            console.log('📤 Enviando respuesta formateada');
            res.json({
                success: true,
                message: formattedResponse,
                model: 'gemini-2.0-flash',
                timestamp: new Date().toISOString(),
            });
        } else {
            res.json({
                success: false,
                error: 'La API devolvió una respuesta inesperada',
            });
        }
    } catch (error) {
        console.error('💥 Error en el servidor:', error);
        res.json({
            success: false,
            error: 'Error interno: ' + error.message,
        });
    }
});

// PARSER CORREGIDO - Sin errores de sintaxis
function parseMarkdownForIOS9(text) {
    if (!text) return '';
    
    var parsed = text;
    
    console.log('📝 Parseando texto original:', text.substring(0, 100) + '...');
    
    // 1. ENCABEZADOS
    parsed = parsed.replace(/^# (.*$)/gim, '🟦 **$1**\n────────────────────');
    parsed = parsed.replace(/^## (.*$)/gim, '🔷 **$1**\n────────────────────');
    parsed = parsed.replace(/^### (.*$)/gim, '🔹 **$1**\n────────────────────');
    
    // 2. LÍNEAS SEPARADORAS
    parsed = parsed.replace(/^---+/gim, '────────────────────');
    parsed = parsed.replace(/^___+/gim, '────────────────────');
    parsed = parsed.replace(/^\*\*\*+/gim, '────────────────────');
    
    // 3. LISTAS
    parsed = parsed.replace(/^\- (.*$)/gim, '• $1');
    parsed = parsed.replace(/^\* (.*$)/gim, '• $1');
    parsed = parsed.replace(/^\+ (.*$)/gim, '• $1');
    
    // 4. LISTAS NUMERADAS
    parsed = parsed.replace(/^(\d+)\. (.*$)/gim, '$1. $2');
    
    // 5. NEGRITA - CORREGIDO (sin doble pasada)
    parsed = parsed.replace(/\*\*(.*?)\*\*/g, '**$1**');
    
    // 6. CURSIVA - CORREGIDO (error de typo)
    parsed = parsed.replace(/\*(.*?)\*/g, '_$1_');
    parsed = parsed.replace(/_(.*?)_/g, '_$1_'); 
    
    // 7. CÓDIGO
    parsed = parsed.replace(/```([^`]+)```/g, '📋 $1');
    parsed = parsed.replace(/`([^`]+)`/g, '"$1"');
    
    // 8. BLOQUES DE CITA
    parsed = parsed.replace(/^> (.*$)/gim, '│ $1');
    
    // 9. ENLACES
    parsed = parsed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 (🔗 enlace)');
    
    // 10. LIMPIAR HTML
    parsed = parsed.replace(/&amp;/g, '&')
                  .replace(/&lt;/g, '<')
                  .replace(/&gt;/g, '>')
                  .replace(/&quot;/g, '"')
                  .replace(/&#39;/g, "'");
    
    // 11. NORMALIZAR SALTOS DE LÍNEA
    parsed = parsed.replace(/\n\s*\n\s*\n/g, '\n\n');
    parsed = parsed.replace(/\r\n/g, '\n');
    
    // 12. LIMITAR LONGITUD
    if (parsed.length > 3000) {
        parsed = parsed.substring(0, 3000) + '\n\n...[mensaje truncado]';
    }
    
    console.log('✅ Texto parseado correctamente');
    return parsed;
}

// Iniciar servidor
app.listen(PORT, function () {
    console.log('🚀 Servidor backend corriendo en puerto ' + PORT);
    console.log('📍 URL: https://chatai-ios9.onrender.com');
});