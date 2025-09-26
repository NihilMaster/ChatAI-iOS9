// server.js 
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
    console.log('📝 Body:', req.body);
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

// Ruta principal del chat - SOLO Gemini 2.0 Flash
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

        console.log('🔑 API Key recibida');
        console.log('💬 Mensaje recibido:', message);

        // ÚNICO ENDPOINT Y MODELO - GEMINI 2.0 FLASH
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
                }),
            }
        );

        console.log('📡 Status de Gemini:', geminiResponse.status);

        if (!geminiResponse.ok) {
            var errorText = await geminiResponse.text();
            console.error('❌ Error de Gemini:', errorText);

            return res.json({
                success: false,
                error: 'Error en la API de Gemini',
                status: geminiResponse.status,
                raw: errorText,
            });
        }

        var geminiData = await geminiResponse.json();
        console.log('✅ Respuesta de Gemini recibida');

        if (
            geminiData.candidates &&
            geminiData.candidates[0] &&
            geminiData.candidates[0].content
        ) {
            var responseText =
                geminiData.candidates[0].content.parts[0].text;

            console.log('📤 Enviando respuesta al cliente');
            res.json({
                success: true,
                message: responseText,
                model: 'gemini-2.0-flash',
                timestamp: new Date().toISOString(),
            });
        } else {
            console.warn('⚠️ Respuesta inesperada de Gemini');
            res.json({
                success: false,
                error: 'Respuesta inesperada de la API',
                rawResponse: geminiData,
            });
        }
    } catch (error) {
        console.error('💥 Error en el servidor:', error);
        res.json({
            success: false,
            error: 'Error: ' + error.message,
        });
    }
});

// Iniciar servidor
app.listen(PORT, function () {
    console.log('🚀 Servidor backend corriendo en puerto ' + PORT);
    console.log('📍 URL: https://chatai-ios9.onrender.com');
});
