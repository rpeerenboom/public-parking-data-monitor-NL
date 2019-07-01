import React, { Component } from 'react';
import './SideBar.css';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import LogoImg from './images/logo.png';

class SideBar extends Component {

  constructor(props) {
    super(props);
    this.initFilters();
    this.state = {
      checked: [],
      expanded: [],
    };
    this.handleVisibleFacilities = this.handleVisibleFacilities.bind(this);
    this.handleInformation = this.handleInformation.bind(this);
    this.handleExtras = this.handleExtras.bind(this);

    //this.handleInformationCapacity = this.handleInformationCapacity.bind(this)
  }

  initFilters() {
    this.visibleFacilities = ["parkAndRide", "terrain", "garage", "carpool", "onstreet"];
    //this.visibleFacilities = ["parkAndRide", "terrain", "garage", "carpool", "onstreet", "otherPlaces"];
    this.information = {}; // {"capacity": "", "tariffs": "", "restrictions": "", "openingTimes":"", "contactPersons":"", "accessPoint":""};
    this.extras = ["noDynamic", "private", "public"];

  }

  componentDidMount() {
    var coll = document.getElementsByClassName("collapsible");
    var i;

    for (i = 0; i < coll.length; i++) {
      coll[i].addEventListener("click", function () {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.display === "block") {
          content.style.display = "none";
        } else {
          content.style.display = "block";
        }
      });
    }
  }

  handleVisibleFacilities(event) {
    const target = event.target;
    const name = target.name;
    let temp = this.visibleFacilities;




    var index = temp.indexOf(name);    // <-- Not supported in <IE9
    if (index !== -1) {
      temp.splice(index, 1);
    }

    else {
      temp.push(name)
    }
    this.visibleFacilities = temp;
    console.log(temp)



    if (this.props.onChangeVisFacilities)
      this.props.onChangeVisFacilities(temp)
  }
  handleExtras(event) {
    const target = event.target;
    const name = target.name;
    let temp = this.extras;

    var index = temp.indexOf(name);    // <-- Not supported in <IE9
    if (index !== -1) {
      temp.splice(index, 1);
    }

    else {
      temp.push(name)
    }
    this.extras = temp;

    if (this.props.onChangeExtras)
      this.props.onChangeExtras(temp)
  }


  handleInformation(event) {
    const target = event.target.children[0];
    const value = target.value;
    const name = target.name;
    let temp = this.information;

    console.log(name);

    if(value !== "unknown"){
      temp[name] = value;
    }else {
      delete temp[name];
    }


    this.information = temp;




    if (this.props.onChangeInformation)
      this.props.onChangeInformation(temp)


  }

  handleInformationCapacity(event) {
    const target = event.target;
    const value = target.value
    const name = target.name;
    let temp = this.information;
    console.log("aaaaaaaaaaaaaaaaaaaa")




    /*var index = temp.indexOf(name);    // <-- Not supported in <IE9
        if (index !== -1) {
            temp.splice(index, 1);
        }

        else {
            temp.push(name)
        }*/
    temp[name] = value
    this.information = temp;
    console.log(this.information)




    if (this.props.onChangeInformation)
      this.props.onChangeInformation(temp)


  }



  renderedSideBar() {

  }

  render() {
    return (
      // side bar
      // content


      <div className="sideBar notPrintable">
        <h1 className="title">Open Parking</h1>
        <img id="logo" src={LogoImg} alt="logo" width="31" height="40"></img>
        <hr></hr>
        <h4 className="title">Facility Types</h4>
        <div>
          <input className="styled-checkbox" type="checkbox" id="parkAndRide" name="parkAndRide"
            value="parkAndRide" onChange={this.handleVisibleFacilities} defaultChecked={true} />
          <label htmlFor="parkAndRide">Park + Ride</label>
        </div>
        <div>
          <input className="styled-checkbox" type="checkbox" id="terrain" name="terrain"
            value="terrain" onChange={this.handleVisibleFacilities} defaultChecked={true}/>
          <label htmlFor="terrain">Terrain</label>
        </div>
        <div>
          <input className="styled-checkbox" type="checkbox" id="garage" name="garage"
            value="garage" onChange={this.handleVisibleFacilities} defaultChecked={true} />
          <label htmlFor="garage">Garage</label>
        </div>
        <div>
          <input className="styled-checkbox" type="checkbox" id="carpool" name="carpool"
            value="carpool" onChange={this.handleVisibleFacilities} defaultChecked={true} />
          <label htmlFor="carpool">Carpool</label>
        </div>
        <div>
          <input className="styled-checkbox" type="checkbox" id="onstreet" name="onstreet"
            value="onstreet" onChange={this.handleVisibleFacilities} defaultChecked={true} />
          <label htmlFor="onstreet">Onstreet</label>
        </div>
        <div>
          <input className="styled-checkbox" type="checkbox" id="otherPlaces" name="otherPlaces"
            value="otherPlaces" onChange={this.handleVisibleFacilities} defaultChecked={false} />
          <label htmlFor="otherPlaces">Other</label>
        </div>

        <h4 className="title">Filter Information</h4>
        <div className="text-right">
          <span className="faicons" data-tooltip="Remove data with unavailable attribute" data-tooltip-position="top"><i className="fa fa-times"></i></span>
          <span className="faicons" data-tooltip="Show all data" data-tooltip-position="top"><i className="fa fa-minus"></i></span>
          <span className="faicons" data-tooltip="Remove data with available attribute" data-tooltip-position="top"><i className="fa fa-check"></i></span>
        </div>
        <div className="three-states-group">
          <label htmlFor="capacity">Capacity</label>
          <div className="btn-group-sm btn-group-toggle float-right" data-toggle="buttons">
            <label className="btn btn-danger ml-2 mr-2 p-2"  onClick={this.handleInformation}><input type="radio" name="capacity" value="false"/></label>
            <label className="btn btn-secondary ml-2 mr-2 p-2 active" onClick={this.handleInformation}><input type="radio" name="capacity" value="unknown" defaultChecked/></label>
            <label className="btn btn-info ml-2 mr-2 p-2" onClick={this.handleInformation}><input type="radio" name="capacity" value="true"/></label>
          </div>
        </div>
        <div className="three-states-group">
          <label htmlFor="tariffs">Tariffs</label>
          <div className="btn-group-sm btn-group-toggle float-right" data-toggle="buttons">
            <label className="btn btn-danger ml-2 mr-2 p-2" onClick={this.handleInformation}><input type="radio" name="tariffs" value="false"/></label>
            <label className="btn btn-secondary ml-2 mr-2 p-2 active" onClick={this.handleInformation}><input type="radio" name="tariffs" value="unknown" defaultChecked/></label>
            <label className="btn btn-info ml-2 mr-2 p-2" onClick={this.handleInformation}><input type="radio" name="tariffs" value="true"/></label>
          </div>
        </div>
        <div className="three-states-group">
          <label htmlFor="restrictions">Height Rest.</label>
          <div className="btn-group-sm btn-group-toggle float-right" data-toggle="buttons">
            <label className="btn btn-danger ml-2 mr-2 p-2" onClick={this.handleInformation}><input type="radio" name="restrictions" value="false"/></label>
            <label className="btn btn-secondary ml-2 mr-2 p-2 active" onClick={this.handleInformation}><input type="radio" name="restrictions" value="unknown"/></label>
            <label className="btn btn-info ml-2 mr-2 p-2" onClick={this.handleInformation}><input type="radio" name="restrictions" value="true"/></label>
          </div>
        </div>
        <div className="three-states-group">
          <label htmlFor="openingTimes">Opening Times</label>
          <div className="btn-group-sm btn-group-toggle float-right" data-toggle="buttons">
            <label className="btn btn-danger ml-2 mr-2 p-2" data-tooltip-position="top" onClick={this.handleInformation}><input type="radio" name="openingTimes" value="false"/></label>
            <label className="btn btn-secondary ml-2 mr-2 p-2 active" onClick={this.handleInformation}><input type="radio" name="openingTimes" value="unknown" defaultChecked/></label>
            <label className="btn btn-info ml-2 mr-2 p-2" data-tooltip-position="top" onClick={this.handleInformation}><input type="radio" name="openingTimes" value="true"/></label>
          </div>
        </div>
        <div className="three-states-group">
          <label htmlFor="contactPersons">Contact Person</label>
          <div className="btn-group-sm btn-group-toggle float-right" data-toggle="buttons">
            <label className="btn btn-danger ml-2 mr-2 p-2" data-tooltip-position="top" onClick={this.handleInformation}><input type="radio" name="contactPersons" value="false"/></label>
            <label className="btn btn-secondary ml-2 mr-2 p-2 active" onClick={this.handleInformation}><input type="radio" name="contactPersons" value="unknown" defaultChecked/></label>
            <label className="btn btn-info ml-2 mr-2 p-2" data-tooltip-position="top" onClick={this.handleInformation}><input type="radio" name="contactPersons" value="true"/></label>
          </div>
        </div>
        <div className="three-states-group">
          <label htmlFor="accessPoints">Access point</label>
          <div className="btn-group-sm btn-group-toggle float-right" data-toggle="buttons">
            <label className="btn btn-danger ml-2 mr-2 p-2" data-tooltip-position="top" onClick={this.handleInformation}><input type="radio" name="accessPoints" value="false"/></label>
            <label className="btn btn-secondary ml-2 mr-2 p-2 active" onClick={this.handleInformation}><input type="radio" name="accessPoints" value="unknown" defaultChecked/></label>
            <label className="btn btn-info ml-2 mr-2 p-2" onClick={this.handleInformation}><input type="radio" name="accessPoints" value="true"/></label>
          </div>
        </div>
        <div className="three-states-group">
          <label htmlFor="dynamic">Dynamic data</label>
          <div className="btn-group-sm btn-group-toggle float-right" data-toggle="buttons">
            <label className="btn btn-danger ml-2 mr-2 p-2" onClick={this.handleInformation}><input type="radio" name="dynamic" value="false"/></label>
            <label className="btn btn-secondary ml-2 mr-2 p-2 active" onClick={this.handleInformation}><input type="radio" name="dynamic" value="unknown" defaultChecked/></label>
            <label className="btn btn-info ml-2 mr-2 p-2" onClick={this.handleInformation}><input type="radio" name="dynamic" value="true"/></label>
          </div>
        </div>

        <h4 className="title">Ownership</h4>

        <div>
          <input className="styled-checkbox-extra" type="checkbox" id="private" name="private"
            value="private" onChange={this.handleExtras} defaultChecked={true} />
          <label htmlFor="private">Conditional</label>
        </div>
        <div>
          <input className="styled-checkbox-extra" type="checkbox" id="public" name="public"
            value="public" onChange={this.handleExtras} defaultChecked={true} />
          <label htmlFor="public">Public</label>
        </div>

        <h4 className="title">Downloads</h4>
        <div>
          <ul>
            <li><a href="//data.openparking.nl/index/index.php" target="_blank" rel="noopener noreferrer">Download latest parkeerdata index</a></li>
            <li><a href="//data.openparking.nl/downloads/Gebruikshandleiding_openparking.nl_20190212.pdf" target="_blank" rel="noopener noreferrer">Gebruikshandleiding openparking.nl</a></li>
            <li><a href="//data.openparking.nl/downloads/Handreiking_kwaliteitsverbetering_Parkeerdata_20190212.pdf" target="_blank" rel="noopener noreferrer">Handreiking kwaliteitsverbetering Parkeerdata</a></li>
            <li><a href="//data.openparking.nl/downloads/Standard_for_the_Publication_of_Dynamic_Parking_Data_v2.0.pdf" target="_blank" rel="noopener noreferrer">Standard for the Publication of Dynamic Parking Data v2.0</a></li>
            <li><a href="//data.openparking.nl/downloads/MuConsult_2018_Rapport_Maastchappelijke_Baten_Open_Parkeerinformatie.pdf" target="_blank" rel="noopener noreferrer">Rapport Maastchappelijke Baten Open Parkeerinformatie</a></li>
          </ul>
        </div>
      </div>
    );
  }
}

export default SideBar;
