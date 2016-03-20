import React, { Component } from 'react';
import BidTableRow from '../BidTableRow/BidTableRow';

// Table for showing the different bid items
class BidTable extends Component {

  render() {
    // Get the table rows
    const tableRows = this.props.data.map((bid) => {
      return <BidTableRow key={bid.id} id={bid.id} date={bid.date} name={bid.name} product={bid.product} price={bid.price}/>;
    });

    return (
    <div className="row">
        <div className="col-md-12">
            <h2>Overview of bid items</h2>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Submit date</th>
                  <th>Name</th>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tableRows}
              </tbody>
            </table>
        </div>
    </div>
  );
  }

}

export default BidTable;
