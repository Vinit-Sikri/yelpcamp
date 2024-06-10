const express = require("express");
const router = express.Router();
const methodOverride = require('method-override');
const { ExpressErrors, wrapAsync } = require('../models/utilities/expresserrors');//for handling errors
const campground = require('../models/campground');//take from schema and store in campground
const{campgroundSchema , reviewSchema} = require("../scheme_sever_validations");


 //validations from the server side----------------------------------------------------------------------------------------------  

 const validateMiddleware = (req , res , next)=>{
    const result = campgroundSchema.validate(req.body);
    if(result.error){
        const msg = error.details.map(el=>el.message).join(',');
        throw new ExpressErrors(result.error.details , 400)
    }
    else{
        next();
    }
}

//the by default homepage for the campground , will contain all the titles of campgrounds
router.get('/' , async(req , res)=>{
    const campgrounds = await campground.find({}); // it will find all the inital seeded campgrounds in the db
    res.render('campgrounds/index' , {campgrounds}) // passing the value of campgrounds to ejs file , to be used in the forloop
})

// for CREATING a new property------------------------------------------------------------------------------------------------------

router.get('/new' , (req , res)=>{
    res.render('campgrounds/new');
})

router.use(express.urlencoded({extended : true})) // it is used to parse the details in the form in object

//for the form in creating a new property , post the added campground by the user in form to the existing ones.
router.post('/' , validateMiddleware ,wrapAsync(async(req , res)=>{
    if(!req.body.campground){throw new expressError("Invalid campground data" , 400)}//wrapasync willl catch that error and handle it over to next which furhter would transfer it to the default error handler
    const ch = new campground(req.body.campground);
    await ch.save();
    res.redirect(`/campgrounds/${ch._id}`);

}))
//----------------------------------------for showing the campgrounds---------------------------------------------------------------------
router.get('/:id' ,wrapAsync(async(req , res)=>{
    const cg = await campground.findById(req.params.id).populate('reviews');
    console.log(cg);
    res.render('campgrounds/show' , {cg});
}))

//for editing existing camps--------------------------------------------------------------------------------------------------------
router.get('/:id/edit', wrapAsync(async(req , res)=>{
    const cg = await campground.findById(req.params.id)
    res.render('campgrounds/edit' , {campground : cg});
}))

router.use(methodOverride('_method'));
router.put('/:id' ,validateMiddleware, wrapAsync(async(req ,res)=>{
    const {id} = req.params;
    const cg = await campground.findByIdAndUpdate(id , {...req.body.campground});
    res.redirect(`/campgrounds/${cg._id}`);
}))

//for deleting existing camps--------------------------------------------------------------------------------------------------------
router.delete('/:id' , wrapAsync(async(req , res) =>{
    const {id} = req.params;
    await campground.findByIdAndDelete(id);
    res.redirect('/campgrounds')
}))
//------------------------------------------------CRUD COMPLETED------------------------------------------------------------------------

module.exports = router;