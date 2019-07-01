import React, { Component } from 'react';
import * as d3 from "d3";
import './Treemap.css'
//import ReactTable from 'react-table'
import 'react-table/react-table.css'
import Legend from './Legend'
//import ReactTooltip from 'react-tooltip'
//import { Table, Button, Container, Row } from 'reactstrap';
import { Table, Button } from 'reactstrap';

var colorDict = {
  "good": "goodBG",
  "average": "avgBG",
  "bad": "badBG"
}

const QUALITYDATA = ["bad", "average", "good"]
//const LEVELS = ["country", "region", "province", "city"]
var fieldsDict = []

class Treemap extends Component {

  constructor(props) {
    super(props);
    this.initFieldsDict();
    this.stackedTree = []
    this.reset = false
    this.goPrev = this.goPrev.bind(this)
    this.getCsv = this.getCsv.bind(this)
    //this.root = d3.hierarchy(data);
    this.requiredAttr = ["accessPoints", "tariffs", "contactPersons", "minimumHeightInMeters", "capacity", "openingTimes", "dynamicDataUrl"]
  }

  initFieldsDict() {
    fieldsDict["accessPoints"] = "Access point"
    fieldsDict["tariffs"] = "tarrifs"
    fieldsDict["contactPersons"] = "Contacts"
    fieldsDict["minimumHeightInMeters"] = "Height restrict. "
    fieldsDict["capacity"] = "max capacity"
    fieldsDict["openingTimes"] = "opening times"
    fieldsDict["dynamicDataUrl"] = "Dynamic Url"
    //fieldsDict["maturityLevelStatic"] = "Static mat lvl"
    //fieldsDict["maturityLevelDynamic"] = "Dynamic mat lvl"

  }

  componentDidMount() {
    if (this.props.data) {
      this.root = d3.hierarchy(this.props.data);
      this.drawMap(this.root)
    }
    /*let context = this;
    window.addEventListener("resize", function() {
      context.updateDimensions(context);
    });*/



  }

  updateDimensions(context) {
    console.log("Dimensions updated.. redrawing map..");
    if (context.props.data) {
      context.root = d3.hierarchy(context.props.data);
      context.drawMap(context.root)
    }
  }


  drawMap(data) {
    this.root = data
    if (!this.root)
      return


    d3.select('.heatMap').selectAll("*").remove()
    d3.select('svg').selectAll("*").remove()
    d3.select('svg').append('g')
    let svgGroup = d3.select('svg g')
    svgGroup.selectAll("*").remove();
    let thiss = this
    var treemap = d3.treemap()
    // treemap.tile(d3.treemapSquarify)
    treemap.tile(d3.treemapBinary)
    treemap.paddingOuter(5)

    //let svgW = d3.select('svg').node().getBBox()


    treemap.size([document.documentElement.clientWidth * .8
      , document.documentElement.clientHeight * 0.8])
      .paddingTop(20)
      .paddingInner(2);

    this.root.sum(function (d) {
      return d.value;
    })

    treemap(this.root);

    // "parent"-rectangles
    let nodes = d3.select('svg g')
      .selectAll('g')
      .data(this.root.descendants())
      .enter()
      .append('g')
      .attr('transform', function (d) { return 'translate(' + [d.x0, d.y0] + ')' })
      .on('click', d => thiss.listenForZooms(d.data.name, d.parent))
    //.on('mouseOn', d => thiss.setHover(d.data.name, d.parent))
    //.onmouseout, deletehover

    let dict = {}
    //children
    nodes
      .append('rect')
      .attr('width', function (d) {
        dict[d.data.name] = d.x1 - d.x0
        return d.x1 - d.x0;
      })
      .attr('height', function (d) { return d.y1 - d.y0; })
      .attr('class', d => thiss.getColorByName(d.data.name))
      .attr('id', d => this.getId(d.data.name))
      .on("mouseover", d => { thiss.handleMouseOverNode(null, d.data.name, d.parent) })
      .on("mouseout", d => thiss.handleMouseOutNode(null, d.data.name, d.parent))

    nodes
      .append('text')
      .attr('id', d => thiss.getId(d.data.name) + "text")
      .attr('dx', 4)
      .attr('style', "color:blue;")
      .attr('dy', 14)
      .attr('width', function (d) { return dict[d]; })
      .attr('height', function (d) { return d.y1 - d.y0; })
      .text(function (d) {

        if (["bad", "average", "good"].indexOf(d.data.name) < 0) {

          let dataname = d.data.name
          if (d.data.name === null)
            dataname = "Unknown"
          while (thiss.textSize(dataname).width > dict[d.data.name]) {
            dataname = dataname.substring(0, dataname.length - 1)
          }
          return dataname;
        }
        else{
          let value = d.data.value !== 0 ? d.data.value : ""

          return "" + value
        }
      })
  }

  handleMouseOverNode(obj, name, parent) {

    let rect = d3.select("#" + this.getId(name))
    let text = d3.select("#" + this.getId(name) + "text")

    if (QUALITYDATA.indexOf(name) > -1 && parent !== null && parent.data !== null && parent.data.name !== null) { //if mark is hovered
      // handle parent
      rect = d3.select("#" + this.getId(parent.data.name))
      text = d3.select("#" + this.getId(parent.data.name) + "text")
    }


    rect.attr("stroke", "#1111FF")
      .attr("stroke-width", 5)

    text.attr("font-weight", "bold")


  }

  getId(name) {

    if (name) {
      return name.split("'").join("_").split(" ").join("_").split("'").join("");

    }
    return ""


  }

  handleMouseOutNode(obj, name, parent) {

    let rect = d3.select("#" + this.getId(name))
    let text = d3.select("#" + this.getId(name) + "text")

    if (QUALITYDATA.indexOf(name) > -1 && parent !== null && parent.data !== null && parent.data.name !== null) {
      // handle parent
      rect = d3.select("#" + this.getId(parent.data.name))
      text = d3.select("#" + this.getId(parent.data.name) + "text")
    }


    rect.attr("stroke-width", 1)
      .attr("stroke", "#000000")
    text.attr("font-weight", "normal")


  }


  wrap(width, padding) {
    var self = d3.select(this),
      textLength = self.node().getComputedTextLength(),
      text = self.text();
    while (textLength > (width - 2 * padding) && text.length > 0) {
      text = text.slice(0, -1);
      self.text(text + '...');
      textLength = self.node().getComputedTextLength();
    }
  }



  textSize(text) {
    if (!d3) return;
    var container0 = d3.select('body').append('div')
    var container = container0.append('svg');
    container.append('text').attr("x", -0).attr("y", -0).text(text);
    var size = container.node().getBBox();
    container0.remove();
    return { width: size.width, height: size.height };
  }


  notEmptyArray(v) {


    return (v !== "[]")
  }


  getColorByName(name) {
    return colorDict[name]
  }

  listenForZooms(name, parent = null) {

    if (["bad", "average", "good"].indexOf(name) > -1) {
      name = parent.data.name
    }
    if (this.props.onZoomChange) {
      this.stackedTree.push({ "data": this.props.data, "name": this.props.data.name })
      if (this.props.level !== 3) {

        this.props.onZoomChange(name)
      }
      else {
        this.props.onZoomChange(name, 3)
      }

    }
  }

  drawMapView(data) {
    this.generateTable(data)
  }

  generateBreadCrums(data, level) {

  }

  goPrev() {

    if (this.props.onDezoom) {
      this.props.onDezoom(this.reset)
    }

  }

  getCsv() {
    console.log(this.props);
    //lets build an URL
    let Url = "//data.openparking.nl/csv/fetch.php?level=" + this.props.level;
    let visFacilities = this.props.filters.visFacilities.join();
    Url += "&filters=" + visFacilities;
    let extras = this.props.filters.extras.join();
    Url += "&extras=" + extras;
    let name = this.props.data.name;
    Url += "&name=" + name;
    let information = JSON.stringify(this.props.filters.information);
    if (information !== undefined) {
      Url += "&information=" + information;
    }
    window.open(Url, "_blank");
  }


  getTitleDict(str) {

    if (str === "nl")
      return "The Netherlands"
    else if (str === "region/none")
      return "Facilities with no location"

    return str

  }

  render() {

    let breadCrums = "Loading data..."
    let buttonZoomOut = null
    let noButton = null
    let csvButton = null


    if (this.props.data /*&& this.props.level && this.props.level !== 3*/) {


      if (!this.props.level || this.props.level !== 3) {
        breadCrums = this.generateBreadCrums(this.props.data, this.props.level)
        this.drawMap(d3.hierarchy(this.props.data))
      }
      else if (this.props.level && this.props.level === 3) {
        this.drawMapView(this.props.data) //heatmap
      }

      if (this.props.data.name) {
        breadCrums = this.props.data.name
      }

      if (breadCrums !== "Loading data..." && this.props.level > 0 ) {
        buttonZoomOut = (<Button outline color="primary" onClick={this.goPrev}>Zoom out</Button>)
      }

      breadCrums = this.getTitleDict(breadCrums)

      if (this.props.data.name === "region/none") {
        this.reset = true
      }
      else {
        this.reset = false
      }

      if(this.reset !== true){
        noButton  = <Button outline color="primary" onClick={this.setReset.bind(this)}>no location</Button>
        csvButton = <Button outline color="primary" onClick={this.getCsv}>get csv</Button>
      } else {
        csvButton = <Button outline color="primary" onClick={this.getCsv}>get csv</Button>
      }

    }
    return (
      <div>

        <div className="dashboard-head">

          <h1>{breadCrums}</h1>
          <div className="two-buttons">
            <div id="single-button">
              {buttonZoomOut}
            </div>
            <div id="single-button">
              { noButton}
            </div>
            <div id="single-button">
              { csvButton}
            </div>
          </div>
          <Legend />
        </div>

        <div className="dashboard-table {active}">
          <Table className="heatMap" width={0} />
        </div>

        <div className="dashboard-data">
          <svg className="TreemapData"  >
          </svg>
        </div>
      </div>
    );
  }


  generateTable(data) {


    d3.select(".heatMap").selectAll("*").remove()
    var table = d3.select('.heatMap')
    var thead = table.append('thead') // create the header
    var tbody = table.append('tbody');
    d3.select('svg').selectAll("*").remove()

    let columns = ["name"].concat(this.requiredAttr)
    //columns.push("maturityLevelStatic");
    //columns.push("maturityLevelDynamic");


    thead.append('tr')
      .selectAll('th')
      .data(columns).enter()
      .append('th')
      .attr("class", (d, i) => "th-" + d)
      .text(function (column) { return fieldsDict[column]; });

    this.setAllParkings(tbody, columns, data)
  }

  /**
   * TO DO: Catch wrong response / time out
   */
  async setAllParkings(tbody, column, data) {


    for (let i = 0; i < data.length; i++) {

      if (data[i].mark === "onstreet" || this.checkInformationFilters(data[i]))
        continue

      /*
       * accessPoints: true
       * capacity: 339
       * city: "Delft"
       * contactPersons: true
       * country_code: "nl"
       * dynamicDataUrl: "//www.mobdelft.nl/parkingdata/v2/dynamic/c4172abb-8ad1-446a-8c35-ddb310d1a0f9"
       * id: 1106
       * latitude: 52.014289
       * limitedAccess: false
       * longitude: 4.365997
       * mark: "good"
       * minimumHeightInMeters: 2.2
       * name: "Garage Markt (Delft)"
       * openingTimes: true
       * province: "Zuid-Holland"
       * region: "Zuidwest-Nederland"
       * staticDataUrl: "https://npropendata.rdw.nl/parkingdata/v2/static/c4172abb-8ad1-446a-8c35-ddb310d1a0f9"
       * tariffs: true
       * usage: "garage"
       * uuid: "c4172abb-8ad1-446a-8c35-ddb310d1a0f9"
       * */
      // accessPoints, capacity, minimumHeightInMeters, openingTimes, tariffs, contactPersons
      let staticFields = ["accessPoints", "capacity", "minimumHeightInMeters", "openingTimes", "tariffs", "contactPersons"]
      let staticCount = 0;
      for (var j = 0; j < staticFields.length; j++) {
        if (data[i][staticFields[j]] === true || data[i][staticFields[j]] > 0) {
          staticCount++;
        }
      }
      data[i].maturityLevelStatic = staticCount

      let resultJson = data[i]

      //generate row
      this.generateRow(tbody, column, resultJson, data[i]["longitude"], data[i].mark)

    }

  }

  /**
    Only show the facilities with the required stuff */
  checkInformationFilters(node) {
    let required = this.props.filters.information
    if (required && required.length > 0) { //check if all checked are included

      for (let i = 0; i < required.length; i++) {

        if (["capacity", "minimumHeightInMeters"].indexOf(required[i]) > -1) {// special treatment
          // if empty return true
        }
      }

      //everthing is included
      return false

    }
    return false // nothing is required or all required fields are included

  }

  setReset() {

    if (this.props.setReset) {
      this.props.setReset();
    }
  }

  createTextTool(text) {

    /*    var div = d3.select("body").append("div").html(text)
                .attr("class", "tooltip")
                .style("opacity", 1)
                .style("left", (d.y+120) + "px")
                .style("top", (d.x-20) + "px")



        return  div*/
  }
  generateRow(tbody, columns, data, longitude, mark = "") {

    // data = JSON.parse(data)
    let tr = tbody.append('tr')
    let v = ""

    if (!data) {
      return
    }

    for (let j = 0; j < columns.length; j++) {
      let classN = ""
      if (columns[j] === "name") {

        classN += " heatCellName"//normal cell
        classN += " nameBorder" + mark
        tr.append('td')
          .attr("class", classN)
          .attr("data-tip", "")
          .attr("data-for", data[columns[j]])
          .append('a')
          .attr("href", "//api.openparking.nl/parkingdata/html/" + data["uuid"])
          .attr("target", "_blank")
          .text(data[columns[j]])
        // .on("mouseover", d => {thiss.handleMouseOverTd(data[columns[j]], this)})


      }
      else if (columns[j] === "maturityLevelStatic") {
        classN += " heatCell "
        let t = "3";
        v = this.getValueJsonResult(columns[j], data)

        if (v && this.notEmptyArray(v) && v === 0) {
          classN += " maturity0"
          t = "0"
        }
        else if (v && this.notEmptyArray(v) && v > 0 && v <= 2) {
          classN += " maturity1"
          t = "1"
        }
        else if (v && this.notEmptyArray(v) && v > 2 && v <= 5) {
          classN += " maturity2"
          t = "2"
        }
        else if (v && this.notEmptyArray(v) && v === 6 ) {
          classN += " maturity3"
          t = "3"
        } else {
          classN += " maturity0"
          t = "0"
        }

        tr.append('td')
          .attr("class", classN)
          .text(t)


      }

      else if (columns[j] === "maturityLevelDynamic") {
        classN += " heatCell "
        v = this.getValueJsonResult("dynamicDataUrl", data)
        let t = "3"


        if (v && this.notEmptyArray(v) && v !== undefined) {
          classN += " maturity3"
        }
        else {
          classN += " maturity0"
          t = "0"
        }

        tr.append('td')
          .attr("class", classN)
          .text(t)


      }
      else if (columns[j] === "longitude") {

        classN += " heatCell"//colored heatcell
        classN += ((longitude !== null) ? " validCell" : " invalidCell") // is this field in the json?
        tr.append('td')
          .attr("class", classN)

          .text("" + longitude)
      }
      else {
        classN += " heatCell "
        v = this.getValueJsonResult(columns[j], data)


        if (v && this.notEmptyArray(v) && v !== false) {
          classN += " validCell"  // is this field in the json?
        }
        else {
          classN += " invalidCell"  // is this field in the json?
        }

        if(columns[j] === "dynamicDataUrl" && classN === "validCell"){
          v = "<a href='" + v + "'>Available</a>"
        }

        tr.append('td')
          .attr("class", classN)
          .text(v)

      }
    }

  }


  getValueJsonResult(key, node) {

    return node[key]

    /*if ((key === "capacity" || key === "minimumHeightInMeters")
                && node && node["specifications"]
                && node["specifications"].length > 0) {

            let nodeCapacity = node["specifications"][0]

            if (!nodeCapacity)
                return null

            if (nodeCapacity[key]) {
                return nodeCapacity[key]

            }
            return null // No capacity found

        }
        else {

            try {

                return (JSON.stringify(node[key]))
            }
            catch (e) {
                console.log(e)
                return null // not found
            }
        }*/
  }
}

export default Treemap;
