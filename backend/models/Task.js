const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [3, 'Task title must be at least 3 characters long'],
      maxlength: [120, 'Task title cannot exceed 120 characters'],
    },
    desc: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High'],
        message: 'Priority must be Low, Medium, or High',
      },
      default: 'Medium',
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Completed'],
        message: 'Status must be Pending or Completed',
      },
      default: 'Pending',
    },
    date: {
      type: String,
      required: [true, 'Due date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Due date must follow YYYY-MM-DD format'],
    },
  },
  {
    timestamps: true,
  }
);

// Week 5 Optimization: Compound index for fast status filtering & chronological sorting
taskSchema.index({ status: 1, createdAt: -1 });

// Week 5 Optimization: Text index for fast title search queries
taskSchema.index({ title: 'text' });

module.exports = mongoose.model('Task', taskSchema);
