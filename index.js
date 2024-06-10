const express = require('express');
const path = require('path');  //must for joining ejs directory with cwd
const mongoose = require('mongoose');
const campground = require('./models/campground');//take from schema and store in campground
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');//used for biolerplate layouts
const { ExpressErrors, wrapAsync } = require('./models/utilities/expresserrors');//for handling errors
const Joi = require('joi');//server side validations
const{campgroundSchema , reviewSchema} = require("./scheme_sever_validations");
const Review = require("./models/review").model("Review");
const passport = require("passport");
const localStrategy = require("passport-local");
mongoose.connect('mongodb://localhost:27017/yelp-camp' , { // default port for mongodb
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

//db name = yelp-camp

const db = mongoose.connection;                  // connecting the database (by default statements in mongoose google page)
db.on("error" , console.error.bind(console , "connection error"));
db.once("open" , ()=>{
    console.log("Database connected!!");
})

const app = express();

app.engine('ejs' , ejsMate); // for adding biolerplates

app.set("view engine" , "ejs");
app.set('views' , path.join(__dirname , 'views'))  // joining it to the mandatory views directory


app.get('/' , (req , res)=>{          // on encountering null in url , redirecting it to default ejs file
    res.render('home');
})

app.get('/makecampground' ,async (req , res)=>{    //on encountering makecampground in url , making a new entry to database
    const camp = new campground({
        title : 'My backyard',
        description : "Cheap camp"
    });
    
    await camp.save();
    res.send(camp);
})


// A new route to retrieve all campgrounds ids , titles and locations
app.get('/totalcampgrounds', async (req, res) => {
    try {
        const allCampgrounds = await campground.find({});
        res.json(allCampgrounds);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
})


//the by default homepage for the campground , will contain all the titles of campgrounds
app.get('/campgrounds' , async(req , res)=>{
    const campgrounds = await campground.find({}); // it will find all the inital seeded campgrounds in the db
    res.render('campgrounds/index' , {campgrounds}) // passing the value of campgrounds to ejs file , to be used in the forloop
})

// for CREATING a new property------------------------------------------------------------------------------------------------------

app.get('/campgrounds/new' , (req , res)=>{
    res.render('campgrounds/new');
})

app.use(express.urlencoded({extended : true})) // it is used to parse the details in the form for new campground to the actual db\

app.use(express.static('public'))

//app.use('public');

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

//for the form in creating a new property , post the added campground by the user in form to the existing ones.
app.post('/campgrounds' , validateMiddleware ,wrapAsync(async(req , res)=>{
    if(!req.body.campground){throw new expressError("Invalid campground data" , 400)}//wrapasync willl catch that error and handle it over to next which furhter would transfer it to the default error handler
    const ch = new campground(req.body.campground);
    await ch.save();
    res.redirect(`/campgrounds/${ch._id}`);

}))
app.get('/campgrounds/:id' ,wrapAsync(async(req , res)=>{
    const cg = await campground.findById(req.params.id).populate('reviews');
    console.log(cg);
    res.render('campgrounds/show' , {cg});
}))

//for editing existing camps--------------------------------------------------------------------------------------------------------
app.get('/campgrounds/:id/edit', wrapAsync(async(req , res)=>{
    const cg = await campground.findById(req.params.id)
    res.render('campgrounds/edit' , {campground : cg});
}))

app.use(methodOverride('_method'));
app.put('/campgrounds/:id' ,validateMiddleware, wrapAsync(async(req ,res)=>{
    const {id} = req.params;
    const cg = await campground.findByIdAndUpdate(id , {...req.body.campground});
    res.redirect(`/campgrounds/${cg._id}`);
}))

//for deleting existing camps--------------------------------------------------------------------------------------------------------
app.delete('/campgrounds/:id' , wrapAsync(async(req , res) =>{
    const {id} = req.params;
    await campground.findByIdAndDelete(id);
    res.redirect('/campgrounds')
}))
//------------------------------------------------CRUD COMPLETED------------------------------------------------------------------------


//-----------------------------for adding reviews----------------------------------------------------------------------------------------

app.post('/campgrounds/:id/reviews' ,validateReview , wrapAsync(async(req , res)=>{
  const camp =await campground.findById(req.params.id);
  const review = new Review(req.body.review);
  camp.reviews.push(review);
  await review.save();
  await camp.save();
  res.redirect(`/campgrounds/${camp._id}`);
}))
//-----------------------------------------for deleting reviews-------------------------------------------------------------------------

app.delete('/campgrounds/:id/reviews/:reviewId' , wrapAsync(async(req , res)=>{
    const { id , reviewId } = req.params;
    await campground.findByIdAndUpdate(id , { $pull :{reviews : reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))
app.all('*', (req, res, next) => {
    next(new ExpressErrors(`Page Not found!! - ${req.url}`, 404));
});


app.listen(3000 , ()=>{
    console.log("Serving on Port 3000");
})


//-------------------------------------------Error Handling--------------------------------------------------------------------------------

app.use((err, req, res, next) => {
    console.error(err.stack);
    const { statuscode = 500, message = "Something went wrong" } = err;
    if (!err.message) err.message = "Oh No, Something went wrong!";
    res.status(statuscode).render('error', { err });
});

