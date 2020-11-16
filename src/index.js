import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import { Panel } from './components/panel/component';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: {
                'home': { title: '', body: ' '},
                'what-we-do': { title: '', body: ' '},
                'who-we-are': { title: '', body: ' '},
                'opportunities': { title: '', body: ' '}
            }
        }
    }

    componentDidMount() {
        fetch(`https://us-central1-parallel-site.cloudfunctions.net/cms-get?type=pages`)
            .then(response => response.json())
            .then(response => {
                this.setState({ data: response.data });
            })
            .catch(error => console.error(error))
    }

    render() {
        return (
            <main>
                <Panel title={this.state.data.home.title} body={this.state.data.home.html} color='purple' />
                <Panel title={this.state.data['what-we-do'].title} body={this.state.data['what-we-do'].html} color='orange' />
                <Panel title={this.state.data['who-we-are'].title} body={this.state.data['who-we-are'].html} color='pink' />
                <Panel title={this.state.data.opportunities.title} body={this.state.data.opportunities.html} color='purple' />
            </main>
        )
    }
}

ReactDOM.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>,
    document.getElementById('parallel')
);
