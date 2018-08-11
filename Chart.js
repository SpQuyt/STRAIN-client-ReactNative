import React, { Component } from 'react';
import { Text, View, Button, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator} from 'react-native';
import { AreaChart, LineChart, Grid, XAxis, YAxis } from 'react-native-svg-charts';
import {Defs, LinearGradient, Stop, G, Line} from 'react-native-svg'
import { Ionicons, Foundation, MaterialCommunityIcons, MaterialIcons, Entypo } from "react-native-vector-icons";
import {takeSnapshotAsync} from 'expo';
import * as shape from 'd3-shape';
import Modal from 'react-native-modalbox';

var xval = []
var yval = []
var data = []

// customize grid of chart
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
                    y2={ '100%' }
                    x1={ x(_) }
                    x2={ x(_) }
                    stroke={ 'rgba(0,0,0,0.2)' }
                />
            ))
        }
    </G>
)

// customize color of the chart's line
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
        visible: false,                                                 //for modal visibility
        key: "",                                                        //key input
        image: "",                                                      // image uri
        savePermission: 0,                                              // save permission to GalleryScreen
        loading: 0,                                                     // loading chart
        paddingR: 60                                                    //"TIME" axis
    }

    componentWillMount() {
        this.setState({loading: 1})         
        xval = []                                                       // reset all
        yval = []                                                       //
        data = []                                                       //
        fetch('http://192.168.1.208:8000/up', {                         //fetch data from server
            method: 'GET'
        })
        .then((response) => response.json())
        .then((responseJson) => {
            console.log(responseJson)
            for (i = 0; i < responseJson[0].length; i++){
                xval.push(responseJson[0][i])
                yval.push(responseJson[1][i])
            }
        })
        .then(() => {
            for (var k = 0; k < yval.length; k++){                      //push xval yval (strains and times) to data for drawing chart
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
        this.setState({key: "", savePermission: 1, paddingR: 5})            //paddingR to place "TIME" axis at the right-most while saving (screenshot)
        this.renderButton();                                                //before screenshot, must hide all other buttons
        var snap = setTimeout(async () => {                                 //wait for 1 sec and then screenshot, to avoid errors
            var response = await takeSnapshotAsync(this._container, {
                format: 'png',
                result: 'base64',
            });
            this.setState({image: response})
            clearTimeout(snap)
        }, 1000)
        var modal = setTimeout(() => {                                      //then open modal box for next steps
            this.refs.modal.open()
            clearTimeout(modal)
        }, 1500)
    }

    renderButton() {
        if (this.state.savePermission != 1){
            return(
            <View 
                style = {{alignItems: "center"}}                 
                >
                <View
                    style = {styles.button}
                >
                    <TouchableOpacity 
                        onPress={() => {
                            Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.PORTRAIT);
                            this.props.navigation.goBack()
                        }}
                        style = {{justifyContent: "center", alignItems: "center"}}
                    >
                        <Entypo name = "back" size = {40} color = "black"/>   

                        <Text
                            style = {{
                                paddingLeft: 10,
                                fontSize: 20}}
                        >
                            Back
                        </Text> 
                    </TouchableOpacity>
                </View>

                <View
                    style = {styles.button}
                >
                    <TouchableOpacity 
                        onPress={() => {
                            Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.PORTRAIT);
                            this.props.navigation.navigate('Gallery')
                        }}
                        style = {{justifyContent: "center", alignItems: "center"}}
                    >
                        <MaterialIcons name = "photo-library" size = {40} color = "black"/>   

                        <Text
                            style = {{
                                paddingLeft: 10,
                                fontSize: 20}}
                        >
                            Gallery
                        </Text> 
                    </TouchableOpacity>
                </View>

                <View
                    style = {styles.button}
                >
                    <TouchableOpacity 
                        onPress={this.onSave}
                        style = {{justifyContent: "center", alignItems: "center"}}
                    >
                        <Entypo name = "save" size = {40} color = "black"/>   

                        <Text
                            style = {{
                                paddingLeft: 10,
                                fontSize: 20}}
                        >
                            Save
                        </Text> 
                    </TouchableOpacity>
                </View>
            </View>
            )
        }
    }
    
    render() {  
        if (this.state.loading === 1) {
            return (
                <View
                    style = {{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <ActivityIndicator size="large" color="#00BCD4" />
                    <Text> LOADING...</Text>
                    <Button
                        style = {{}}
                        title="Cancel"
                        onPress={() => {
                            Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.PORTRAIT);
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
                            Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.PORTRAIT);
                            this.props.navigation.goBack()
                        }}
                    />
                </View>
            )
        }
        
        else{
            return (      
                <View 
                    style={{ flex: 1, paddingTop: 20, paddingBottom: 20,  margin: 10,flexDirection: 'column'}}
                    ref={view => {
                        this._container = view;
                    }}>
                    <Text
                        style={{fontStyle: "italic", color: "red"}}>
                            STRAIN
                    </Text>
                    <View 
                        style={{ flex: 1,flexDirection: 'row'}}
                        >
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
                                numberOfTicks = {6}
                                svg={{ fontSize: 10, fill: 'black', fontWeight: 'bold' }}
                            />
                        </View>
                        {this.renderButton()}
                    </View>
                    <View style={{ alignItems: "flex-end", paddingRight: this.state.paddingR}}>
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
                                width: "100%",
                                backgroundColor: "yellow"
                            }}
                            >
                            <TextInput
                                style={{
                                    height: 60,
                                    width: "100%",
                                    backgroundColor: "white"
                                }}
                                placeholder= {"Enter ID here..."}
                                onChangeText={(text) => this.setState({key: text})}
                            />
                            <View
                                style = {{ padding: 5, flexDirection: "row" }}
                            >
                                <TouchableOpacity
                                    onPress={() => {
                                        if (this.state.key === ""){
                                            Alert.alert("ID cannot be NULL. Please type again.", "",)                                    
                                        }
                                        else {
                                            this.setState({visible: !this.state.visible, paddingR: 60, savePermission: 0}),     
                                            this.refs.modal.close()
                                            this.props.navigation.navigate('Gallery', {base64: this.state.image, newkey: this.state.key, savePermission: 1});
                                        }
                                        
                                    }}
                                    style = {styles.subbutton}>
                                    <Text
                                        style = {{
                                        fontSize: 18,
                                        fontWeight: "bold",
                                        color: 'white'
                                        }}>
                                        Save
                                    </Text>
                                </TouchableOpacity> 
                                <TouchableOpacity
                                    onPress={() => {
                                        this.setState({visible: !this.state.visible}),
                                        this.refs.delete.close()
                                    }}
                                    style = {styles.subbutton}>
                                    <Text
                                        style = {{
                                        fontSize: 18,
                                        fontWeight: "bold",
                                        color: 'white'
                                        }}>
                                        Cancel
                                    </Text>
                                </TouchableOpacity> 
                            </View>
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

        flex: 1/3,
        margin: 5,
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center', 
        borderWidth: 3,
        borderRadius: 10,
        backgroundColor: "gray" 
    },
    subbutton: {
        marginTop:10,
        padding: 15,
        marginLeft:10,
        marginRight:10,
        backgroundColor:'#00BCD4',
        borderRadius:10,                        //button with curves
        borderWidth: 1,
        borderColor: '#fff',
        alignItems: "center",
        flex: 1/2,
    },
    notCameraScreen: {
        backgroundColor: "gray",
        padding: 0,
        margin: 0,
    }
  });
