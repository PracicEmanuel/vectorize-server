const express = require("express");
var cors = require('cors')
var request = require('request');
var fs = require('fs');

const PORT = process.env.PORT || 3001;

const app = express();

app.use(cors())


app.get("/api", (req, res) => {
  var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  console.log(fullUrl)
  res.json({ message: "Hello from server!" });
});

app.listen(PORT, () => {
console.log(`Server listening on ${PORT}`);
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