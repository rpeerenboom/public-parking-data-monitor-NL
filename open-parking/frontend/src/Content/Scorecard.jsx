//import React, { Component } from 'react';
import { Component } from 'react';
import 'react-table/react-table.css'
//import { Table } from 'reactstrap';
import './Scorecard.css'

require('whatwg-fetch') //browser only!

//const levels = ["country", "region", "province", "city", "facility"];

class Scorecard extends Component {

  constructor(props) {
    super(props);
    this.level = 0
    this.treemapData = []
    this.requiredAttr = ["longitude", "tariffs", "contactPersons", "parkingRestrictions", "capacity", "openingTimes"]
    this.state = ({ level: 0, treemapData: null, stackedTree: [] })  // default = land
    this.currentName = "summary/country/nl"
  }

  componentDidMount() {
    console.log("Mounted")
  }

  componentDidUpdate(nextProps){
    console.log("Updated")
  }

  onZoomChange(name, forceLevel) {
    console.log("ZoomChanged")
  }

  render() {
    return (
      "Soon"
    );
  }
}

export default Scorecard;
