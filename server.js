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

// Ruta SIMPLIFICADA del chat - Solo para testing
app.post('/chat', async function(req, res) {
    try {
        console.log('🔍 Chat endpoint llamado');
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

        // PRIMERO: Responder con un mensaje de prueba SIN llamar a Gemini
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
        console.error('❌ Error en /chat:', error);
        res.json({
            success: false,
            error: 'Error: ' + error.message
        });
    }
});

app.listen(PORT, function() {
    console.log('🚀 Servidor backend corriendo en puerto ' + PORT);
    console.log('📍 URL: https://chatai-ios9.onrender.com');
});