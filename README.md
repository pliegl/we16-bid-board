#BIG Bid Board Application (B3A)

B3A is used to store the results of auctions, which are conducted in the BIG bid application. The BIG bid application is used as part of a lab assignment of the Web Engineering lecture series of the [Business Informatics Group](http://www.big.tuwien.ac.at).

The application consists of a node.js server backend exposing a REST interface, which students may use to push auction results to the server.

Furthermore, a client is provided, allowing to view the auction results stored on the server.

##Starting the backend server

Change to the `server` directory and initialize the node application with `npm install`. This will install all necessary node packages to the `node_modules` folder.

Then start the server using `node server.js`. The REST interface will be exposed to `http://localhost:3000/b3a/api/v1/bids`. The file `bids.json` is used as data store. Thus, you may always check back with that file, if bid items have been correctly updated, deleted, etc.

Currently, the following operations are supported by the REST interface:

 * `GET` `http://localhost:3000/b3a/api/v1/bids` returns all stored bid items
 * `POST` `http://localhost:3000/b3a/api/v1/bids` adds a new bid item
 * `PUT` `http://localhost:3000/b3a/api/v1/bids` updates a new bid item. In case the item does not exist, a new item is added
 * `DELETE` `http://localhost:3000/b3a/api/v1/bids/[bid_id]` deletes the bid item with the ID `[bid_id]`.

Please note that during the lab assignment only `GET` and `POST` will be available on the test server.

###Working with the server yourself

If you would like work with the server yourself, you may want to consider using [nodemon](http://nodemon.io).

Install it using `npm install -g nodemon`. Then start the server using `nodemon server.js`. The node.js application automatically refreshes, in case you make any changes to the code.

###Debugging the application

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
