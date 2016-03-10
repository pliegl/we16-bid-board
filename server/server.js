/* A simple server for fetching, adding, deleting, and upating bid items
  Bid items are stored in a bids.json file
  TODO: HEAD and OPTIONS operations should be implemented */

'use strict';

//Use express as web server
let express = require('express');
let app = express();

//Use body parser for JSON processing in request data
let bodyParser = require('body-parser');
let fs = require('fs');
let path = require('path');
let uuid = require('node-uuid');

const FILEPATH = path.join(__dirname, 'bids.json');
const PORT = process.env.PORT || 3000;
const APIPATH = '/b3a/api/v1/';

//Reference static assets and serve them directly
//Currently, only an index.html is used, without any CSS or JS assets
app.use(express.static('static'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const ROUTER = express.Router();

//Operations to be applied on the bids collection
ROUTER.route('/bids')

    //GET /b3a/api/v1/bids
    //Get all stored bid items
    .get(function (req, res) {
      fs.readFile(FILEPATH, (err, data) => {
        if (err) {
          console.error('Unable to get bid items from file ' + err);
        }

        res.setHeader('Cache-Control', 'no-cache');
        res.json(JSON.parse(data));
      });
    })

    //POST /b3a/api/v1/bids
    //Create a new bid item on the server
    .post(function (req, res) {

      //Deal with JSON encoded bodies only
      if (!isHeaderSet(req, res)) return;

      //Validate, what the user has submitted
      //req.body is already JSON, thanks to body-parser
      let newItem = req.body;
      console.log('Received a POST request with: ' + JSON.stringify(newItem, null, 4));
      let validationResult = validateRequest(newItem);
      if (validationResult) {
        error(res, validationResult);
        return;
      }

      //Reset the id to a UUID in order to have consistent IDs
      newItem.id = uuid.v4();
      console.log('(Re)setting its id to ' + newItem.id);

      //All good - continue writing the received JSON
      fs.readFile(FILEPATH, function (err, data) {
        if (err) {
          console.error('Unable to get bid items from file ' + err);
        }

        //Get the items from the file
        let bidItems = JSON.parse(data);

        //Store then new item
        bidItems.push(newItem);

        //Write the items back to the file and return the updated store to the client
        fs.writeFile(FILEPATH, JSON.stringify(bidItems, null, 4), function (err) {
          if (err) {
            console.error('Unable to write items to file ' + err);
          }

          res.setHeader('Cache-Control', 'no-cache');
          res.json(bidItems);
        });

      });
    })

    //PUT /b3a/api/v1/bids
    //Update an existing item on the server
    .put(function (req, res) {

      //Deal with JSON encoded bodies only
      if (!isHeaderSet(req, res)) return;

      //Validate, what the user has submitted
      //req.body is already JSON, thanks to body-parser
      let newItem = req.body;
      console.log('Received a PUT request with: ' + JSON.stringify(newItem, null, 4));
      let validationResult = validateRequest(newItem);
      if (validationResult) {
        error(res, validationResult);
        return;
      }

      fs.readFile(FILEPATH, function (err, data) {
        if (err) {
          console.error('Unable to get bid items from file ' + err);
        }

        //Get the items from the file
        let bidItems = JSON.parse(data);

        //Search for the bid item based on the ID and replace it, in case it
        //is found
        let found = false;
        for (let i = 0; i < bidItems.length; i++) {
          if (bidItems[i].id === newItem.id) {
            bidItems[i] = newItem;
            found = true;
            console.log('Found an entry for the given bid item. Replacing it.');
            break;
          }
        }

        //In case we were unable to find the respective bid item, we simply
        //store it as new new one
        if (!found) {
          console.log('Found no entry for the given bid item. Storing a new entry.');

          //Reset the id to a UUID in order to have consistent IDs
          newItem.id = uuid.v4();
          console.log('(Re)setting its id to ' + newItem.id);
          bidItems.push(newItem);
        }

        //Write the items back to the file and return the updated store to the client
        fs.writeFile(FILEPATH, JSON.stringify(bidItems, null, 4), function (err) {
          if (err) {
            console.error('Unable to write items to file ' + err);
          }

          res.setHeader('Cache-Control', 'no-cache');
          res.json(bidItems);
        });

      });
    });

//Operations, specific of a certain entry
ROUTER.route('/bids/:bid_id')

  //DELETE /b3a/api/v1/bids/:bid_id
  //Delete an existing item on the server
  .delete(function (req, res) {

    fs.readFile(FILEPATH, function (err, data) {
      if (err) {
        console.error('Unable to get bid items from file ' + err);
      }

      //Get the items from the file
      let bidItems = JSON.parse(data);
      console.log('Received a DELETE with the following id ' + req.params.bid_id);

      //Simply filter out the item to be deleted
      let updatedbidItems = bidItems.filter((entry) => {return entry.id != req.params.bid_id});


      //Write the filtered items back to the file
      fs.writeFile(FILEPATH, JSON.stringify(updatedbidItems, null, 4), function (err) {
        if (err) {
          console.error('Unable to write items to file ' + err);
        }

        //Report a simple message back, wrapped in a JSON object
        if (bidItems.length == updatedbidItems.length) {
          error(res, 'Could not find bid item with id' + req.params.bid_id);
        } else {
          info(res, 'Successfully deleted bid item with id' + req.params.bid_id);
        }

      });

    });

  });

//Register the router
app.use(APIPATH, ROUTER);

app.listen(PORT, function () {
  console.log('B3A app listening on port ' + PORT + ' Access app under ' + APIPATH);
});

////////////////
//Helper methods
////////////////

//Write an INFO message back, wrapped in a JSON
function info(res, s) {
  res.json({ message: 'INFO: ' + s });
}

//Write an ERROR message back, wrapped in a JSON
function error(res, s) {
  res.json({ message: 'ERROR: ' + s });
}

//Make sure the Content-Type HTTP header is set correctly
function isHeaderSet(req, res) {
  if (!req.is('json')) {
    console.error('Received a POST request with a non-JSON body.');
    error(res, 'Please submit a POST request, where the Content-Type HTTP header is set correctly.');
    return false;
  }

  return true;
}

//Validate the request
function validateRequest(newItem) {

  if (!newItem.name) {
    return 'You must provide a name.';
  }

  if (!newItem.product) {
    return 'You must provide a product';
  }

  if (!newItem.price) {
    return 'You must provide a price';
  }

  return null;
}
