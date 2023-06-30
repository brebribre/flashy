const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DeckSchema = new Schema({
    name: {
      type: String,
      required: true
    },
    cards: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Card'
      }
    ],
  });

const Deck = mongoose.model("Deck", DeckSchema);

module.exports = Deck;