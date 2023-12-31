const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const port = 3000;

// Use the body-parser middleware to parse JSON data
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Handle POST requests on the "/post-data" route
app.post('/modification', (req, res) => {
  // Access the JSON data sent in the request body
  const postData = req.body;
  const url = postData.URL;
  let modified_URL = ''; // Declare the variable here

  axios.head(url, { maxRedirects: 5, validateStatus: null })
    .then(response => {
      modified_URL = response.request._redirectable._currentUrl;
      // Log the received data
      console.log("modified_URL:",modified_URL);
console.log("response",response)
      // Send a JSON response
      res.json({ message: 'POST data received successfully', modified_URL: modified_URL });
    })
    .catch(error => {
      console.error('Error:', error.message);
      // Send a JSON response with an empty modified_URL
      res.json({ message: 'POST data received successfully', modified_URL: modified_URL });
    });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
