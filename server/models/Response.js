import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true
  },
  answer: mongoose.Schema.Types.Mixed // Can be string, array, number, etc.
}, { _id: false });

const responseSchema = new mongoose.Schema({
  form: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form',
    required: true
  },
  answers: [answerSchema],
  respondentEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  respondentName: {
    type: String,
    trim: true
  },
  ipAddress: String,
  userAgent: String,
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
responseSchema.index({ form: 1, submittedAt: -1 });
responseSchema.index({ respondentEmail: 1 });

export default mongoose.model('Response', responseSchema);
