import "core-js/es7/array";
import "core-js/es7/object";
import React, { Component } from 'react';
import './App.css';
import SideBar from './SideBar/SideBar';
import MainContent from './Content/MainContent'
import 'bootstrap/dist/css/bootstrap.min.css';

class App extends Component {

  constructor(props){
    super(props);
    //this.handleNavigation = this.handleNavigation.bind(this)
    this.state = { mainContent: "map",
                    _visFacilities: ["parkAndRide", "terrain", "garage", "carpool", "onstreet", "otherPlaces"],
                    visFacilities: ["parkAndRide", "terrain", "garage", "carpool", "onstreet"],
                    information: {},
                    extras: ["noDynamic", "private", "public"]
  }
  }

  onChangeVisFacilities(values){
    this.setState({
      visFacilities: values
    })

  }
  onChangeInformation(values){
      this.setState({
          information: values
      })
  }
  onChangeExtras(values){
      this.setState({
          extras: values
      })
  }


  render() {
    return (
     <div className="App">
        <div>
          <SideBar onChangeVisFacilities={this.onChangeVisFacilities.bind(this)} onChangeInformation={this.onChangeInformation.bind(this)} onChangeExtras={this.onChangeExtras.bind(this)} />
          <MainContent tab={this.state.mainContent} filters={{"visFacilities": this.state.visFacilities, "information": this.state.information, "extras": this.state.extras}} />
        </div>
      </div>
    );
  }
}

export default App;
