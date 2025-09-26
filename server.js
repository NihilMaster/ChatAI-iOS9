// server.js - VERSIÓN MEJORADA CON DEBUGGING
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware con más logging
app.use(express.json({ limit: '10mb' }));
app.use(cors({ origin: '*' }));

// Log todas las requests
app.use(function(req, res, next) {
    console.log('📨 Request recibida:', req.method, req.url);
    console.log('📝 Body:', req.body);
    next();
});

// Headers compatibles
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    next();
});

// Manejar OPTIONS para CORS preflight
app.options('*', function(req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
    res.sendStatus(200);
});

// Ruta de prueba
app.get('/', function(req, res) {
    res.json({ 
        status: 'OK', 
        message: 'Backend funcionando',
        timestamp: new Date().toISOString()
    });
});

app.get('/test', function(req, res) {
    res.json({ 
        success: true,
        message: 'Test exitoso desde el backend',
        data: { test: 'funcionando' }
    });
});


// =====================
// RUTA DE CHAT - PRUEBA
// =====================
app.post('/chat-test', async function(req, res) {
    try {
        console.log('🔍 Chat-test endpoint llamado');
        console.log('📦 Body recibido:', req.body);
        
        var message = req.body.message;
        var apiKey = req.body.apiKey;

        if (!message) {
            return res.json({
                success: false,
                error: 'No se recibió mensaje'
            });
        }

        if (!apiKey) {
            return res.json({
                success: false,
                error: 'No se recibió API key'
            });
        }

        console.log('🔑 API Key recibida (primeros 10 chars):', apiKey.substring(0, 10) + '...');
        console.log('💬 Mensaje recibido:', message);

        // Responder con un mensaje de prueba SIN llamar a Gemini
        var testResponse = {
            success: true,
            message: "✅ Backend funcionando. Mensaje recibido: '" + message + "'. Longitud: " + message.length + " caracteres.",
            debug: {
                apiKeyLength: apiKey.length,
                timestamp: new Date().toISOString(),
                backend: 'Render.com'
            }
        };

        console.log('📤 Enviando respuesta:', testResponse);
        res.json(testResponse);

    } catch (error) {
        console.error('❌ Error en /chat-test:', error);
        res.json({
            success: false,
            error: 'Error: ' + error.message
        });
    }
});


// ===========================
// RUTA PRINCIPAL DE CHAT REAL
// ===========================
app.post('/chat', async function(req, res) {
    try {
        console.log('🔍 Chat endpoint llamado');
        var message = req.body.message;
        var apiKey = req.body.apiKey;

        if (!message || !apiKey) {
            return res.json({
                success: false,
                error: 'Faltan message o apiKey'
            });
        }

        console.log('🔑 API Key recibida');
        console.log('💬 Mensaje recibido:', message);

        // LLAMADA REAL A GEMINI API
        var geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: message
                    }]
                }],
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold: "BLOCK_ONLY_HIGH"
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            })
        });

        console.log('📡 Status de Gemini:', geminiResponse.status);

        if (!geminiResponse.ok) {
            var errorText = await geminiResponse.text();
            console.error('❌ Error de Gemini:', errorText);
            
            // Respuesta de error amigable
            return res.json({
                success: false,
                error: 'Error en la API de Gemini. Código: ' + geminiResponse.status,
                suggestion: 'Verifica tu API key o intenta más tarde.'
            });
        }

        var geminiData = await geminiResponse.json();
        console.log('✅ Respuesta de Gemini recibida');

        if (geminiData.candidates && geminiData.candidates[0] && geminiData.candidates[0].content) {
            var responseText = geminiData.candidates[0].content.parts[0].text;
            
            console.log('📤 Enviando respuesta al cliente');
            res.json({
                success: true,
                message: responseText,
                timestamp: new Date().toISOString()
            });
            
        } else {
            console.warn('⚠️ Respuesta inesperada de Gemini:', JSON.stringify(geminiData));
            res.json({
                success: false,
                error: 'La API de Gemini devolvió una respuesta inesperada',
                rawResponse: geminiData
            });
        }

    } catch (error) {
        console.error('💥 Error en el servidor:', error);
        res.json({
            success: false,
            error: 'Error interno del servidor: ' + error.message
        });
    }
});


// =====================
// INICIO DEL SERVIDOR
// =====================
app.listen(PORT, function() {
    console.log('🚀 Servidor backend corriendo en puerto ' + PORT);
    console.log('📍 URL base: https://chatai-ios9.onrender.com');
});
