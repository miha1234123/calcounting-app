const express = require('express');
const OpenAI = require('openai');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Analyze food from photo
router.post('/analyze-food', auth, upload.single('foodPhoto'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image provided' });
    }

    const imageBuffer = req.file.buffer;
    const base64Image = imageBuffer.toString('base64');

    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this food image and provide detailed nutritional information. Return a JSON response with the following structure:
              {
                "foods": [
                  {
                    "name": "food name",
                    "estimatedWeight": "weight in grams",
                    "confidence": "confidence level 0-100",
                    "nutrition": {
                      "calories": number,
                      "protein": number,
                      "carbs": number,
                      "fat": number,
                      "fiber": number,
                      "sugar": number
                    }
                  }
                ],
                "totalCalories": number,
                "notes": "any additional observations"
              }`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    });

    const analysis = JSON.parse(response.choices[0].message.content);
    
    res.json({
      success: true,
      analysis,
      photoPath: req.file.path
    });
  } catch (error) {
    console.error('AI Analysis Error:', error);
    res.status(500).json({ 
      message: 'Error analyzing food image', 
      error: error.message 
    });
  }
});

// Analyze body photo for progress tracking
router.post('/analyze-body', auth, upload.single('bodyPhoto'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image provided' });
    }

    const imageBuffer = req.file.buffer;
    const base64Image = imageBuffer.toString('base64');

    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this body photo for fitness progress tracking. Provide estimates for body composition and visible changes. Return JSON:
              {
                "analysis": {
                  "estimatedBodyFat": "percentage estimate",
                  "muscleDefinition": "low/medium/high",
                  "posture": "assessment",
                  "visibleChanges": "description of any notable features",
                  "recommendations": "brief fitness/health recommendations"
                },
                "confidence": "confidence level 0-100",
                "notes": "additional observations"
              }`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 800
    });

    const analysis = JSON.parse(response.choices[0].message.content);
    
    // Save body photo to user's progress
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.userId, {
      $push: {
        bodyPhotos: {
          photo: req.file.path,
          analysis: analysis.analysis
        }
      }
    });

    res.json({
      success: true,
      analysis,
      photoPath: req.file.path
    });
  } catch (error) {
    console.error('Body Analysis Error:', error);
    res.status(500).json({ 
      message: 'Error analyzing body photo', 
      error: error.message 
    });
  }
});

module.exports = router;
