import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity,  CameraRoll, Image, Button, ActivityIndicator, Alert} from 'react-native';
import { Video, Camera, Permissions, ImagePicker} from 'expo';
import { Ionicons, Foundation, MaterialCommunityIcons, MaterialIcons } from "react-native-vector-icons";
import Modal from 'react-native-modalbox';

const flashArray = {
  off: 'on',
  on: 'auto',
  auto: 'torch',
  torch: 'off',
};

changeScreenOrientationLand = () => {
  Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.LANDSCAPE);
}
changeScreenOrientationPort = () => {
  Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.PORTRAIT);
}

export default class CameraScreen extends Component {
  state = {
    hasCameraPermission: null,
    hasCameraRollPermission: null,
    type: 'back',
    snapped: 0,
    flash: 'auto',
    imageUri: null,
    videoUri: null,
    countdown: 0,
    countStop: -1,
    uploading: 0,
    visible: false
  };

  async componentWillMount() {
    const { status1 } = await Permissions.askAsync(Permissions.CAMERA);
    const { status2} = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    this.setState({hasCameraRollPermission: status2 === 'granted' });
    this.setState({ hasCameraPermission: status1 === 'granted' });
  }

  onRec = async () => {
    this.setState({uploading: 0})
    let video 
    this.setState({ countStop: 0 });
    let count = 0;
    let time = setInterval( () => {
      this.setState({countdown: count});
      if (count == 7 || this.state.countStop){
        this.setState({ countdown: 0 });
        clearInterval(time);
        this.setState({countStop: -1});
      }
      count++;
    },1000)
    if (this.camera) {
      video = await this.camera.recordAsync({
        maxDuration: 6
      })
    }
    this.setState({ videoUri: video.uri });
    this.refs.modalUpload.open()
  }

  onStop = () => {
    this.camera.stopRecording();
    this.setState({ countStop: this.state.countStop === 0
      ? 1
      : -1 });
  }

  onPick = async () => {
    let result = await ImagePicker.launchImageLibraryAsync(
      {
        mediaTypes: "Videos"
      }
    );
    if (!result.cancelled) {
      this.setState({ videoUri: result.uri});
      this.refs.modalUpload.open();
    }
  }

  onReset = () => {
    this.setState({ 
      videoUri: null, 
      imageUri: null, 
      countdown: 0,
      countStop: -1 })
  }

  onUpload = async () => {
    this.setState({uploading: 1})
    var data = new FormData();  
      data.append('file', {  
        uri: this.state.videoUri, // your file path string
        name: 'my_video.mov',
        type: 'video/mov'
      })
      console.log(data)
    fetch('http://192.168.1.208:8000/up', {
      method: 'POST', // or 'PUT'
      body: data, // data can be `string` or {object}!
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data'
      }
    }).then((res) => {
      this.setState({uploading: 0})
      this.refs.modalUpload.close()
      Alert.alert("PROCESSING DONE!", "", 
        [{text: 'To The CHART', onPress: () => {         
          changeScreenOrientationLand()
          this.props.navigation.navigate('Chart', {count: 1});   
        }},]
      )
    })
      .catch(error => {
        this.setState({uploading: -1})
        console.log('Error:', error)
      })
  }

  renderRec = () => {
    if (this.state.countStop == -1 || this.state.countStop == 1){
      return(
          <TouchableOpacity 
            onPress = {this.onRec}
            style = {styles.button}>
            <Ionicons name={"ios-radio-button-on"} size={70} color="red"/>
          </TouchableOpacity>
      )
    }
    else {
      return(
          <TouchableOpacity 
            onPress = {this.onStop}
            style = {styles.button}>
            <MaterialCommunityIcons name = "stop-circle-outline" color = "red" size = {70}/>
            <Text style = {{ fontSize: 20, alignSelf: "center", color: "red"}}>
              00:0{this.state.countdown} 
            </Text>
          </TouchableOpacity>
      )
    }
  }

  renderModal = () => {
    if (this.state.uploading === 1){
      return (
        <View>
          <ActivityIndicator size="large" color="#00BCD4" />
          {/* <Text style={{alignSelf: "center"}}>VIDEO UPLOADED</Text> */}
          <Text>NOW PROCESSING VIDEO...</Text>
        </View>
      )
    }        
    else if (this.state.uploading === 0){
      return (
        <View> 
          <TouchableOpacity
              onPress = {this.onUpload}
              style = {styles.subbutton}>
              <Text
                style = {{
                  fontSize: 25,
                  fontWeight: "bold",
                  color: 'white'
                }}>UPLOAD</Text>
          </TouchableOpacity>
          <TouchableOpacity
              onPress = {() => {this.refs.modalUpload.close()}}
              style = {styles.subbutton}>
              <Text
                style = {{
                  fontSize: 25,
                  fontWeight: "bold",
                  color: 'white'
                }}>CANCEL</Text>
          </TouchableOpacity>
        </View>
      )
    } 
    else{
      return (
        <View>
          <Text>NETWORK ERROR</Text>
          <Button title = "Back" onPress = {
              () => {
                this.refs.modalUpload.close()
                this.setState({uploading: 0})
              }
          }/>
        </View>
      )
    }
  }

  render() {
    return (
      <View style={styles.cameraScreen}>
        <Camera 
          style={{flex: 1}} 
          ref={ref => { this.camera = ref; }}
        >
        </Camera>
       
        <View style= {styles.notCameraScreen}>
          <View style = {{ flexDirection: "row"}}>
            <TouchableOpacity 
              onPress = {this.onPick}
              style = {styles.button}>
              <MaterialIcons name = "video-library" size = {70} color = "white"/>
            </TouchableOpacity>
            <Text></Text>

            {this.renderRec()}

            <TouchableOpacity 
              style = {styles.button}
              onPress = {() => {
                this.props.navigation.navigate('Gallery')
                // Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.PORTRAIT);
                // this.props.navigation.navigate('Chart')
              }}>
              <MaterialCommunityIcons name = "chart-line" size = {70} color = 'rgb(134, 65, 244)'/>
            </TouchableOpacity>
          </View>
        </View>

        <Modal
          ref = {"modalUpload"}
          position = {"center"}
          isDisable = {!this.state.visible}
          backdropPressToClose = {false}
          swipeToClose = {false}
          style = {{
              alignItems: "center",
              justifyContent: "center",
              height: 400,
              width: "100%"
          }}
          >
          {this.renderModal()}
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  cameraScreen: {
    flex: 1, 
    backgroundColor: "gray",
  },
  button: {
    flexDirection: "row",
    flex: 1/3,
    marginHorizontal: 2,
    marginTop: 5,
    alignItems: 'center',
    justifyContent: 'center', 
  },
  subbutton: {
    marginTop:10,
    padding: 15,
    marginLeft:30,
    marginRight:30,
    backgroundColor:'#00BCD4',
    borderRadius:10,
    borderWidth: 1,
    borderColor: '#fff',
    alignItems: "center"
  },
  notCameraScreen: {
    backgroundColor: "gray",
    paddingBottom: 10,
    paddingTop: 10
  }
});
