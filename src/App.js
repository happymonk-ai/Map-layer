import React from 'react';
import DeckGL from '@deck.gl/react';
import { RenderLayers } from "./deck.gl-layer.jsx";

//import GeoJsonLayer from '@deck.gl/react';
//import {LineLayer} from '@deck.gl/layers';
import {StaticMap} from 'react-map-gl';

//import  MapContext from 'react-map-gl';
//import {MapView, FirstPersonView} from '@deck.gl/core';
//import {GPUGridLayer} from '@deck.gl/aggregation-layers';
import { AmbientLight, PointLight, LightingEffect } from "@deck.gl/core";
import axios from "axios";
const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json";
const MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoidmFpc2huYXZpYm9qZTI2OTkiLCJhIjoiY2tvOWtjMzNlMmdtdzJ4bHBpOHI3cmd5eiJ9.rku2cyii5TPTYMhzSpkzQA";
const INITIAL_VIEW_STATE = {
  longitude: 34.0479,
  latitude: 42.8333,
  zoom: 4,
  maxZoom: 16,
  minZoom: 4,
  pitch: 60,
  bearing: 5
};
const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0,
});


const pointLight1 = new PointLight({
  color: [255, 255, 255],
  intensity: 0.8,
  position: [-0.144528, 49.739968, 80000]
});

const pointLight2 = new PointLight({
  color: [255, 255, 255],
  intensity: 0.8,
  position: [-3.807751, 54.104682, 8000]
});


const lightingEffect = new LightingEffect({ambientLight, pointLight1, pointLight2});

const material = {
  ambient: 0.1,
  diffuse: 0.6,
  shininess: 32,
  specularColor: [60, 64, 70],
};
const DEFAULT_THEME = {
  buildingColor: [74, 80, 87],
  trailColor0: [253, 128, 93],
  trailColor1: [23, 104, 190],
  material,
  effects: [lightingEffect],
};
let data;

export default class App extends React.Component {
  state = {};
  constructor(props) {
    super();
    this.state = {
      data: [],
      hover: {
        x: 0,
        y: 0,
        hoveredObject: null
      }
    };
  }
  renderTooltip({ x, y, object, layer }) {
    this.setState({ hover: { x, y, layer, hoveredObject: object } });
}
  componentDidMount() {
    this.fetchData();
  }
  fetchData() {
    axios.all([
      axios.get('https://disease.sh/v2/countries?allowNull=false'),
    ]).then(axios.spread((World) => {
       data = World.data || [];
      data = data.map(function (location) {
        return {
          active: location.active,
          country: location.country,
          continent: location.continent,
          coordinates: [location.countryInfo.long, location.countryInfo.lat]
        };
      });
      data = data.filter(location => (location.continent === "Asia"));
      this.setState({ data: data });
    })).catch((error) => {
      console.log(error); return [];
    })
  }
 
  render() {
    const { hover, data } = this.state;

    console.log(data);
    return (
      <div>
    
     
      <DeckGL effects={DEFAULT_THEME.effects}  layers={RenderLayers({ data: data ,onHover: hover => this.renderTooltip(hover) })} initialViewState={INITIAL_VIEW_STATE} controller={true} >  <StaticMap reuseMaps
        mapStyle={MAP_STYLE}
        preventStyleDiffing={true}
        preserveDrawingBuffer={true}
        asyncRender={true}
        mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN} > 
               
      {hover.hoveredObject && (
          <div style={{
            position: "absolute",
            zIndex: 1000,
            background: "#ffffff",
            pointerEvents: "none",
            borderRadius: "5px",
            left: hover.x,
            top: hover.y
          }} >
            <ul className="hoveredObjectData">
              <li><h4>{hover.hoveredObject.country}</h4></li>
              <li>active cases: <span>{hover.hoveredObject.active.toLocaleString()}</span></li>
            </ul>
          </div>
        )
        }
        </StaticMap>
        </DeckGL>
      </div >
    );
  }
}


//ContextProvider={MapContext.Provider}