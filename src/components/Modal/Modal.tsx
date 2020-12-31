import React from "react";

interface ModalProps {
  isShown: boolean;
  title: React.ReactNode;
  body: React.ReactNode;
}

export default class Modal extends React.Component<ModalProps> {
  constructor(props: ModalProps) {
    super(props);
  }

  render() {
    const body = this.props.isShown ? (
      <div className="Modal-body">{this.props.body}</div>
    ) : null;

    return (
      <div
        role="dialog"
        aria-labelledby="title"
        style={{ display: this.props.isShown ? "inline-block" : "none" }}
      >
        <div id="title" className="Modal-title">
          {this.props.title}
        </div>
        {body}
      </div>
    );
  }
}
