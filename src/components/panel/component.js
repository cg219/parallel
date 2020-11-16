import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import styles from "./styles";

function Panel (props) {
    var [title, setTitle] = useState(props.title);
    var [body, setBody] = useState(props.body);
    var [color, setColor] = useState(props.color);
    var colorMap = {
        orange: styles.Orange,
        purple: styles.Purple,
        pink: styles.Pink,
    }
    var classes = [styles.Panel, colorMap[color]].join(' ');

    useEffect(updateProps, [props]);

    return (
        <section className={classes}>
            <h1>{title}</h1>
            <div dangerouslySetInnerHTML={{__html: body}}></div>
        </section>
    )

    function updateProps() {
        if (props.title != title) setTitle(props.title);
        if (props.body != body) setBody(props.body);
        if (props.color != color) setColor(props.color);
    }
}

export { Panel }
