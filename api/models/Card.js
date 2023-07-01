const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CardSchema = new Schema({
    front: {
        type: String,
        required: true
    },
    back: {
        type: String,
        required: true
    },
    deckId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Deck'
    }

})

const Card = mongoose.model("Card", CardSchema);

module.exports = Card;