import mongoose from "mongoose";

const ExerciseSchema = mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  description: String,
  duration: Number,
  date: Date,
});

export default mongoose.model("Exercise", ExerciseSchema);
