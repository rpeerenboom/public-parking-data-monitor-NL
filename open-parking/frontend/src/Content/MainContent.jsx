import React, { Component } from 'react';
import MapContent from './MapContent';
import Dashboard from './Dashboard'
//import Scorecard from './Scorecard'
import MainNav from '../MainNav/MainNav';
import './MainContent.css'


class MainContent extends Component {

  constructor(props){
    super(props);
    this.state = {typeView: "" }
  }

  componentDidMount(){

  }

  render() {

    let tab = "map"
    if(this.state.tab){
      tab = this.state.tab
    }

    //lol, i know it's ugly
    let contentVis = (<MapContent filters={this.props.filters}/>);
    if(tab === "dash"){
      console.log("Loading Dashboard..");
      contentVis = <Dashboard filters={this.props.filters}/>
        //} else if(tab === "score") {
        //    console.log("Loading Scorecard..");
        //contentVis = <Scorecard filters={this.props.filters}/>
    }

    return (
      <div className="MainContent printable" >

        <MainNav onChangeContent={this.handleNavigation.bind(this)} />

        <div className="mainChild">
          {contentVis}
        </div>
      </div>
    );
  }

  handleNavigation(value){
    this.setState({tab: value})
  }
}

export default MainContent;
