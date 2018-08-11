import CameraScreen from './Camera';
import ChartScreen from './Chart';
import GalleryScreen from "./Gallery"
import PhotoScreen from './Photo';
import HomeScreen from './Home';
import {createStackNavigator} from 'react-navigation';
import React from 'react';

//initialize all screens and navigations in app

const RootStack = createStackNavigator(
    {
      Camera: CameraScreen,
      Chart: ChartScreen,
      Gallery: GalleryScreen,
      Photo: PhotoScreen,
      Home: HomeScreen,
    },
    {
      initialRouteName: 'Home',               //1st screen will be HomeScreen
      headerMode: 'none',
    }
  );
  
  export default class App extends React.Component {
    render() {
      return <RootStack />;
    }
  }