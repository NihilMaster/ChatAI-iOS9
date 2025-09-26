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
app.use(function(req, res, next) {
    console.log('📨 Request recibida:', req.method, req.url);
    console.log('📝 Body:', req.body);
    next();
});

// Headers CORS
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    next();
});

// Manejar OPTIONS
app.options('*', function(req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
    res.sendStatus(200);
});

// Ruta raíz
app.get('/', function(req, res) {
    res.json({
        status: 'OK',
        message: 'Backend funcionando',
        timestamp: new Date().toISOString()
    });
});

// Ruta test
app.get('/test', function(req, res) {
    res.json({
        success: true,
        message: 'Test exitoso desde el backend',
        data: { test: 'funcionando' }
    });
});

// Ruta principal del chat - Gemini API ACTUALIZADA
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

        // ENDPOINT CORREGIDO - Versión actual de Gemini API
        var geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: message
                    }]
                }]
            })
        });

        console.log('📡 Status de Gemini:', geminiResponse.status);

        if (!geminiResponse.ok) {
            var errorText = await geminiResponse.text();
            console.error('❌ Error de Gemini:', errorText);
            
            // Intentamos con Gemini Flash
            return await tryGeminiFlashModel(req, res, message, apiKey);
        }

        var geminiData = await geminiResponse.json();
        console.log('✅ Respuesta de Gemini recibida');

        if (geminiData.candidates && geminiData.candidates[0] && geminiData.candidates[0].content) {
            var responseText = geminiData.candidates[0].content.parts[0].text;
            
            console.log('📤 Enviando respuesta al cliente');
            res.json({
                success: true,
                message: responseText,
                model: 'gemini-pro',
                timestamp: new Date().toISOString()
            });
            
        } else {
            console.warn('⚠️ Respuesta inesperada de Gemini');
            res.json({
                success: false,
                error: 'Respuesta inesperada de la API',
                rawResponse: geminiData
            });
        }

    } catch (error) {
        console.error('💥 Error en el servidor:', error);
        res.json({
            success: false,
            error: 'Error: ' + error.message
        });
    }
});

// Función alternativa con modelo más reciente
async function tryGeminiFlashModel(req, res, message, apiKey) {
    try {
        console.log('🔄 Intentando con modelo Gemini Flash...');
        
        var flashResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: message
                    }]
                }]
            })
        });

        console.log('📡 Status de Gemini Flash:', flashResponse.status);

        if (!flashResponse.ok) {
            var errorText = await flashResponse.text();
            console.error('❌ Error con Gemini Flash:', errorText);
            
            // Último intento con Gemini Pro Latest
            return await tryGeminiProLatest(req, res, message, apiKey);
        }

        var flashData = await flashResponse.json();
        
        if (flashData.candidates && flashData.candidates[0] && flashData.candidates[0].content) {
            var responseText = flashData.candidates[0].content.parts[0].text;
            
            res.json({
                success: true,
                message: responseText,
                model: 'gemini-1.5-flash',
                timestamp: new Date().toISOString()
            });
        } else {
            throw new Error('Respuesta inesperada de Gemini Flash');
        }

    } catch (error) {
        console.error('❌ Error con Gemini Flash:', error);
        throw error;
    }
}

// Último intento con la versión más estable
async function tryGeminiProLatest(req, res, message, apiKey) {
    try {
        console.log('🔄 Intentando con modelo Gemini Pro Latest...');
        
        var latestResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: message
                    }]
                }]
            })
        });

        console.log('📡 Status de Gemini Pro Latest:', latestResponse.status);

        if (!latestResponse.ok) {
            var errorText = await latestResponse.text();
            console.error('❌ Error con todos los modelos de Gemini:', errorText);
            
            // Respuesta final de fallback
            return res.json({
                success: false,
                error: 'Error con la API de Gemini. Todos los modelos fallaron.',
                debug: {
                    status: latestResponse.status,
                    message: 'Verifica que tu API key sea válida y tenga permisos'
                }
            });
        }

        var latestData = await latestResponse.json();
        
        if (latestData.candidates && latestData.candidates[0] && latestData.candidates[0].content) {
            var responseText = latestData.candidates[0].content.parts[0].text;
            
            res.json({
                success: true,
                message: responseText,
                model: 'gemini-1.5-pro',
                timestamp: new Date().toISOString()
            });
        } else {
            throw new Error('Respuesta inesperada del modelo latest');
        }

    } catch (error) {
        console.error('❌ Error final con Gemini:', error);
        res.json({
            success: false,
            error: 'Error fatal con la API de Gemini: ' + error.message
        });
    }
}

// Iniciar servidor
app.listen(PORT, function() {
    console.log('🚀 Servidor backend corriendo en puerto ' + PORT);
    console.log('📍 URL: https://chatai-ios9.onrender.com');
});
