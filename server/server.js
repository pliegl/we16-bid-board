'use strict';
/* A simple server for fetching, adding, deleting, and upating bid items
  Bid items are stored in a bids.json file
  TODO: HEAD and OPTIONS operations should be implemented */

//Use express as web server
let express = require('express');
let app = express();

//Get the environment, we are currently operating on
let ENVIRONMENT = app.get('env');

//Use body parser for JSON processing in request data
let bodyParser = require('body-parser');
let fs = require('fs');
let path = require('path');
let uuid = require('node-uuid');

//Load the datastore for the bids
const FILEPATH = path.join(__dirname, 'bids.json');
let Datastore = require('./datastore.js');
const ds = new Datastore(FILEPATH, fs, uuid);

const PORT = process.env.PORT || 3000;
const APIPATH = '/b3a/api/v1/';

//Reference static assets and serve them directly
//Currently, only an index.html is used, without any CSS or JS assets
app.use(express.static('static'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Set a global origin policy to allow cross-domain access - development mode only
app.use('/', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With,  Content-Type, Accept");  
  next();
});

const ROUTER = express.Router();

//Operations to be applied on the bids collection
ROUTER.route('/bids')

    //GET /b3a/api/v1/bids
    //Get all stored bid items
    .get(function (req, res) {

      //Callback, invoked after file operation is complete
      let returnBids = function (err, data) {
        //Read failed
        if (err) {
          error(res, 'Unable to access data store on server.');
        } else {

          //Consider empty file content and return empty JSON in this case
          if (data == undefined || data.length == 0) {
            data = ['[]'];
          }

          res.setHeader('Cache-Control', 'no-cache');
          res.json(JSON.parse(data));
        }
      };

      //Access the file and return the bids
      ds.getBids(returnBids);

    })

    //POST /b3a/api/v1/bids
    //Create a new bid item on the server
    .post(function (req, res) {

      //Content-Type must be JSON
      if (!isHeaderSet(req, res)) return;

      //Validate, what the user has submitted
      //req.body is already JSON, thanks to body-parser
      let validationResult = validateRequestObject(req.body);
      if (validationResult) {
        error(res, validationResult);
        return;
      }

      let newItem = getRequestObject(req.body);

      console.log('Received a POST request with: ' + JSON.stringify(newItem, null, 4));
      validationResult = validateRequest(newItem);
      if (validationResult) {
        error(res, validationResult);
        return;
      }

      //Reset the id to a UUID in order to have consistent IDs
      newItem.id = uuid.v4();
      console.log('(Re)setting its id to ' + newItem.id);

      //Callback, invoked after file operation is complete
      //We return the newly inserted item
      let returnBids = function (err, insertedItem) {
        //Read failed
        if (err) {
          error(res, 'Unable to access data store on server.');
        } else {
          res.setHeader('Cache-Control', 'no-cache');
          res.json(insertedItem);
        }
      };

      //Write the bid to the file
      ds.writeBid(newItem, returnBids);
    })

    //PUT /b3a/api/v1/bids
    //Update an existing item on the server
    .put(function (req, res) {

      //We do not support PUT in production, otherwise one could alter entries
      //of other students
      if (isProduction()) {
        error(res, 'PUT operation is not supported in production mode.');
        return;
      }

      //Deal with JSON encoded bodies only
      if (!isHeaderSet(req, res)) return;

      //Validate, what the user has submitted
      //req.body is already JSON, thanks to body-parser
      let validationResult = validateRequestObject(req.body);
      if (validationResult) {
        error(res, validationResult);
        return;
      }

      let newItem = getRequestObject(req.body);

      console.log('Received a PUT request with: ' + JSON.stringify(newItem, null, 4));
      validationResult = validateRequest(newItem);
      if (validationResult) {
        error(res, validationResult);
        return;
      }

      //Callback, invoked after file operation is complete
      let returnBids = function (err, updatedItem) {
        //Read failed
        if (err) {
          error(res, 'Unable to access data store on server.');
        } else {
          res.setHeader('Cache-Control', 'no-cache');
          res.json(updatedItem);
        }
      };

      ds.updateBid(newItem, returnBids);

    });

//Operations, specific to a certain entry
ROUTER.route('/bids/:bid_id')

  //DELETE /b3a/api/v1/bids/:bid_id
  //Delete an existing item on the server
  .delete(function (req, res) {

    //We do not support PUT in production, otherwise one could alter entries
    //of other students
    if (isProduction()) {
      error(res, 'DELETE operation is not supported in production mode.');
      return;
    }

    //Callback for returning the status of the delete operation as JSON message
    let notifyClient = function (err, success) {
      if (err) {
        error(res, err);
      } else if (success) {
        info(res, success);
      }
    };

    ds.deleteBid(req.params.bid_id, notifyClient);

  });

//Register the router
app.use(APIPATH, ROUTER);

//Register a global error handler, to deal with invalid JSON
app.use(function (err, req, res, next) {
  if(err){
   console.log(err);
   res.status(err.status || 500);
   res.json({
      message: err.message,
      error, err
   });
  }
});


app.listen(PORT, function () {
  console.log('B3A app listening on port ' + PORT + ' in ' + ENVIRONMENT + ' mode. Access app under ' + APIPATH);
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
  res.status(400);
  res.json({ message: 'ERROR: ' + s });
}

//Make sure the Content-Type HTTP header is set correctly
function isHeaderSet(req, res) {
  if (!req.is('json')) {
    console.error('Received a request with a non-JSON body.');
    error(res, 'Please submit a request, where the Content-Type HTTP header is set correctly.');
    return false;
  }

  return true;
}

//Validate the request
function validateRequest(newItem) {

  if (newItem.length > 1) {
    return 'You may only submit one entry per request.';
  }

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

/**
* The JSON request may come as object or as array. In the latter case we only
  support single object arrays
*/
function validateRequestObject(obj) {
  //Request with an array
  if (obj instanceof Array) {
    if (obj.length != 1) {
      return 'You may only submit a single object per request.';
    }
  }
}

//Extract the object form the request
function getRequestObject(requestObject) {
  if (requestObject instanceof Array) {
    console.log('Request contains an object array.');
    return requestObject[0];
  } else {
    console.log('Request contains a single object.');
    return requestObject;
  }

}

/**
* Determines if the app is running in production or not
*/
function isProduction() {
  return ENVIRONMENT == 'production';
}
