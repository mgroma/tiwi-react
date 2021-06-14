import Input from "@material-ui/core/Input";
import Button from "../CustomButtons/Button";
import Search from "@material-ui/icons/Search";
import React from "react";
/*
 props = {
    classes: { margin, search, searchWrapper}
    onChange: (event) => {}
    placeholder

 }
 */
export default (props) => {
    const classes = props && props.classes || {};
    const placeholder = props && props.placeholder || "Search channels name";
    return <span className={classes.searchWrapper}>
        <Input
            formControlProps={{
                className: classes.margin + " " + classes.search
            }}
            inputProps={{
                placeholder: placeholder,
                inputProps: {
                    "aria-label": "Search"
                }
            }}
            onChange={props.onChange}
        />
        <Button color="white" aria-label="edit" justIcon round>
            <Search/>
        </Button>
    </span>;
}
