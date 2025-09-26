// server.js - Parser que MANTIENE markdown para iOS 9
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors({ origin: '*' }));

// Headers CORS
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    next();
});

app.options('*', function (req, res) {
    res.sendStatus(200);
});

// Ruta principal del chat - Markdown ORIGINAL
app.post('/chat', async function (req, res) {
    try {
        var message = req.body.message;
        var apiKey = req.body.apiKey;

        if (!message || !apiKey) {
            return res.json({
                success: false,
                error: 'Faltan message o apiKey',
            });
        }

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
                                    text: "Por favor, formatea tu respuesta usando markdown simple:\n" + 
                                          "# para títulos principales\n" +
                                          "## para subtítulos\n" + 
                                          "### para secciones\n" +
                                          "- para listas con **negritas**\n" +
                                          "Y líneas --- para separadores\n\n" +
                                          "Pregunta: " + message
                                },
                            ],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 2000,
                    }
                }),
            }
        );

        if (!geminiResponse.ok) {
            var errorText = await geminiResponse.text();
            return res.json({
                success: false,
                error: 'Error en la API de Gemini: ' + geminiResponse.status,
            });
        }

        var geminiData = await geminiResponse.json();

        if (geminiData.candidates && geminiData.candidates[0] && geminiData.candidates[0].content) {
            var rawResponse = geminiData.candidates[0].content.parts[0].text;
            
            // LIMPIAR SOLO lo necesario, mantener markdown
            var cleanedResponse = cleanResponse(rawResponse);
            
            res.json({
                success: true,
                message: cleanedResponse,
                timestamp: new Date().toISOString(),
            });
        } else {
            res.json({
                success: false,
                error: 'Respuesta inesperada de la API',
            });
        }
    } catch (error) {
        res.json({
            success: false,
            error: 'Error interno: ' + error.message,
        });
    }
});

// LIMPIADOR mínimo - Solo asegurar compatibilidad
function cleanResponse(text) {
    if (!text) return '';
    
    var result = text;
    
    // 1. Solo limpiar HTML entities básicas
    result = result.replace(/&amp;/g, '&')
                  .replace(/&lt;/g, '<')
                  .replace(/&gt;/g, '>')
                  .replace(/&quot;/g, '"')
                  .replace(/&#39;/g, "'");
    
    // 2. Normalizar saltos de línea (importante para iOS 9)
    result = result.replace(/\r\n/g, '\n');
    result = result.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    return result;
}

app.get('/test', function (req, res) {
    res.json({
        success: true,
        message: '# Título de Prueba\n\nEste es un **texto en negrita** y _cursiva_.\n\n## Subtítulo\n\n- Item 1\n- Item 2\n\n---\n\nFin del mensaje.',
    });
});

app.listen(PORT, function () {
    console.log('🚀 Servidor backend corriendo - Markdown original');
});