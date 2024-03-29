import {
    defaultFont,
    primaryColor,
    dangerColor,
    grayColor, warningColor, successColor
} from "assets/jss/material-dashboard-react.js";
import tooltipStyle from "assets/jss/material-dashboard-react/tooltipStyle.js";
import checkboxAdnRadioStyle from "assets/jss/material-dashboard-react/checkboxAdnRadioStyle.js";

const tasksStyle = {
    ...tooltipStyle,
    ...checkboxAdnRadioStyle,
    table: {
        marginBottom: "0",
        overflow: "visible"
    },
    tableRow: {
        position: "relative",
        borderBottom: "1px solid " + grayColor[5]
    },
    tableRowToday: {
        position: "relative",
        borderLeft: "3px solid " + successColor[3],
        borderBottom: "1px solid " + grayColor[5]
    },
    tableRowLastHour: {
        position: "relative",
        borderLeft: "3px solid " + warningColor[3],
        borderBottom: "1px solid " + grayColor[5]
    },
    tableActions: {
        display: "flex",
        border: "none",
        padding: "12px 8px !important",
        width: 60,
        verticalAlign: "middle"
    },
    tableCell: {
        ...defaultFont,
        padding: "8px",
        verticalAlign: "middle",
        border: "none",
        lineHeight: "1.42857143",
        fontSize: "14px"
    },
    tableCellRTL: {
        textAlign: "right"
    },
    tableActionButton: {
        width: "27px",
        height: "27px",
        padding: "0"
    },
    tableActionButtonIcon: {
        width: "17px",
        height: "17px"
    },
    edit: {
        backgroundColor: "transparent",
        color: primaryColor[0],
        boxShadow: "none"
    },
    play: {
        backgroundColor: "transparent",
        color: primaryColor[0],
        boxShadow: "none"
    },
    record: {
        backgroundColor: "transparent",
        color: primaryColor[0],
        boxShadow: "none"
    },
    close: {
        backgroundColor: "transparent",
        color: dangerColor[0],
        boxShadow: "none"
    }
};
export default tasksStyle;
