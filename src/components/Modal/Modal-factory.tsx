import React, { ReactNode } from "react";

import {
  Button as MuiButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";

import { nanoid } from "nanoid";

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

export function createMuiConfirmationModal(
  information: string,
  isShown: boolean,
  onCloseRequest: () => void,
  title: string,
  cancelButton?: { text: string; onClick: () => void },
  confirmButton?: { text: string; onSubmit: () => void }
) {
  const id = nanoid();
  const titleId = `dialog-title-${id}`;
  const descriptionId = `dialog-description-${id}`;
  const { onClick: handleCancelClick, text: cancelText } = cancelButton || {
    text: "CANCEL",
    onClick: undefined,
  };
  const { onSubmit: handleConfirmSubmit, text: confirmText } =
    confirmButton || {
      text: "CONFIRM",
      onSubmit: undefined,
    };

  return (
    <Dialog
      open={isShown}
      onClose={onCloseRequest}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <DialogTitle id={titleId}>{title}</DialogTitle>
      <form onSubmit={handleConfirmSubmit}>
        <DialogContent dividers>
          <DialogContentText id={descriptionId}>
            {information}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MuiButton
            color="secondary"
            variant="contained"
            onClick={handleCancelClick}
          >
            {cancelText}
          </MuiButton>
          <MuiButton color="secondary" variant="outlined" type="submit">
            {confirmText}
          </MuiButton>
        </DialogActions>
      </form>
    </Dialog>
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

export function createMuiFormModal(
  isShown: boolean,
  title: string,
  Content?: ReactNode,
  onCloseRequest?: () => void
) {
  const id = nanoid();
  const titleId = `dialog-title-${id}`;
  return (
    <Dialog open={isShown} onClose={onCloseRequest} aria-labelledby={titleId}>
      <DialogTitle id={titleId}>{title}</DialogTitle>
      {Content}
    </Dialog>
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
