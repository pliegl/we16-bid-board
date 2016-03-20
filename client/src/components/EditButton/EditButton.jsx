import React, { Component } from 'react';


class EditButton extends Component {

  constructor(props) {
    super(props);

    this.handleEditEvent = this.handleEditEvent.bind(this);
  }

  render() {
    return (
      <span className="glyphicon glyphicon-edit" onClick={this.handleDeleteEvent}/>
  );
  }

  handleEditEvent(event) {
    //TODO
  }

}

export default EditButton;
