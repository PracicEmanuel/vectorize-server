const dotenv = require('dotenv').config();
const express = require('express');
const cors = require("cors")
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const port = 3000;
const request = require("request");
const path = require('path');


app.use(cors())
// Middleware to parse JSON bodies
app.use(bodyParser.json({ limit: '100mb' }));

// Route to handle canvas image data
app.post('/upload', (req, res) => {
  const imageData = req.body.image;

  // Validate if image data exists
  if (!imageData) {
    res.status(400).send('No image data provided');
    return;
  }

  // Remove the data URL prefix to get the base64-encoded string
  const base64Data = imageData.replace(/^data:image\/png;base64,/, '');

  // Save the image to a file
  fs.writeFile('uploaded_image.png', base64Data, 'base64', (err) => {
    if (err) {
      console.error('Error saving image:', err);
      res.status(500).send('Error saving image');
      return;
    }
    request.post({
      url: 'https://vectorizer.ai/api/v1/vectorize?mode=test',
      formData: {
        image: fs.createReadStream('uploaded_image.png'), // TODO: Replace with your image
      },
      auth: {user: process.env.API_USER , pass: process.env.API_KEY},
      followAllRedirects: true,
      encoding: null
    }, function(error, response, body) {
      if (error) {
        console.error('Request failed:', error);
      } else if (!response || response.statusCode != 200) {
        console.error('Error:', response && response.statusCode, body.toString('utf8'));
      } else {
        console.log(body)
        fs.writeFileSync("result.svg", body);
        res.sendFile("/home/arlemar/Documents/CelThreeJS/vectorize-server/result.svg", (err)=>{
          if(err){
            console.error('Error sending file:', err);
            res.status(500).send('Error sending file');
          }else {
            console.log('File sent successfully');
          }
        })
      }
    });
    
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});



/*request.post({
  url: 'https://vectorizer.ai/api/v1/vectorize?mode=test',
  formData: {
    image: fs.createReadStream('example.png'), // TODO: Replace with your image
  },
  auth: {user: 'vkebxhss888lyic', pass: 'bk564pnfnulupvt5g1r4uton6ec0t97nbunr1jor87l4rmkmq88g'},
  followAllRedirects: true,
  encoding: null
}, function(error, response, body) {
  if (error) {
    console.error('Request failed:', error);
  } else if (!response || response.statusCode != 200) {
    console.error('Error:', response && response.statusCode, body.toString('utf8'));
  } else {
    console.log(body)
    fs.writeFileSync("result.svg", body);
  }
});*/