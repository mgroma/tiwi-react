import * as React from 'react';
import DateTimePicker from "react-datetime-picker";

export default  (props) => {
    return (
        <span>
            <DateTimePicker
                name={props.name}
                className={props.className}
                onChange={props.onChange}
                value={props.value}
            />
    </span>
    );
}
