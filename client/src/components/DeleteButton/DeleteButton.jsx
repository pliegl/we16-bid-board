import React, { Component } from 'react';


class DeleteButton extends Component {

  constructor(props) {
    super(props);

    this.handleDeleteEvent = this.handleDeleteEvent.bind(this);
  }

  render() {
    return (
      <span className="glyphicon glyphicon-trash" onClick={this.handleDeleteEvent}/>
  );
  }

  handleDeleteEvent(event) {
    //TODO
  }

}

export default DeleteButton;
