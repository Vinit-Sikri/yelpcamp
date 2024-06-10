const express = require('express');
const router = express.Router();
const methodOverride = require('method-override');
const reviewSchema = require("../scheme_sever_validations");
const Review = require("../models/review").model("Review");
const campground = require('../models/campground');//take from schema and store in campground
const { ExpressErrors, wrapAsync } = require('../models/utilities/expresserrors');//for handling errors




const validateReview = (req , res , next)=>{
    const result = reviewSchema.validate(req.body);
    if(result.error){
        const msg = error.details.map(el=>el.message).join(',');
        throw new ExpressErrors(result.error.details , 400);
    }

    else{
        next();
    }
}


//-----------------------------for adding reviews----------------------------------------------------------------------------------------

router.post('/' ,validateReview , wrapAsync(async(req , res)=>{
    const camp =await campground.findById(req.params.id);
    const review = new Review(req.body.review);
    camp.reviews.push(review);
    await review.save();
    await camp.save();
    res.redirect(`/campgrounds/${camp._id}`);
  }))
  //-----------------------------------------for deleting reviews-------------------------------------------------------------------------
  
  router.delete('/:reviewId' , wrapAsync(async(req , res)=>{
      const { id , reviewId } = req.params;
      await campground.findByIdAndUpdate(id , { $pull :{reviews : reviewId}});
      await Review.findByIdAndDelete(reviewId);
      res.redirect(`/campgrounds/${id}`);
  }))

  module.exports = router;