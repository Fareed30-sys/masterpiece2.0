import mongoose from 'mongoose';

const knowledgeItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Billing', 'Technical Issue', 'Feature Request', 'Shipping/Delivery', 'Account', 'General'],
      default: 'General',
    },
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    tags: [String],
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const KnowledgeItem = mongoose.model('KnowledgeItem', knowledgeItemSchema);
export default KnowledgeItem;
