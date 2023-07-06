const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;


mongoose.connect('mongodb+srv://ashishnickprivate:Spjv345hQLwxXd4p@cluster0.2zyozye.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});


const foodProductSchema = new mongoose.Schema({
    name: String,
    nutrients: {
        calories: Number,
        protein: Number,
        fat: Number,
        carbohydrates: Number,
        fiber: Number,
    },
});

const FoodProduct = mongoose.model('FoodProduct', foodProductSchema);

app.get('/scrape', async (req, res) => {
    try {
        const response = await axios.get('https://edamam-food-and-grocery-database.p.rapidapi.com/api/food-database/v2/parser', {
            params: {
                'nutrition-type': 'cooking',
                'category[0]': 'generic-foods',
                'health[0]': 'alcohol-free'
            },
            headers: {
                'X-RapidAPI-Key': '7dbd870b71msh1ef677cd7d23e86p144557jsn5416637ad1c2',
                'X-RapidAPI-Host': 'edamam-food-and-grocery-database.p.rapidapi.com'
            }
        });

        const foods = response.data.hints;


        for (const food of foods) {
            const { label, nutrients } = food.food;


            const newFoodProduct = new FoodProduct({
                name: label,
                nutrients: {
                    calories: nutrients.ENERC_KCAL,
                    protein: nutrients.PROCNT,
                    fat: nutrients.FAT,
                    carbohydrates: nutrients.CHOCDF,
                    fiber: nutrients.FIBTG,
                },
            });

            await newFoodProduct.save();
        }

        res.send('Data scraped and saved successfully!');
    } catch (error) {
        console.error(error.response.data);
        console.error(error);
        res.status(500).send('An error occurred while scraping and saving the data.');
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
