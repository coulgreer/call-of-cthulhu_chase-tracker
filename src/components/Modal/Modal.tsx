import React from "react";

import ReactModal from "react-modal";

import "./Modal.css";

interface Props {
  isShown?: boolean;
  contentLabel?: string;
  Header?: React.ReactNode;
  Footer?: React.ReactNode;
  onCloseRequest?: () => void;
}

export default function Modal({
  Header,
  children: Body,
  Footer,
  isShown = false,
  contentLabel = "Modal",
  onCloseRequest,
}: React.PropsWithChildren<Props>) {
  if (isShown) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }

  return (
    <ReactModal
      className="Modal"
      overlayClassName="Modal__Overlay"
      isOpen={isShown}
      onRequestClose={onCloseRequest}
      contentLabel={contentLabel}
    >
      {Header || (
        <div className="Modal__header">
          <h2>{contentLabel}</h2>
        </div>
      )}
      {Body}
      {Footer}
    </ReactModal>
  );
}
