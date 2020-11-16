import React, { Fragment, Component } from "react";
import { Link, NavLink } from "react-router-dom";
import styles from "./styles";

export class Panel extends Component {
    constructor(props) {
        super(props);

        this.state = {
            title: this.props.title,
            body: this.props.body,
            color: ''
        }
    }

    componentDidMount() {
    }

    componentDidUpdate() {
        if (this.props.title !== this.state.title) {
            this.setState({
                title: this.props.title,
                body: this.props.body,
                color: this.props.color
            })
        }
    }

    render() {
        var colorMap = {
            orange: styles.Orange,
            purple: styles.Purple,
            pink: styles.Pink,
        }

        let classes = [styles.Panel, colorMap[this.state.color]].join(' ');

        return (
            <section className={classes}>
                <h1>{this.state.title}</h1>
                <div dangerouslySetInnerHTML={{__html: this.state.body}}></div>
            </section>
        )
    }
}
