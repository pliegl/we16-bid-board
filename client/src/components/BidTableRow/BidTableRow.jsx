import React, { Component } from 'react';
import DeleteButton from '../DeleteButton/DeleteButton';
import EditButton from '../EditButton/EditButton';

class BidTableRow extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <tr>
          <td>{this.props.id}</td>
          <td>{this.props.date}</td>
          <td>{this.props.name}</td>
          <td>{this.props.product}</td>
          <td>{this.props.price}</td>
          <td><DeleteButton id={this.props.id}/> <EditButton id={this.props.id}/></td>
      </tr>
  );
  }




}

export default BidTableRow;
