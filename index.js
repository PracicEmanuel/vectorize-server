const dotenv = require('dotenv').config();
const express = require('express');
const cors = require("cors")
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const port = 3000;
const request = require("request");
const path = require('path');

const fsExtra = require('fs-extra');


app.use(cors())
// Middleware to parse JSON bodies
app.use(bodyParser.json({ limit: '100mb' }));

const extractSVGDetails = (svgContent) => {
  const svgMatch = svgContent.match(/<svg[^>]*>/);
  const innerContentMatch = svgContent.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
  
  const attributes = {};
  if (svgMatch) {
    const attrString = svgMatch[0].replace('<svg', '').replace('>', '');
    attrString.split(/\s+/).forEach(attr => {
      const [name, value] = attr.split('=');
      if (name && value) {
        attributes[name] = value.replace(/"/g, '');
      }
    });
  }

  return {
    innerContent: innerContentMatch ? innerContentMatch[1] : '',
    attributes: attributes
  };
};

const combineSVGFiles = async (inputFiles, outputFile) => {
  let combinedContent = '<svg xmlns="http://www.w3.org/2000/svg"';

  const firstSVGPath = path.join(__dirname, inputFiles[0]);
  const firstSVGContent = await fsExtra.readFile(firstSVGPath, 'utf8');
  const firstSVGDetails = extractSVGDetails(firstSVGContent);

  // Set the width and height of the combined SVG based on the first SVG
  /*const { width, height } = firstSVGDetails.attributes;
  if (width) combinedContent += ` width="${width}"`;
  if (height) combinedContent += ` height="${height}"`;*/

  combinedContent += '>';

  for (let i = 0; i < inputFiles.length; i++) {
    const filePath = path.join(__dirname, inputFiles[i]);
    const svgContent = await fsExtra.readFile(filePath, 'utf8');
    let { innerContent } = extractSVGDetails(svgContent);

    if (i === 1) { // Apply opacity to the second SVG file
      innerContent = `<g opacity="0.3">${innerContent}</g>`;
    }

    combinedContent += innerContent;
  }

  combinedContent += '</svg>';
  await fsExtra.writeFile(outputFile, combinedContent, 'utf8');
  console.log(`Combined SVG saved to ${outputFile}`);
};


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
        /*const inputFiles = ['result.svg', 'Artboard 1.svg'];
        const outputFile = path.join(__dirname, 'combined.svg');

        combineSVGFiles(inputFiles, outputFile).catch(console.error);*/
        res.sendFile(path.join(__dirname, "result.svg"), (err)=>{
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