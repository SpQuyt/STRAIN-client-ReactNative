import React, { Component } from 'react';
import { Text, View, StyleSheet, ImageBackground, TouchableOpacity, Image } from 'react-native';
import { Constants } from 'expo';

export default class HomeScreen extends Component {
  render() {
    return (
      <View style={styles.container}>
        <ImageBackground
          source = {require ('./assets/bg.jpg')}
          style = {{height: '110%', width: '100%', alignItems: "center", justifyContent: "center"}}>
            <View>
                <TouchableOpacity
                    onPress = {() => this.props.navigation.navigate('Camera')}>
                    {/* <Text
                     style = {{
                        fontSize: 25,
                        fontWeight: "bold",
                        color: 'white'
                     }}>START</Text> */}
                     <Image
                        source = {require('./assets/start2.png')}
                        style = {{width: 150, height: 48}}>
                    </Image>
                </TouchableOpacity>
            </View>
        </ImageBackground>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: 'transparent',
  },
  button: {
    padding: 10,
    backgroundColor: "green",
  },
});