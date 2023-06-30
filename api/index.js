const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); // stop cross-origin errors

mongoose.connect("mongodb+srv://alvinbryan78:BryanAlvin123@cluster0.lnlrf4e.mongodb.net/flashy?retryWrites=true&w=majority",{
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("Connected to DB"))
    .catch(console.eror)

const Card = require('./models/Card');
const Deck = require('./models/Deck');

app.get('/decks', async(req,res)=>{
    const decks = await Deck.find();

    res.json(decks);
});

app.get('/cards', async(req,res)=>{
    const cards = await Card.find();

    res.json(cards);
});

app.post('/deck/new', (req,res)=>{
    const deck = new Deck({
        name: req.body.name,
        cards: req.body.cards
    })

    deck.save();

    res.json(deck);
});

app.post('/card/new', (req,res)=>{
    const card = new Card({
        front: req.body.front,
        back: req.body.back
    })

    card.save();

    res.json(card);
});


app.delete('/card/delete/:id', async(req, res) => {
    const result = await Card.findByIdAndDelete(req.params.id);

    res.json(result)
})



app.listen(3000, () => {
    console.log('Server started on port 3000');
})