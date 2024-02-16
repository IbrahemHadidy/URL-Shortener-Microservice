require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const { lookup } = require('dns');
const { promisify } = require('util');
const shortid = require('shortid');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Promisify dns.lookup to use it with async/await
const lookupAsync = promisify(lookup);

/// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// In-memory storage for URL mappings
const urlDatabase = {};

// Endpoint to create short URL
app.post('/api/shorturl', async (req, res) => {
  const { original_url } = req.body;

  // Check if the URL is valid
  try {
    // Verify the submitted URL
    const { hostname } = new URL(original_url);
    await lookupAsync(hostname);

    // Generate short URL
    const short_url = shortid.generate();

    // Store the URL mapping
    urlDatabase[short_url] = original_url;

    // Respond with JSON containing both URLs
    res.json({ original_url, short_url });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'invalid url' });
  }
});

// Endpoint to redirect to original URL
app.get('/api/shorturl/:short_url', (req, res) => {
  const { short_url } = req.params;

  // Check if short URL exists in the database
  if (urlDatabase.hasOwnProperty(short_url)) {
    // Redirect to the original URL
    res.redirect(urlDatabase[short_url]);
  } else {
    // Short URL not found
    res.status(404).json({ error: 'short url not found' });
  }
});


app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
