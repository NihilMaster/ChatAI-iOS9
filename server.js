// server.js - Backend compatible con iOS 9
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware muy simple para máxima compatibilidad
app.use(express.json({ limit: '10mb' }));
app.use(cors({
    origin: '*',
    methods: ['POST', 'GET'],
    allowedHeaders: ['Content-Type', 'Accept']
}));

// Headers compatibles con iOS 9
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'POST, GET');
    next();
});

// Ruta de prueba de salud
app.get('/', function(req, res) {
    res.json({ 
        status: 'OK', 
        message: 'Backend para iOS 9 funcionando',
        compatible: true,
        timestamp: new Date().toISOString()
    });
});

// Ruta de prueba específica para iOS 9
app.get('/test', function(req, res) {
    res.json({ 
        success: true,
        message: 'Conexión exitosa desde iOS 9',
        test: 'Este es un mensaje de prueba'
    });
});

// Ruta principal del chat - Gemini API
app.post('/chat', async function(req, res) {
    try {
        var message = req.body.message;
        var apiKey = req.body.apiKey;

        console.log('Mensaje recibido:', message);

        if (!message || !apiKey) {
            return res.json({
                success: false,
                error: 'Faltan message o apiKey en la solicitud'
            });
        }

        // Integración con Google Gemini API
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
                }]
            })
        });

        if (!geminiResponse.ok) {
            var errorText = await geminiResponse.text();
            console.error('Error de Gemini:', errorText);
            return res.json({
                success: false,
                error: 'Error en la API de Gemini: ' + geminiResponse.status
            });
        }

        var geminiData = await geminiResponse.json();

        if (geminiData.candidates && geminiData.candidates[0] && geminiData.candidates[0].content) {
            var responseText = geminiData.candidates[0].content.parts[0].text;
            
            res.json({
                success: true,
                message: responseText,
                timestamp: new Date().toISOString()
            });
        } else {
            res.json({
                success: false,
                error: 'Respuesta inesperada de Gemini API',
                rawResponse: geminiData
            });
        }

    } catch (error) {
        console.error('Error en el servidor:', error);
        res.json({
            success: false,
            error: 'Error interno del servidor: ' + error.message
        });
    }
});

// Ruta alternativa para DeepSeek API
app.post('/chat-deepseek', async function(req, res) {
    try {
        var message = req.body.message;
        var apiKey = req.body.apiKey;

        if (!message || !apiKey) {
            return res.json({
                success: false,
                error: 'Faltan message o apiKey'
            });
        }

        // Integración con DeepSeek API
        var deepseekResponse = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + apiKey
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [{ role: "user", content: message }],
                stream: false
            })
        });

        if (!deepseekResponse.ok) {
            return res.json({
                success: false,
                error: 'Error en DeepSeek API: ' + deepseekResponse.status
            });
        }

        var deepseekData = await deepseekResponse.json();

        if (deepseekData.choices && deepseekData.choices[0]) {
            res.json({
                success: true,
                message: deepseekData.choices[0].message.content,
                timestamp: new Date().toISOString()
            });
        } else {
            res.json({
                success: false,
                error: 'Respuesta inesperada de DeepSeek'
            });
        }

    } catch (error) {
        res.json({
            success: false,
            error: 'Error con DeepSeek: ' + error.message
        });
    }
});

app.listen(PORT, function() {
    console.log('Servidor backend corriendo en puerto ' + PORT);
    console.log('URL local: http://localhost:' + PORT);
});