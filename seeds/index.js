
//--------------------THIS FILE DELETES ALL THE EXISTING ENTITIES IN THE DATABASE AND SEEDS IT WITH NEW RANDOM ITEMS-----------------------------


const path = require('path');
const mongoose = require('mongoose');
const campground = require('../models/campground');
const cities = require("./cities");
const {places , descriptors} = require("./seedhelpers");

mongoose.connect('mongodb://localhost:27017/yelp-camp');



const db = mongoose.connection;                  // connecting the database(by default statements in mongoose)
db.on("error" , console.error.bind(console , "connection error"));
db.once("open" , ()=>{
    console.log("Database connected!!");
})


const sample = array => array[Math.floor(Math.random() * array.length)];
const seeddb = async () => {
    await campground.deleteMany({});
    for(let i = 0 ; i < 5 ; i++){
     const random1000 = Math.floor(Math.random() * 1000);
     const pricerand = Math.floor(Math.random()*1000000 +1);
     const camp = new campground({
        location : `${cities[random1000].city} , ${cities[random1000].state}`,
        title : `${sample(descriptors)} , ${sample(places)}`,
        image : "https://source.unsplash.com/collection/483251",
        description : "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Itaque modi dolorum autem dolor quam quibusdam excepturi eius esse atque, nobis, consequuntur sed. Architecto, omnis ad illum id repudiandae fugit autem?",
        price :`INR ${pricerand}`
     });
     await camp.save();
    }
    console.log("Seed data inserted successfully!");
}

seeddb().then(()=>{
mongoose.connection.close();
})

