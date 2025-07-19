import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'textarea', 'multiple-choice', 'checkbox', 'dropdown', 'email', 'number', 'date'],
    required: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  required: {
    type: Boolean,
    default: false
  },
  options: [{
    id: String,
    text: String
  }],
  placeholder: String,
  description: String
}, { _id: false });

const formSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Form title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  questions: [questionSchema],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  allowMultipleResponses: {
    type: Boolean,
    default: true
  },
  collectEmail: {
    type: Boolean,
    default: false
  },
  settings: {
    backgroundColor: {
      type: String,
      default: '#ffffff'
    },
    headerColor: {
      type: String,
      default: '#1976d2'
    },
    showProgressBar: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
formSchema.index({ creator: 1, createdAt: -1 });
formSchema.index({ isPublished: 1 });

export default mongoose.model('Form', formSchema);
