const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());

// basic API
app.get('/', (req, res) => {
    res.send('Hello Micro Earning Pro');
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
