import React, { Fragment, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import { Panel } from './components/panel/component';
import styles from "./styles";

ReactDOM.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>,
    document.getElementById('parallel')
);

function App (props) {
    var [home, setHome] = useState({ title: '', body: '', index: 0});
    var [what, setWhat] = useState({ title: '', body: '', index: 1});
    var [who, setWho] = useState({ title: '', body: '', index: 2});
    var [opp, setOpp] = useState({ title: '', body: '', index: 3});
    var [activePanel, setActivePanel] = useState(0);
    var [panels, setPanels] = useState([]);

    useEffect(addListeners, []);
    useEffect(fetchData, []);

    function addListeners() {
        window.addEventListener('scroll', onScroll);
        window.addEventListener('keyup', onPress);

        return removeListeners;
    }

    function removeListeners() {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('keyup', onPress);
    }

    function fetchData() {
        fetch(`https://us-central1-parallel-site.cloudfunctions.net/cms-get?type=pages`)
            .then(response => response.json())
            .then(response => {
                let data = response.data;

                setHome({ title: data.home.title, body: data.home.html })
                setWhat({ title: data['what-we-do'].title, body: data['what-we-do'].html })
                setWho({ title: data['who-we-are'].title, body: data['who-we-are'].html })
                setOpp({ title: data.opportunities.title, body: data.opportunities.html })
            })
            .catch(error => console.error(error))
    }

    function switchPanel (to, dir) {

    }

    function onScroll(event) {
        console.log('event');
    }

    function onPress(event) {
        if (event.key == 'ArrowDown') {
            console.log('Move Down');

            setActivePanel()
        }

        if (event.key == 'ArrowUp') {
            console.log('Move Up');
        }
    }

    return (
        <Fragment>
            <Panel title={home.title} body={home.body} color='purple' row='1' />
            <Panel title={what.title} body={what.body} color='orange' row='2' />
            <Panel title={who.title} body={who.body} color='pink' row='3' />
            <Panel title={opp.title} body={opp.body} color='purple' row='4' />
        </Fragment>
    )
}
