import express from 'express';
import { body, validationResult } from 'express-validator';
import Form from '../models/Form.js';
import Response from '../models/Response.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/forms
// @desc    Get all forms for authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const forms = await Form.find({ creator: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('creator', 'name email');

    const total = await Form.countDocuments({ creator: req.user.id });

    // Get response counts for each form
    const formsWithStats = await Promise.all(
      forms.map(async (form) => {
        const responseCount = await Response.countDocuments({ form: form._id });
        return {
          ...form.toObject(),
          responseCount
        };
      })
    );

    res.json({
      success: true,
      forms: formsWithStats,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/forms/:id
// @desc    Get form by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const form = await Form.findOne({
      _id: req.params.id,
      creator: req.user.id
    }).populate('creator', 'name email');

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    const responseCount = await Response.countDocuments({ form: form._id });

    res.json({ 
      success: true, 
      form: {
        ...form.toObject(),
        responseCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/forms/public/:id
// @desc    Get published form for public access
// @access  Public
router.get('/public/:id', async (req, res) => {
  try {
    const form = await Form.findOne({
      _id: req.params.id,
      isPublished: true
    }).populate('creator', 'name');

    if (!form) {
      return res.status(404).json({ message: 'Form not found or not published' });
    }

    res.json({ success: true, form });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/forms
// @desc    Create new form
// @access  Private
router.post('/', [
  auth,
  body('title').trim().isLength({ min: 1 }).withMessage('Form title is required'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description cannot be more than 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const formData = {
      ...req.body,
      creator: req.user.id,
      questions: req.body.questions || []
    };

    const form = new Form(formData);
    await form.save();
    await form.populate('creator', 'name email');

    res.status(201).json({ success: true, form });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/forms/:id
// @desc    Update form
// @access  Private
router.put('/:id', [
  auth,
  body('title').optional().trim().isLength({ min: 1 }).withMessage('Form title cannot be empty'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description cannot be more than 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const form = await Form.findOneAndUpdate(
      { _id: req.params.id, creator: req.user.id },
      req.body,
      { new: true, runValidators: true }
    ).populate('creator', 'name email');

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    res.json({ success: true, form });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/forms/:id
// @desc    Delete form
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const form = await Form.findOneAndDelete({
      _id: req.params.id,
      creator: req.user.id
    });

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Also delete all responses for this form
    await Response.deleteMany({ form: req.params.id });

    res.json({ success: true, message: 'Form deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PATCH /api/forms/:id/publish
// @desc    Toggle form publish status
// @access  Private
router.patch('/:id/publish', auth, async (req, res) => {
  try {
    const form = await Form.findOne({
      _id: req.params.id,
      creator: req.user.id
    });

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    form.isPublished = !form.isPublished;
    await form.save();
    await form.populate('creator', 'name email');

    res.json({ success: true, form });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/forms/:id/responses
// @desc    Submit form response
// @access  Public
router.post('/:id/responses', [
  body('answers').isArray().withMessage('Answers must be an array'),
  body('respondentEmail').optional().isEmail().withMessage('Please enter a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const form = await Form.findOne({
      _id: req.params.id,
      isPublished: true
    });

    if (!form) {
      return res.status(404).json({ message: 'Form not found or not published' });
    }

    // Check if multiple responses are allowed
    if (!form.allowMultipleResponses && req.body.respondentEmail) {
      const existingResponse = await Response.findOne({
        form: req.params.id,
        respondentEmail: req.body.respondentEmail
      });

      if (existingResponse) {
        return res.status(400).json({ message: 'You have already submitted a response to this form' });
      }
    }

    const responseData = {
      form: req.params.id,
      answers: req.body.answers,
      respondentEmail: req.body.respondentEmail,
      respondentName: req.body.respondentName,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };

    const response = new Response(responseData);
    await response.save();

    res.status(201).json({ success: true, message: 'Response submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/forms/:id/responses
// @desc    Get form responses
// @access  Private
router.get('/:id/responses', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    // Verify form ownership
    const form = await Form.findOne({
      _id: req.params.id,
      creator: req.user.id
    });

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    const responses = await Response.find({ form: req.params.id })
      .sort({ submittedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Response.countDocuments({ form: req.params.id });

    res.json({
      success: true,
      responses,
      form: {
        title: form.title,
        questions: form.questions
      },
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
