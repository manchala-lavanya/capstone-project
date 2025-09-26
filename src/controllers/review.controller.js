const Review = require('../models/review.model');

//Add a review
exports.add = async (req, res) => {
  try {
    const { rating, comment } = req.body; // bookId if required
    const newReview = new Review({
      bookId: req.params.id,
      rating,
      comment,
      userId: req.userId,  // Store the ID of the user who added the review
    });

    const savedReview = await newReview.save();
    res.status(201).json(savedReview);
  } catch (err) {
    //console.error('Error adding review:', err);
    res.status(500).json({ message: 'Error adding review' });
  }
};

//Update a review
exports.updateById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    // Check if the user is the one who added the review or an admin
    if (review.userId.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Only the review author or an admin can edit this review' });
    }
    review.rating = req.body.rating;
    review.comment = req.body.comment;
    const updatedReview = await review.save();
    res.status(200).json(updatedReview);
  } catch (err) {
    //console.error('Error updating review:', err);
    res.status(500).json({ message: 'Error updating review' });
  }
};

//Delete a review
exports.deleteById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    // Check if the user is the one who added the review or an admin
    if (review.userId.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Only the review author or an admin can delete this review' });
    }
    await Review.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (err) {
    //console.error('Error deleting review:', err);
    res.status(500).json({ message: 'Error deleting review' });
  }
};

// Admin delete review
exports.deleteByAdmin = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    await Review.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Review deleted by admin' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting review by admin' });
  }
};

//Get all reviews for a book
exports.getAll = async (req, res) => {
  try {
    const reviews = await Review.find({ bookId: req.params.id });
    res.status(200).json(reviews);
  } catch (err) {
    //console.error('Error fetching reviews:', err);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
};