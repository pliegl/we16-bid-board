//Bid board application app
import React from 'react';
import { render } from 'react-dom';
import BidBoardApp from './components/BidBoardApp/BidBoardApp';

let element = React.createElement(BidBoardApp, {});
render(element, document.querySelector('.container'));
