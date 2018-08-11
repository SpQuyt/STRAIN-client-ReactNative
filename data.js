import React, { Component } from 'react';
import { Text, View, Button, TouchableOpacity, TextInput, StyleSheet, CameraRoll } from 'react-native';
import { AreaChart, LineChart, Grid, XAxis, YAxis } from 'react-native-svg-charts';
import {Defs, LinearGradient, Stop, G, Line} from 'react-native-svg'
import { Ionicons, Foundation, MaterialCommunityIcons, MaterialIcons, Entypo } from "react-native-vector-icons";
import {takeSnapshotAsync} from 'expo';
import * as shape from 'd3-shape';
import Modal from 'react-native-modalbox';

changeScreenOrientationLand = () => {
  Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.LANDSCAPE);
}
changeScreenOrientationPort = () => {
  Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.PORTRAIT);
}

var xval = []
var yval = []
var data = []
var obj = {
    xvalue: null,
    yvalue: null,
}

const CustomGrid = ({ x, y, data, ticks }) => (
    <G>
        {
            // Horizontal grid
            ticks.map(tick => (
                <Line
                    key={ tick }
                    x1={ '0%' }
                    x2={ '100%' }
                    y1={ y(tick) }
                    y2={ y(tick) }
                    stroke={ 'rgba(0,0,0,0.2)' }
                />
            ))
        }
        {
            // Vertical grid
            data.map((_, index) => (
                <Line
                    key={ index }
                    y1={ '0%' }
                    y2={ '92%' }
                    x1={ x(_) }
                    x2={ x(_) }
                    stroke={ 'rgba(0,0,0,0.2)' }
                />
            ))
        }
    </G>
)

const Gradient = () => (
    <Defs key={'gradient'}>
        <LinearGradient id={'gradient'} x1={'0'} y={'0%'} x2={'100%'} y2={'0%'}>
            <Stop offset={'0%'} stopColor={'rgb(134, 65, 244)'}/>
            <Stop offset={'100%'} stopColor={'rgb(66, 194, 244)'}/>
        </LinearGradient>
    </Defs>
)

export default class ChartScreen extends Component {
    state = {
        visible: false,
        key: "",
        image: "",
        savePermission: 0,
        loading: 0,
    }

    componentWillMount() {
        this.setState({loading: 1})         //fetch data from server
        xval = []
        yval = []
        data = []
        fetch('http://192.168.1.208:8000/up', {
            method: 'GET'
        })
        .then((response) => response.json())
        .then((responseJson) => {
            // for (i = 0; i < responseJson.xval.length; i++){
                // xval.push(responseJson.xval[i])
                // yval.push(responseJson.yval[i])
            console.log(responseJson)
            for (i = 0; i < responseJson[0].length; i++){
                xval.push(responseJson[0][i])
                yval.push(responseJson[1][i])
            }
        })
        .then(() => {
            for (var k = 0; k < yval.length; k++){
                data.push({xvalue: xval[k], yvalue: yval[k]})
            }
            this.setState({loading: 0})
        })
        .catch((error) => {
            console.log(error)
            this.setState({loading: -1})
        });
    }

    onSave = () => {
        this.setState({key: ""})
        this.setState({savePermission: 1});
        this.renderButton();
        var snap = setTimeout(async () => {
            var response = await takeSnapshotAsync(this._container, {
                format: 'png',
                result: 'base64',
            });
            this.setState({image: response})
            // var response = await takeSnapshotAsync(this._container, {
            //     format: 'png',
            //     result: 'file',
            // });
            // console.log(response)
            // await CameraRoll.saveToCameraRoll(response, 'photo');
            clearTimeout(snap)
        }, 1000)
        var modal = setTimeout(() => {
            this.refs.modal.open()
            clearTimeout(modal)
        }, 1500)
    }

    renderButton() {
        if (this.state.savePermission != 1){
            return(
            <View 
                style = {{}}                 
                >
                <TouchableOpacity 
                    onPress={() => {
                        changeScreenOrientationPort()
                        this.props.navigation.goBack()
                    }}
                    style = {styles.button}>
                    <Entypo name = "back" size = {40} color = "gray"/>
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={() => {
                        changeScreenOrientationPort()
                        this.props.navigation.navigate('Gallery')
                    }}
                    style = {styles.button}>
                    <MaterialIcons name = "photo-library" size = {40} color = "blue"/>
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={this.onSave}
                    style = {styles.button}>
                    <Entypo name = "save" size = {40} color = "black"/>
                </TouchableOpacity>
            </View>
            )
        }
    }
    
    render() {  
        if (this.state.loading === 1) {
            return (
                <View
                    style = {{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <Text> LOADING...</Text>
                    <Button
                        style = {{}}
                        title="Cancel"
                        onPress={() => {
                            changeScreenOrientationPort()
                            this.props.navigation.goBack()
                        }}
                    />
                </View>
            )
        }

        else if(this.state.loading === -1){
            return (
                <View
                    style = {{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <Text> NETWORK ERROR.</Text>
                    <Button
                        style = {{}}
                        title="Go Back"
                        onPress={() => {
                            changeScreenOrientationPort()
                            this.props.navigation.goBack()
                        }}
                    />
                </View>
            )
        }
        
        else{
            return (      
                <View 
                    style={{ flex: 1, flexDirection: 'column'}}
                    >
                    <View style={{}}>
                        <Text
                            style={{fontStyle: "italic", color: "red"}}>
                                STRAIN
                        </Text>
                    </View>
                    <View 
                        style={{ flex: 1, padding: 20, margin: 10,  flexDirection: 'row'}}
                        ref={view => {
                            this._container = view;
                        }}>
                        <YAxis
                            style={{ marginBottom: 10}}
                            data={ data }
                            contentInset={ { top: 10, bottom: 10 } }
                            svg={{fontSize: 10, fill: 'black'}}
                            yAccessor={ ({ item }) => item.yvalue }
                            formatLabel={ (value) => value }
                            numberOfTicks = {10}
                        />
                        <View  style={{ flex: 1 , marginLeft: 10}}>
                            <LineChart
                                style={{ flex: 1 }}
                                data={ data }
                                svg={{  strokeWidth: 2, stroke: 'url(#gradient)',}}
                                xAccessor={ ({ item }) => item.xvalue }
                                yAccessor={ ({ item }) => item.yvalue }
                                contentInset={{ top: 10, bottom: 10 }}
                                curve={shape.curveNatural}
                            >
                                <CustomGrid belowChart={true}/>
                                <Gradient/>
                            </LineChart>
            
                            <XAxis
                                style={{ marginHorizontal: -10, height: 10 }}
                                data={ data }
                                contentInset={{ left: 10, right: 10 }}
                                xAccessor={ ({ item }) => item.xvalue }
                                formatLabel={ (value) => value }
                                numberOfTicks = {3}
                                svg={{ fontSize: 10, fill: 'black', fontWeight: 'bold' }}
                            />
                        </View>
                        {this.renderButton()}
                    </View>
                    <View style={{ alignItems: "flex-end", paddingRight: 10}}>
                        <Text
                            style={{fontStyle: "italic", color: "red"}}>
                                TIME
                        </Text>
                    </View>
                    <Modal
                            ref = {"modal"}
                            position = {"top"}
                            isDisable = {!this.state.visible}
                            backdropPressToClose = {false}
                            style = {{
                                alignItems: "center",
                                justifyContent: "center",
                                height: 250,
                                width: "100%"
                            }}
                            >
                            <TextInput
                                style={{
                                    height: 60,
                                    width: "100%",
                                    backgroundColor: "gray"
                                }}
                                placeholder= {"Enter ID here..."}
                                onChangeText={(text) => this.setState({key: text})}
                            />
                            <Button 
                                title="Save to Gallery"
                                onPress={() => {
                                    this.setState({visible: !this.state.visible}),
                                    this.setState({savePermission: 0})
                                    this.refs.modal.close()
                                    this.props.navigation.navigate('Gallery', {count: 0, base64: this.state.image, newkey: this.state.key, savePermission: 1});
                                }}
                            />
                        </Modal>
                </View>
            )
        }
       
    }
}

const styles = StyleSheet.create({
    cameraScreen: {
      flex: 1, 
      backgroundColor: "gray",
      padding: 0,
      margin: 0,
    },
    button: {
      flexDirection: "row",
      flex: 1/3,
      marginHorizontal: 2,
      marginTop: 5,
      padding: 5,
      alignItems: 'center',
      justifyContent: 'center', 
    },
    notCameraScreen: {
      backgroundColor: "gray",
      padding: 0,
      margin: 0,
    }
  });
