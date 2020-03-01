/**
 * 
 */

var express = require('express');
var app = express();

app.use(express.static('./')); /* this line tells Express to use the public folder as our static folder from which we can serve static files*/

app.get('/', function (req, res) {
  res.sendFile('index.html!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

