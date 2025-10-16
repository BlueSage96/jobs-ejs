const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema(
  {
    // edit player records
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide a user"],
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard", "Extreme"],
      default: "Easy",
      index: true,
    },
    mistakes: {
      type: Number,
      default: 0,
      min: 0,
    },
    usedHints: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Not started", "In progress", "Completed", "Restarted"],
      default: "In progress",
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model('Game', GameSchema);