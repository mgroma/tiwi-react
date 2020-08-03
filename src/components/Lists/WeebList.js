import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
// @material-ui/icons
import Close from "@material-ui/icons/Close";
import Play from "@material-ui/icons/PlayArrow";
import Record from "@material-ui/icons/PlaylistPlay";
// core components
import styles from "assets/jss/material-dashboard-react/components/tasksStyle.js";

const useStyles = makeStyles(styles);

export default function WeebList(props) {
  const classes = useStyles();
  const [checked, setChecked] = React.useState([...props.checkedIndexes]);
  const { tasksIndexes, tasks, rtlActive } = props;
  const tableCellClasses = classnames(classes.tableCell, {
    [classes.tableCellRTL]: rtlActive
  });
  return (
    <Table className={classes.table}>
      <TableBody>
        {tasksIndexes.map(value => (
          <TableRow key={value} className={classes.tableRow}>
            <TableCell className={tableCellClasses}>{tasks[value]}</TableCell>
            <TableCell className={classes.tableActions}>
              <Tooltip
                  id="tooltip-top-start"
                  title="Play"
                  placement="top"
                  classes={{ tooltip: classes.tooltip }}
              >
                <IconButton
                    aria-label="Play"
                    className={classes.tableActionButton}
                >
                  <Play
                      className={
                        classes.tableActionButtonIcon + " " + classes.play
                      }
                  />
                </IconButton>
              </Tooltip>
              <Tooltip
                id="tooltip-top"
                title="Record"
                placement="top"
                classes={{ tooltip: classes.tooltip }}
              >
                <IconButton
                  aria-label="Record"
                  className={classes.tableActionButton}
                >
                  <Record
                    className={
                      classes.tableActionButtonIcon + " " + classes.record
                    }
                  />
                </IconButton>
              </Tooltip>
              <Tooltip
                id="tooltip-top-start"
                title="Remove"
                placement="top"
                classes={{ tooltip: classes.tooltip }}
              >
                <IconButton
                  aria-label="Close"
                  className={classes.tableActionButton}
                >
                  <Close
                    className={
                      classes.tableActionButtonIcon + " " + classes.close
                    }
                  />
                </IconButton>
              </Tooltip>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

WeebList.propTypes = {
  tasksIndexes: PropTypes.arrayOf(PropTypes.number),
  tasks: PropTypes.arrayOf(PropTypes.node),
  rtlActive: PropTypes.bool,
  checkedIndexes: PropTypes.array
};
