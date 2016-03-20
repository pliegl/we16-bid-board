import React, { Component } from 'react';
import BidForm from '../BidForm/BidForm';
import BidTable from '../BidTable/BidTable';

// The bid board wrapper object
class BidBoard extends Component {

  constructor(props) {
    super(props);

    // Set the default state of the component here
    // When it's loaded for the first time, the state is empty
    this.state = {
      data: [],
    };

    this.loadItemsFromServer = this.loadItemsFromServer.bind(this);
  }

  // Hook in after the component has been successfully mounted
  componentDidMount() {
    this.loadItemsFromServer();
    // Reload every 5 seconds, setting a new state on the component
    setInterval(this.loadItemsFromServer, 10000);
  }

  // Get the bid items from the server
  loadItemsFromServer() {
    console.log('Fetching new items from server');
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function (data) {
        this.setState({ data: data });
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this),
    });
  }

  render() {
    return (
      <div className="main">
        <div className="row">
            <div className="col-md-12">
                {/* We pass on the state of this component and not props (since nothing
                is inherited form the parent component). The state will be fetched
                from the REST interface */}
                <BidTable data={this.state.data} />
            </div>
        </div>
        <div className="row">
            <div className="col-md-12">
                <BidForm />
            </div>
        </div>
        <div className="row">
            <div className="col-md-12">
                <p>This application is used as part of the Web Engineering lecture series at Business Informatics Group, Vienna University of Technology. For technical details in regard to the API <a href="https://github.com/pliegl/we16-bid-board/tree/master/server">please have a look at the documentation.</a></p>
                <p>The API of this application may be accessed under <a href="https://lectures.ecosio.com/b3a/api/v1/bids">https://lectures.ecosio.com/b3a/api/v1/bids</a></p>
            </div>
        </div>
      </div>
  );
  }
}

export default BidBoard;
