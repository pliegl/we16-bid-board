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
let validate = require('isvalid').validate;

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

  //If the request is an array, unwrap it and only take the first object
  if (req.body instanceof Array) {
    console.log('Request contains an object array.');
    req.body = req.body[0];
  }
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
    //Enforce a fine grained validation with the requestValidator() here
    .post(requestValidator(false), function (req, res) {

      //Content-Type must be JSON
      if (!isHeaderSet(req, res)) return;

      let newItem = req.body;

      console.log('Received a POST request with: ' + JSON.stringify(newItem, null, 4));

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
    .put(requestValidator(true), function (req, res) {

      //We do not support PUT in production, otherwise one could alter entries
      //of other students
      if (isProduction()) {
        error(res, 'PUT operation is not supported in production mode.');
        return;
      }

      //Deal with JSON encoded bodies only
      if (!isHeaderSet(req, res)) return;

      let newItem = req.body;

      console.log('Received a PUT request with: ' + JSON.stringify(newItem, null, 4));

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

    })

    //DELETE /b3a/api/v1/bids
    //Delete all bid items on the server
    .delete(function (req, res) {

      //We do not support DELETE in production, otherwise one could wipe all entries
      if (isProduction()) {
        error(res, 'DELETE operation is not supported in production mode.');
        return;
      }

      //Deal with JSON encoded bodies only
      if (!isHeaderSet(req, res)) return;

      console.log('Received DELETE request - wiping all entries');

      //Callback for returning the status of the delete operation as JSON message
      let notifyClient = function (err, success) {
        if (err) {
          error(res, err);
        } else if (success) {
          info(res, success);
        }
      };

      ds.deleteBids(notifyClient);


    });


//Operations, specific to a certain entry
ROUTER.route('/bids/:bid_id')

  //GET /b3a/api/v1/bids/:bid_id
  //Return a specific bid item
  .get(function (req, res) {

    console.log('Received GET request for resource ' + req.params.bid_id);

    //Callback, invoked after file operation is complete
    //We return the item in case it have been found or an error otherwise
    let returnBid = function (err, foundItem) {
      //Read failed
      if (err) {
        error(res, err);
      } else {
        res.setHeader('Cache-Control', 'no-cache');
        res.json(foundItem);
      }
    };

    ds.getBid(req.params.bid_id, returnBid);

  })

  //POST /b3a/api/v1/bids/:bid_id
  //This operation is not supported, since one may only update an existing bid item
  .post(function (req, res) {
      error(res, 'POST is not supported on resource ' + req.params.bid_id)
  })

  //PUT /b3a/api/v1/bids/:bid_id
  //Update the item
  .put(requestValidator(false), function (req, res) {

    //We do not support PUT in production, otherwise one could alter entries
    //of other students
    if (isProduction()) {
      error(res, 'PUT operation is not supported in production mode.');
      return;
    }

    //Deal with JSON encoded bodies only
    if (!isHeaderSet(req, res)) return;

    let newItem = req.body;

    console.log('Received a PUT request for resource ' + req.params.bid_id + ' with: ' + JSON.stringify(newItem, null, 4));

    //Ignore the id which has been passed in the request body and set the
    //id from the URL instead
    newItem.id = req.params.bid_id;

    //Callback, invoked after file operation is complete
    let returnBid = function (err, updatedItem) {
      //Read failed
      if (err) {
        error(res, 'Unable to access data store on server.');
      } else {
        res.setHeader('Cache-Control', 'no-cache');
        res.json(updatedItem);
      }
    };

    ds.updateBid(newItem, returnBid);

  })

  //DELETE /b3a/api/v1/bids/:bid_id
  //Delete an existing item on the server
  .delete(function (req, res) {

    //We do not support DELETE in production, otherwise one could delete entries
    //of other students
    if (isProduction()) {
      error(res, 'DELETE operation is not supported in production mode.');
      return;
    }

    console.log('Received DELETE request for resource ' + req.params.bid_id);

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
  console.log('B3A app listening on port ' + PORT + ' in ' + ENVIRONMENT + ' mode. Access app under http://{host}:' + PORT + APIPATH + 'bids');
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


//Request validator, based on the 'isvalid' library
function requestValidator(withId) {

  if (withId) {
    return validate.body({
      'id': { type: String, required: true},
      'name': { type: String, required: true },
      'product': { type: String, required: true },
      'price': { type: String, required: true },
      'date': { type: String, required: true }
    });
  }
  else {
    return validate.body({
      'id': { type: String, required: false },
      'name': { type: String, required: true },
      'product': { type: String, required: true },
      'price': { type: String, required: true },
      'date': { type: String, required: true }
    });
  }

}

/**
* Determines if the app is running in production or not
*/
function isProduction() {
  return ENVIRONMENT == 'production';
}
