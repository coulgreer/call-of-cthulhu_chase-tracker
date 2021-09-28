import * as React from "react";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

import { nanoid } from "nanoid";

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
          <Button
            color="secondary"
            variant="contained"
            onClick={handleCancelClick}
          >
            {cancelText}
          </Button>
          <Button color="secondary" variant="outlined" type="submit">
            {confirmText}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export function createMuiFormModal(
  isShown: boolean,
  title: string,
  Content?: React.ReactNode,
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
