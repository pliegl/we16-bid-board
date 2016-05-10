#BIG Bid Board Application (B3A) - Backend

The BIG Board Application exposes a RESTful interface for auction results. The application is based on [node.js](https://nodejs.org/).

##Starting the backend server

Change to the `server` directory and initialize the node application with `npm install`. This will install all necessary node packages to the `node_modules` folder.

Then start the server using `node server.js`. The REST interface will be exposed to `http://localhost:3000/b3a/api/v1/bids`. The file `bids.json` is used as data store. Thus, you may always check back with that file, if bid items have been correctly updated, deleted, etc.

Currently, the following operations are supported by the REST interface:

 * `GET` `http://localhost:3000/b3a/api/v1/bids` returns all stored bid items
 * `POST` `http://localhost:3000/b3a/api/v1/bids` adds a new bid item
 * `PUT` `http://localhost:3000/b3a/api/v1/bids` updates a new bid item. In case the item does not exist, a new item is added
 * `DELETE` `http://localhost:3000/b3a/api/v1/bids/[bid_id]` deletes the bid item with the ID `[bid_id]`.

Please note that during the lab assignment only `GET` and `POST` will be available on the test server.

For testing the service you may use command line tools such as [cURL](https://curl.haxx.se) or GUIs such as [SOAP-UI](https://www.soapui.org). In principle, any HTTP client of choice is suitable for testing.

In the following the four different operations a briefly explained.

###GET request

Returns all stored items from the server.

Submit a `GET` request to `http://localhost:3000/b3a/api/v1/bids`.

A JSON response, similar to the following result is returned.

```
[
      {
      "id": "0eea3c5a-d25a-4fd9-bc2c-3d7affcad2d4",
      "name": "John Doe",
      "product": "Red Hot Chilli Peppers concert tickets",
      "price": "180.00",
      "date": "2016-03-02T18:25:43.511Z"
   },
      {
      "id": "515a4885-b5d2-4136-82a5-1a0c64016f2c",
      "name": "Jane Dane",
      "product": "The Great Gatsby, Paperback",
      "price": "19.50",
      "date": "2016-03-03T11:09:31.701Z"
   }
]
```

###POST request

Stores a new bid item on the server.

Submit a `POST` request to `http://localhost:3000/b3a/api/v1/bids`.

Make sure the HTTP header `Content-Type` is set to `application/json`. The request body could look like:

```
[
    {        
        "name": "John Doe 1",
        "product": "The Catcher in the Rye",
        "price": "22.30",
        "date": "2016-03-06T11:09:31.701Z"
    }

]
```
The API only supports processing of single objects. In case you submit an array with more than one object, only the first object will be processed. All other objects are ignored.


Submitting a single object is also possible:

```
{        
    "name": "John Doe 1",
    "product": "The Catcher in the Rye",
    "price": "22.30",
    "date": "2016-03-06T11:09:31.701Z"
}
```

The `id` will be set by the server. You may also submit a request with an id, e.g.:

```
[
    {        
        "id": "4711",
        "name": "John Doe 1",
        "product": "The Catcher in the Rye",
        "price": "22.30",
        "date": "2016-03-06T11:09:31.701Z"
    }

]
```

In this case the `id` is simply ignored and will be set by the server anyway.

The response contains the submitted JSON with the new `id`, which has been set by the server.

###PUT request

Updates an existing item or stores a new entry, if the item could not be found on the server.

Submit a `PUT` request to `http://localhost:3000/b3a/api/v1/bids`.

Make sure the HTTP header `Content-Type` is set to `application/json`. In order to update the entry with id `0eea3c5a-d25a-4fd9-bc2c-3d7affcad2d4` the request body could look like:

```
[
    {        
        "id": "0eea3c5a-d25a-4fd9-bc2c-3d7affcad2d4",
        "name": "John Doe 1",
        "product": "The Catcher in the Rye",
        "price": "22.30",
        "date": "2016-03-06T11:09:31.701Z"
    }

]
```

The response contains the submitted JSON.


###DELETE request

Removes an existing item from the server.

In order to delete the item with id `0eea3c5a-d25a-4fd9-bc2c-3d7affcad2d4`, submit the following DELETE request: `http://localhost:3000/b3a/api/v1/bids/0eea3c5a-d25a-4fd9-bc2c-3d7affcad2d4`

In case the deletion was successful, an HTTP 200 with a JSON message is returned. In case the deletion failed (because the item could not be found), an HTTP 400 with a JSON message is returned.


##Working with the server yourself

If you would like work with the server yourself, you may want to consider using [nodemon](http://nodemon.io).

Install it using `npm install -g nodemon`. Then start the server using `nodemon server.js`. The node.js application automatically refreshes, in case you make any changes to the code.

##Debugging the application

If you want to debug the node application, either use an IDE such as IntelliJ or use [Node Inspector](https://github.com/node-inspector/node-inspector).

Install it using `npm install -g node-inspector`. Then start the server using `node-debug server.js`.

Your output should look something like:

```
 ➜  server node-debug server.js
 Node Inspector is now available from http://127.0.0.1:8080/? ws=127.0.0.1:8080&port=5858
 Debugging 'server.js'

 Debugger listening on port 5858
```

Open Chrome browser (if that has not been done automatically) and open `http://127.0.0.1:8080/?ws=127.0.0.1:8080&port=5858`

Use the Chrome JS debugger to set breakpoints and then invoke any of the REST operations.


##License

 MIT License (MIT)
