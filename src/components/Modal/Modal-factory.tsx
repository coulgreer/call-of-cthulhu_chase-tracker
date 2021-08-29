import React, { ReactNode } from "react";

import Modal from "./Modal";
import Button from "../Button";

export function createInformativeModal(
  information: string,
  isShown: boolean,
  onCloseRequest: () => void,
  contentLabel?: string
) {
  return (
    <Modal
      isShown={isShown}
      contentLabel={contentLabel}
      onCloseRequest={onCloseRequest}
    >
      <p className="Modal__body">{information}</p>
    </Modal>
  );
}

export function createConfirmationalModal(
  information: string,
  isShown: boolean,
  onCloseRequest: () => void,
  cancelButton?: { text: string; onClick: () => void },
  confirmButton?: { text: string; onSubmit: () => void },
  contentLabel?: string
) {
  const { onClick: handleCancelClick, text: cancelText } = cancelButton || {
    text: "CANCEL",
    onClick: undefined,
  };
  const { onSubmit: handleConfirmSubmit, text: confirmText } =
    confirmButton || {
      text: "CONFIRM",
      onSubmit: undefined,
    };
  const Footer = (
    <div className="Modal__options">
      <Button
        className="button button--contained button--on-dark button--medium"
        onClick={handleCancelClick}
      >
        {cancelText}
      </Button>
      <Button
        className="button button--outlined button--on-dark button--medium"
        type="submit"
      >
        {confirmText}
      </Button>
    </div>
  );

  return (
    <Modal
      isShown={isShown}
      contentLabel={contentLabel}
      onCloseRequest={onCloseRequest}
    >
      <form onSubmit={handleConfirmSubmit}>
        <p className="Modal__body">{information}</p>
        {Footer}
      </form>
    </Modal>
  );
}

export function createFormModal(
  isShown: boolean,
  contentLabel?: string,
  Header?: ReactNode,
  Content?: ReactNode,
  onCloseRequest?: () => void
) {
  return (
    <Modal
      isShown={isShown}
      contentLabel={contentLabel}
      onCloseRequest={onCloseRequest}
      Header={Header}
    >
      {Content}
    </Modal>
  );
}
