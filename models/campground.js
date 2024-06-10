const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const campgroundschema = new Schema({
    title : String,
    price : String,
    image : String,
    location : String,
    description : String,

    reviews : [
        {
            type : Schema.Types.ObjectId,
            ref : 'Review'
        }
    ]
});

campgroundschema.post('findOneAndDelete', async (doc) => {
    if (doc) {
        await Review.remove({
            _id: {
                $in: doc.reviews
            }
        });
    }
});
module.exports = mongoose.model('campground' , campgroundschema);