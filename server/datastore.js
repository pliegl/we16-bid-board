'use strict';
/**
Data store abstracting from the bids.json file
*/
class Datastore {

  /**
  *Creates a new Datastore
  */
  constructor(FILEPATH, fs, uuid) {
    this.FILEPATH = FILEPATH;
    this.fs = fs;
    this.uuid = uuid;
  }

  //Return all bids
  //The operation is async - as soon as the read operation is finished, the
  //callback is invoked
  getBids(callback) {
    this.fs.readFile(this.FILEPATH, callback);
  }

  //Return a specific bid item
  getBid(bidId, callback) {
    let _this = this;
    _this.fs.readFile(_this.FILEPATH, function (err, data) {

      if (err) {
        console.error('Unable to get bid items from file ' + err);
        callback(err, null);
        return;
      }

      //Get the items from the file
      let bidItems;

      //Consider empty files
      if (data == undefined || data.length==0) {
        bidItems = [];
      }
      else {
        bidItems = JSON.parse(data);
      }

      //Search for the bid item based on the ID
      //is found
      let found = false;
      let bidItem;
      for (let i = 0; i < bidItems.length; i++) {
        if (bidItems[i].id === bidId) {
          bidItem = bidItems[i];
          found = true;
          console.log('Found an entry for the given bid item.');
          break;
        }
      }

      //In case we have found the item - return it
      if (found) {
        callback(null, bidItem);
      }
      //In case we were unable to find the respective bid item, we return an error
      else {
        callback('Unable to find item with id ' + bidId, null);
      }
    });


  }

  //Write the bid to the file
  //The operation is async - as soon as the write operation is finished, the
  //callback is invoked
  writeBid(newItem, callback) {
    let _this = this;
    _this.fs.readFile(_this.FILEPATH, function (err, data) {
      if (err) {
        console.error('Unable to get bid items from file ' + err);
        callback(err, null);
        return;
      }

      //Get the items from the file
      let bidItems;
      //Consider empty files
      if (data == undefined || data.length==0) {
        bidItems = [];
      }
      else {
        bidItems = JSON.parse(data);
      }


      //Store the new item
      bidItems = _this.slice(bidItems);
      //Why unshift is not called 'insert' will always remain a mystery...
      bidItems.unshift(newItem);

      //Write the items back to the file and return the updated store using then
      //callback
      _this.fs.writeFile(_this.FILEPATH, JSON.stringify(bidItems, null, 4), function (err) {
        if (err) {
          console.error('Unable to write items to file ' + err);
        }

        callback(err, newItem);
      });
    });
  }

  //Search for the existing bid and update it
  //The operation is async - as soon as the update operation is finished, the
  //callback is invoked
  updateBid(newItem, callback) {

    let _this = this;

    _this.fs.readFile(_this.FILEPATH, function (err, data) {
      if (err) {
        console.error('Unable to get bid items from file ' + err);
        callback(err, null);
        return;
      }

      //Get the items from the file
      let bidItems;
      //Consider empty files
      if (data == undefined || data.length==0) {
        bidItems = [];
      }
      else {
        bidItems = JSON.parse(data);
      }

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
        newItem.id = _this.uuid.v4();
        console.log('(Re)setting its id to ' + newItem.id);
        bidItems = _this.slice(bidItems);
        bidItems.unshift(newItem);
      }

      //Write the items back to the file and return the updated store using then
      //callback
      _this.fs.writeFile(_this.FILEPATH, JSON.stringify(bidItems, null, 4), function (err) {
        if (err) {
          console.error('Unable to write items to file ' + err);
        }

        callback(err, newItem);
      });
    });
  }

  //Delete the bid with the given id
  //The operation is async - as soon as the delete operation is finished, the
  //callback is invoked
  deleteBid(bidId, callback) {

    let _this = this;

    _this.fs.readFile(_this.FILEPATH, function (err, data) {
      if (err) {
        console.error('Unable to get bid items from file ' + err);
        callback('Unable to access bid items', null);
        return;
      }

      //Get the items from the file
      let bidItems;
      //Consider empty files
      if (data == undefined || data.length==0) {
        bidItems = [];
      }
      else {
        bidItems = JSON.parse(data);
      }
      console.log('Received a DELETE with the following id ' + bidId);

      //Simply filter out the item to be deleted
      let updatedbidItems = bidItems.filter((entry) => {return entry.id != bidId});

      //Write the filtered items back to the file
      _this.fs.writeFile(_this.FILEPATH, JSON.stringify(updatedbidItems, null, 4), function (err) {
        if (err) {
          console.error('Unable to write items to file ' + err);
          callback('Unable to access bid items', null);
          return;
        }

        if (bidItems.length == updatedbidItems.length) {
          callback('Could not find bid item with id ' + bidId, null);
        } else {
          callback(null, 'Successfully deleted bid item with id ' + bidId);
        }
      });
    });
  }

  //Delete all bids
  deleteBids(callback) {
    let _this = this;

    //Write an empty collection to the file
    let emptyBidItems = [];

    _this.fs.writeFile(_this.FILEPATH, JSON.stringify(emptyBidItems, null, 4), function (err) {
      if (err) {
        console.error('Unable to write items to file ' + err);
        callback('Unable to access bid items', null);
        return;
      }
      callback(null, 'Successfully deleted all bid items');
    });

  }

  //Slices the bid array and limit its size to 30 entries
  slice(bids) {
    if (bids.length > 30) {
      console.log('Data store size is too large, slicing.');
      bids = bids.slice(0,30);
    }
    return bids;
  }


}

//ES6 modules not supported by node.js by default
//export default Datastore;

//Go with the CommonJS approach instead
module.exports = Datastore;
