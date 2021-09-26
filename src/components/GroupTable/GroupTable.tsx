import React from "react";

import { nanoid } from "nanoid";

import {
  Button,
  ButtonGroup,
  Checkbox,
  DialogActions,
  DialogContent,
  DialogContentText,
  Fab,
  FormControlLabel,
  FormGroup,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core";

import GroupContainer from "../GroupContainer";

import "./GroupTable.css";

import { Group, Participant } from "../../types";

import UniqueSequenceGen from "../../utils/unique-sequence-generator";
import { createMuiConfirmationModal, createMuiFormModal } from "../Modal";

interface Props {
  groups: Group[];
  participants?: Participant[];
  warningMessage?: string;
  onGroupsChange?: (g: Group[]) => void;
}

interface State {
  selectedIndex: number;
  deletingModalShown: boolean;
  splittingModalShown: boolean;
  combiningModalShown: boolean;
  selectedCombining: Group[];
  rawCombiningName: string | undefined;
  validCombiningName: string | undefined;
  originalMembers: Participant[];
  rawSplinteredGroupName: string;
  validSplinteredGroupName: string;
  splinteredMembers: Participant[];
}

const SEQUENCE_START = 0;

export default class GroupTable extends React.Component<Props, State> {
  static DEFAULT_SPLINTERED_NAME = "New Group";

  static areGroupsEqual(g1: Group | string, g2: Group | string) {
    if (GroupTable.isGroup(g1) && GroupTable.isGroup(g2)) {
      return g1.id === g2.id;
    }

    return g1 === g2;
  }

  static isGroup(object: any): object is Group {
    return (object as Group).id !== undefined;
  }

  private static transferParticipants(
    dominantGroup: Group,
    subservientGroups: Group[]
  ) {
    const transferParticipant = (group: Group) => {
      const { participants: dominantGroupsParticipants } = dominantGroup;
      const { participants: subservientGroupParticipants } = group;

      dominantGroupsParticipants.push(...subservientGroupParticipants);
    };

    subservientGroups.forEach(transferParticipant);
  }

  private static dissociateGroup({ id: groupId, distancer }: Group) {
    if (!distancer) return;

    const { pursuers } = distancer;

    const deletedPursuerIndex = pursuers.findIndex(({ id }) => groupId === id);
    pursuers.splice(deletedPursuerIndex, 1);
  }

  private static relieveParticipants({ participants }: Group) {
    participants.forEach((participant) => {
      const p = participant;
      p.isGrouped = false;
    });
  }

  private id;

  private sequenceGenerator;

  constructor(props: Props) {
    super(props);

    this.state = {
      selectedIndex: -1,
      deletingModalShown: false,
      splittingModalShown: false,
      combiningModalShown: false,
      selectedCombining: [],
      rawCombiningName: undefined,
      validCombiningName: undefined,
      originalMembers: [],
      rawSplinteredGroupName: GroupTable.DEFAULT_SPLINTERED_NAME,
      validSplinteredGroupName: GroupTable.DEFAULT_SPLINTERED_NAME,
      splinteredMembers: [],
    };

    this.sequenceGenerator = new UniqueSequenceGen(SEQUENCE_START);

    this.id = nanoid();

    this.handleGroupChange = this.handleGroupChange.bind(this);
    this.handleCreationClick = this.handleCreationClick.bind(this);
    this.handleDeletingClick = this.handleDeletingClick.bind(this);
    this.handleCancelDeletingClick = this.handleCancelDeletingClick.bind(this);
    this.handleCombiningSubmit = this.handleCombiningSubmit.bind(this);
    this.handleCombiningGroupCheckboxChange =
      this.handleCombiningGroupCheckboxChange.bind(this);
    this.handleCombiningNameChange = this.handleCombiningNameChange.bind(this);
    this.handleCombiningNameBlur = this.handleCombiningNameBlur.bind(this);
    this.handleCancelCombiningClick =
      this.handleCancelCombiningClick.bind(this);
    this.handleCancelSplittingClick =
      this.handleCancelSplittingClick.bind(this);
    this.handleSplittingSubmit = this.handleSplittingSubmit.bind(this);
    this.handleNewGroupNameChange = this.handleNewGroupNameChange.bind(this);
    this.handleNewGroupNameBlur = this.handleNewGroupNameBlur.bind(this);
  }

  private handleGroupChange(target: Group) {
    const { groups, onGroupsChange } = this.props;

    const targetIndex = groups.findIndex(({ id }) => id === target.id);
    groups.splice(targetIndex, 1, target);

    if (onGroupsChange) onGroupsChange([...groups]);
  }

  private handleCreationClick() {
    const { groups, onGroupsChange } = this.props;
    const idNum = this.sequenceGenerator.nextNum();
    const newGroups = [
      ...groups,
      {
        id: `GROUP-${idNum}`,
        name: `Group ${idNum}`,
        distancer: null,
        pursuers: [],
        participants: [],
      },
    ];

    if (onGroupsChange) onGroupsChange(newGroups);
  }

  private handleDeletingClick() {
    const { onGroupsChange } = this.props;
    const { selectedIndex } = this.state;
    const newGroups = this.deleteGroups(selectedIndex);

    if (onGroupsChange) onGroupsChange(newGroups);

    this.closeDeletingModal();
  }

  private handleCancelDeletingClick() {
    this.setState({ deletingModalShown: false, selectedIndex: -1 });
  }

  private handleInitiateDeletingClick(index: number) {
    this.setState({
      deletingModalShown: true,
      selectedIndex: index,
    });
  }

  private handleSplittingSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const { groups, onGroupsChange } = this.props;
    const {
      selectedIndex,
      validSplinteredGroupName,
      splinteredMembers,
      originalMembers,
    } = this.state;
    const idNum = this.sequenceGenerator.nextNum();
    const newGroup = {
      id: `GROUP-${idNum}`,
      name: validSplinteredGroupName,
      distancer: null,
      pursuers: [],
      participants: splinteredMembers,
    };

    groups[selectedIndex].participants = originalMembers;

    if (onGroupsChange) onGroupsChange([...groups, newGroup]);

    this.closeSplittingModal();
  }

  private handleCancelSplittingClick() {
    this.setState({
      rawSplinteredGroupName: GroupTable.DEFAULT_SPLINTERED_NAME,
      validSplinteredGroupName: GroupTable.DEFAULT_SPLINTERED_NAME,
      splittingModalShown: false,
      selectedIndex: -1,
      originalMembers: [],
      splinteredMembers: [],
    });
  }

  private handleInitiateSplittingClick(index: number) {
    const { groups } = this.props;
    const { participants } = groups[index];

    this.setState({
      splittingModalShown: true,
      selectedIndex: index,
      originalMembers: [...participants],
      splinteredMembers: [],
    });
  }

  private handleCombiningSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const { groups, onGroupsChange } = this.props;
    const { selectedIndex, selectedCombining, validCombiningName } = this.state;

    if (selectedCombining.length > 0) {
      const dominantGroup = groups[selectedIndex];
      const subservientGroups = selectedCombining;
      const mergingGroupIndices = selectedCombining.map((selectedGroup) =>
        groups.findIndex((group) => group.id === selectedGroup.id)
      );

      GroupTable.transferParticipants(dominantGroup, subservientGroups);
      if (validCombiningName) dominantGroup.name = validCombiningName;
      const newGroups = this.deleteGroups(mergingGroupIndices);

      if (onGroupsChange) onGroupsChange(newGroups);
    }

    this.closeCombiningModal();
  }

  private handleCancelCombiningClick() {
    this.setState({ combiningModalShown: false, selectedIndex: -1 });
  }

  private handleInitiateCombiningClick(index: number) {
    const { groups } = this.props;
    const currentGroup = groups[index];
    const currentGroupName = currentGroup?.name ?? "";

    this.setState({
      combiningModalShown: true,
      selectedIndex: index,
      rawCombiningName: currentGroupName,
      validCombiningName: currentGroupName,
    });
  }

  private handleCombiningGroupCheckboxChange(
    event: React.FormEvent<HTMLInputElement>
  ) {
    const { groups } = this.props;
    const { value: mergingGroupId, checked } = event.currentTarget;

    this.setState((state) => {
      const { selectedCombining } = state;

      if (checked) {
        const mergingGroup = groups.find(({ id }) => mergingGroupId === id);

        if (mergingGroup) selectedCombining.push(mergingGroup);
      } else {
        const targetIndex = selectedCombining.findIndex(
          ({ id }) => mergingGroupId === id
        );
        selectedCombining.splice(targetIndex, 1);
      }

      return { selectedCombining };
    });
  }

  private handleCombiningNameChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const { value } = event.target;

    if (value) this.setState({ validCombiningName: value });

    this.setState({ rawCombiningName: value });
  }

  private handleCombiningNameBlur() {
    this.setState((state) => ({ rawCombiningName: state.validCombiningName }));
  }

  private handleOriginalMemberClick(transferedMember: Participant) {
    this.setState((state) => {
      const { originalMembers, splinteredMembers } = state;
      const index = originalMembers.findIndex(
        (member) => transferedMember.id === member.id
      );

      originalMembers.splice(index, 1);
      splinteredMembers.push(transferedMember);

      return { originalMembers, splinteredMembers };
    });
  }

  private handleNewMemberClick(transferedMember: Participant) {
    this.setState((state) => {
      const { originalMembers, splinteredMembers } = state;
      const index = splinteredMembers.findIndex(
        (member) => transferedMember.id === member.id
      );

      splinteredMembers.splice(index, 1);
      originalMembers.push(transferedMember);

      return { originalMembers, splinteredMembers };
    });
  }

  private handleNewGroupNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { value } = event.target;

    if (value) this.setState({ validSplinteredGroupName: value });

    this.setState({ rawSplinteredGroupName: value });
  }

  private handleNewGroupNameBlur() {
    this.setState((state) => ({
      rawSplinteredGroupName: state.validSplinteredGroupName,
    }));
  }

  private closeDeletingModal() {
    this.setState((state) => ({ ...state, deletingModalShown: false }));
  }

  private closeSplittingModal() {
    this.setState({
      rawSplinteredGroupName: GroupTable.DEFAULT_SPLINTERED_NAME,
      validSplinteredGroupName: GroupTable.DEFAULT_SPLINTERED_NAME,
      splittingModalShown: false,
    });
  }

  private closeCombiningModal() {
    this.setState((state) => ({
      ...state,
      selectedCombining: [],
      combiningModalShown: false,
    }));
  }

  private deleteGroups(targetIndices: number | number[]) {
    const { groups } = this.props;
    const newGroups = [...groups];

    if (Array.isArray(targetIndices)) {
      targetIndices.sort();
      targetIndices.forEach((targetIndex, i) => {
        const targetGroup = newGroups[targetIndex - i];

        GroupTable.relieveParticipants(targetGroup);
        this.removeGroup(newGroups, targetGroup);
        GroupTable.dissociateGroup(targetGroup);
      });
    } else {
      const targetGroup = newGroups[targetIndices];

      GroupTable.relieveParticipants(targetGroup);
      this.removeGroup(newGroups, targetGroup);
      GroupTable.dissociateGroup(targetGroup);
    }

    return newGroups;
  }

  private removeGroup(groups: Group[], { id: groupId }: Group) {
    const index = groups.findIndex(({ id }) => id === groupId);
    const results = groupId.match(new RegExp(/\d+$/)) || [];
    const result = results[0];

    this.sequenceGenerator.remove(Number.parseInt(result, 10));
    groups.splice(index, 1);
  }

  private renderMainContent() {
    const {
      groups,
      participants,
      warningMessage = "No groups exist in this table",
    } = this.props;

    const groupGrid = (
      <Grid container spacing={2} role="grid" aria-label="Groups">
        {groups.map(({ id, name, participants: members }, index) => (
          <Grid item role="row" key={id}>
            <Paper>
              <Grid container>
                <Grid item xs={9} role="gridcell" aria-label={`${name} editor`}>
                  <ButtonGroup color="secondary" fullWidth variant="contained">
                    <Button
                      disabled={members.length <= 1}
                      onClick={() => this.handleInitiateSplittingClick(index)}
                    >
                      SPLIT
                    </Button>
                    <Button
                      disabled={groups.length < 2}
                      onClick={() => this.handleInitiateCombiningClick(index)}
                    >
                      COMBINE
                    </Button>
                  </ButtonGroup>
                  <GroupContainer
                    ownedIndex={index}
                    groups={groups}
                    participants={participants}
                    onGroupChange={this.handleGroupChange}
                  />
                </Grid>
                <Grid
                  container
                  item
                  alignItems="stretch"
                  justifyContent="flex-end"
                  xs={3}
                  role="gridcell"
                >
                  <Button
                    color="primary"
                    variant="contained"
                    aria-label={`Delete ${id}`}
                    onClick={() => this.handleInitiateDeletingClick(index)}
                  >
                    <span className="material-icons" aria-hidden>
                      remove_circle
                    </span>
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
    const warning = (
      <Typography role="alert" align="center" color="error">
        {warningMessage}
      </Typography>
    );

    return groups.length > 0 ? groupGrid : warning;
  }

  private renderFloatingActionButton() {
    return (
      <Fab
        color="secondary"
        className="fab"
        aria-label="Create group"
        onClick={this.handleCreationClick}
      >
        <span className="material-icons" aria-hidden>
          add
        </span>
      </Fab>
    );
  }

  private renderDeletionModal() {
    const { deletingModalShown } = this.state;

    return (
      deletingModalShown &&
      createMuiConfirmationModal(
        "Would you like to delete the selected group?",
        deletingModalShown,
        this.handleCancelDeletingClick,
        "Delete group",
        { text: "CANCEL", onClick: this.handleCancelDeletingClick },
        { text: "DELETE", onSubmit: this.handleDeletingClick }
      )
    );
  }

  private renderSplittingModal() {
    const { groups } = this.props;
    const {
      splittingModalShown,
      selectedIndex,
      originalMembers,
      splinteredMembers,
      rawSplinteredGroupName,
    } = this.state;
    const selectedGroup = groups[selectedIndex];
    const titleId = `base-group-title-${this.id}`;
    const newNameId = `new-group-name-${this.id}`;
    const Content = selectedGroup && (
      <form onSubmit={this.handleSplittingSubmit}>
        <DialogContent>
          <Grid container direction="column" spacing={2}>
            <Grid item>
              <Paper elevation={3}>
                <Typography variant="h3" id={titleId}>
                  {selectedGroup.name}
                </Typography>
                <Grid
                  container
                  direction="column"
                  spacing={1}
                  role="grid"
                  aria-labelledby={titleId}
                >
                  {originalMembers.map((member) => (
                    <Grid item key={member.id} role="row">
                      <span role="gridcell">
                        <Button
                          color="secondary"
                          endIcon={
                            <span className="material-icons" aria-hidden>
                              arrow_downward
                            </span>
                          }
                          fullWidth
                          variant="contained"
                          disabled={originalMembers.length < 2}
                          aria-label={`Move ${member.name}`}
                          onClick={() => this.handleOriginalMemberClick(member)}
                        >
                          {member.name}
                        </Button>
                      </span>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
            <Grid item>
              <Paper elevation={3}>
                <TextField
                  label="New group name"
                  id={newNameId}
                  value={rawSplinteredGroupName}
                  onChange={this.handleNewGroupNameChange}
                  onBlur={this.handleNewGroupNameBlur}
                />
                <Grid
                  container
                  direction="column"
                  spacing={1}
                  role="grid"
                  aria-labelledby={newNameId}
                >
                  {this.renderSplinteredMembers()}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            color="secondary"
            variant="outlined"
            onClick={this.handleCancelSplittingClick}
          >
            CANCEL
          </Button>
          <Button
            color="secondary"
            disabled={splinteredMembers.length < 1}
            type="submit"
          >
            SPLIT
          </Button>
        </DialogActions>
      </form>
    );

    return (
      splittingModalShown &&
      createMuiFormModal(
        splittingModalShown,
        "Transfer members",
        Content,
        this.handleCancelSplittingClick
      )
    );
  }

  private renderCombiningModal() {
    const { groups } = this.props;
    const {
      selectedIndex,
      combiningModalShown,
      rawCombiningName = "Default",
    } = this.state;
    const currentGroup = groups[selectedIndex];
    const nameId = `combined-group-name-${this.id}`;

    const Content = currentGroup && (
      <form onSubmit={this.handleCombiningSubmit}>
        <DialogContent>
          <TextField
            id={nameId}
            color="secondary"
            label="New Name"
            fullWidth
            value={rawCombiningName}
            onChange={this.handleCombiningNameChange}
            onBlur={this.handleCombiningNameBlur}
          />
          <FormGroup>
            {groups
              .filter(({ id }) => currentGroup.id !== id)
              .map(({ id, name }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      value={id}
                      onChange={this.handleCombiningGroupCheckboxChange}
                    />
                  }
                  label={name}
                  key={id}
                />
              ))}
          </FormGroup>
          <DialogContentText>
            This process will remove the selected group and move its members
            into the initiating group.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            color="secondary"
            variant="outlined"
            onClick={this.handleCancelCombiningClick}
          >
            CANCEL
          </Button>
          <Button color="secondary" type="submit">
            COMBINE
          </Button>
        </DialogActions>
      </form>
    );

    return (
      combiningModalShown &&
      createMuiFormModal(
        combiningModalShown,
        "Combine groups",
        Content,
        this.handleCancelCombiningClick
      )
    );
  }

  private renderSplinteredMembers() {
    const { splinteredMembers } = this.state;
    const buttonId = `placeholder-button-${this.id}`;

    const members = splinteredMembers.map((member) => (
      <Grid item key={member.id} role="row">
        <span role="gridcell">
          <Button
            color="secondary"
            endIcon={
              <span className="material-icons" aria-hidden>
                arrow_upward
              </span>
            }
            fullWidth
            variant="contained"
            aria-label={`Move ${member.name}`}
            onClick={() => this.handleNewMemberClick(member)}
          >
            {member.name}
          </Button>
        </span>
      </Grid>
    ));
    const placeholder = (
      <Grid item role="row">
        <span role="gridcell" aria-labelledby={buttonId}>
          <Button
            id={buttonId}
            color="secondary"
            fullWidth
            variant="contained"
            disabled
            endIcon={<span className="material-icons">block</span>}
            aria-label="placeholder"
          >
            ---
          </Button>
        </span>
      </Grid>
    );

    return splinteredMembers.length > 0 ? members : placeholder;
  }

  render() {
    return (
      <section className="GroupTable">
        {this.renderMainContent()}
        {this.renderFloatingActionButton()}
        {this.renderDeletionModal()}
        {this.renderSplittingModal()}
        {this.renderCombiningModal()}
      </section>
    );
  }
}
