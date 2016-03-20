import React, { Component } from 'react';
import BidBoard from '../BidBoard/BidBoard';

//The main bid board app
class BidBoardApp extends Component {

  constructor(props) {
    super(props);
  }

  render() {

    //Depending on the environment we compile for, set a a different
    //target URL
    let urlToFetchFrom;
    if (process.env.NODE_ENV === 'production') {
      urlToFetchFrom = 'https://lectures.ecosio.com/b3a/api/v1/bids';
    } else {
      urlToFetchFrom = 'http://localhost:3000/b3a/api/v1/bids';
    }

    return <BidBoard url={urlToFetchFrom}/>;
  }

}

export default BidBoardApp;
