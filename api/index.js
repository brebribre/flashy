
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use(cors()); // stop cross-origin errors
app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://alvinbryan78:BryanAlvin123@cluster0.lnlrf4e.mongodb.net/flashy?retryWrites=true&w=majority",{
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("Connected to DB"))
    .catch(console.eror)

//initialize the models
const Card = require('./models/Card');
const Deck = require('./models/Deck');

const userSchema = new mongoose.Schema ({
  email: String,
  password: String,
  googleId: String,
  secret: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

//AUTHENTICATION OAUTH GOOGLE 2.0
passport.use(new GoogleStrategy({
  clientID: "445186148995-grerlb6ir809oennp4l502fuj5sijqbk.apps.googleusercontent.com",
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/secrets",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
function(accessToken, refreshToken, profile, cb) {
  console.log(profile);

  User.findOrCreate({ googleId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
));

//create the routes
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

app.post('/card/new/deck/:id', async (req,res)=>{
    // Find the deck by ID
    const deck = await Deck.findById(req.params.id);
    if (!deck) {
      return res.status(404).json({ error: 'Deck not found' });
    }

    const card = new Card({
        front: req.body.front,
        back: req.body.back,
        deckId: req.params.id
    })
    
    deck.cards.push(card);
    card.save();
    deck.save();
    res.json(card);

});

app.post('/deck/:deckId/card/:cardId', async (req, res) => {

    try {
      const { deckId, cardId } = req.params;
  
      // Find the deck by ID
      const deck = await Deck.findById(deckId);
  
      if (!deck) {
        return res.status(404).json({ error: 'Deck not found' });
      }
  
      // Find the card by ID
      const card = await Card.findById(cardId);
  
      if (!card) {
        return res.status(404).json({ error: 'Card not found' });
      }

  
      // Append the card to the deck
      deck.cards.push(card);
      card.deckId = deckId;
  
      // Save the updated deck
      await deck.save();
      await card.save();
  
      return res.status(200).json({ message: 'Card appended to deck successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

app.delete('/deck/:deckId/card/:cardId', async(req, res) => {
    try {
        const { deckId, cardId } = req.params;
    
        // Find the deck by ID
        const deck = await Deck.findById(deckId);
    
        if (!deck) {
          return res.status(404).json({ error: 'Deck not found' });
        }
    
        // Find the card by ID
        const card = await Card.findById(cardId);
    
        if (!card) {
          return res.status(404).json({ error: 'Card not found' });
        }
    
        // Remove the card from the deck's cards array
        deck.cards.pull(card);
    
        // Save the updated deck
        await deck.save();
    
    
        return res.status(200).json({ message: 'Card deleted from deck successfully' });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
      }
})

app.delete('/deck/delete/:id', async(req, res) => {
    const result = await Deck.findByIdAndDelete(req.params.id);

    res.json(result)
})

app.delete('/card/delete/:id', async(req, res) => {
    const result = await Card.findByIdAndDelete(req.params.id);

    res.json(result)
})

// Serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/index.html'));
});

app.listen(3001, () => {
    console.log('Server started on port 3001');
})