require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/public', express.static(`${process.cwd()}/public`));

// Array to store URL mappings
const urlMappings = [];

// Routes
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// URL shortening endpoint
app.post('/api/shorturl', function(req, res) {
  const { url } = req.body;

  // Validate URL format
  const urlRegex = /^(http|https):\/\/[^ "]+$/;
  if (!urlRegex.test(url)) {
    return res.json({ error: 'invalid url' });
  }

  // Validate URL using dns.lookup
  const urlObject = new URL(url);
  dns.lookup(urlObject.hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    } else {
      // Generate short URL
      const shortUrl = Math.floor(Math.random() * 100000).toString();
      
      // Store URL mapping in array
      urlMappings.push({ original_url: url, short_url: shortUrl });

      res.json({
        original_url: url,
        short_url: shortUrl
      });
    }
  });
});

// Redirect to original URL
app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = req.params.short_url;
  const urlMapping = urlMappings.find(mapping => mapping.short_url === shortUrl);
  if (urlMapping) {
    res.redirect(urlMapping.original_url);
  } else {
    res.json({ error: 'short url not found' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
