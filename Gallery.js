import React, { Component } from 'react';
import { Text, View, StyleSheet, Button, AsyncStorage, TouchableOpacity, FlatList, TextInput, Alert, Platform, ActivityIndicator} from 'react-native';
import Modal from 'react-native-modalbox';
import { MaterialCommunityIcons, Entypo, FontAwesome, MaterialIcons } from "react-native-vector-icons";

export default class GalleryScreen extends Component {
    state = {
        ListKey: [],
        ListData: [],
        ListDelete: [],
        visible: false,
        key: "",
        loadStorage: 0,
        delete: 0,
        changecolor: 0
    }
    
    _retrieveData = async (key) => {                                //retrieve data from keys
        let res = await AsyncStorage.getItem(key);
        return res
    }

    _storeData(key,value) {                                         //store data to storage
        AsyncStorage.setItem(key, value);
    }
     
    _allData = async () => {                                        //get all keys
        try{
            let cena = await AsyncStorage.getAllKeys()
            return (cena)
        } catch (error){

        }
    }

    _removeData = async (key) => {                                  //remove keys and data
        AsyncStorage.removeItem(key)
        this.state.ListKey.splice(this.state.ListKey.indexOf(key), 1)
        this.state.ListData.splice(this.state.ListData.indexOf(key), 1)

        this.setState({loadStorage: 1})                   
    }

    async componentWillMount() {
        this.setState({ListKey: [], ListData: []})
        this._storeData("1", "OMAE WA MOU")
        
        savePermission = this.props.navigation.getParam('savePermission')       
        if (savePermission == 1) {                                              //if we've just come from ChartScreen, do these things
            let newkey = this.props.navigation.getParam('newkey')               //get the key and data from ChartScreen
            let base64 = this.props.navigation.getParam('base64')
            this._storeData(newkey, base64)
            savePermission = 0
        }

        let allKey = await this._allData()                      // get all keys - all data from storage
        allKey.sort(function(a, b){return a-b})               //function sort() must have compare function inside
        for( var i = 0; i < allKey.length; i++){
            let temp1 = allKey[i]
            let temp2 = await this._retrieveData(allKey[i]);
            this.state.ListKey.push(temp1);
            this.state.ListData.push(temp2)
        }

        this.setState({loadStorage: 1})                   
    }
       
    render() {
        if (this.state.loadStorage === 0) {
            return (
                <View 
                    style = {{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <ActivityIndicator size="large" color="#00BCD4" />
                    <Text>
                        RENDERING ITEMS...
                    </Text>
                 </View>
            )
        }
        else if (this.state.loadStorage === 1) {
            if (this.state.delete === 0){
                return (
                    <View style={styles.MainContainer}>

                        {/* 3 buttons above */}
                        <View style={{marginTop: 10, marginBottom: 10, flexDirection: "row"}}>
                            <View
                                style = {styles.button}
                            >
                                <TouchableOpacity 
                                    onPress={() => {
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
                                        this.refs.findByID.open()
                                    }}
                                    style = {{justifyContent: "center", alignItems: "center"}}
                                >
                                    <FontAwesome name = "search" size = {40} color = "black"/>   

                                    <Text
                                        style = {{
                                            paddingLeft: 10,
                                            fontSize: 20}}
                                    >
                                        Find
                                    </Text> 
                                </TouchableOpacity>

                            </View>

                            <View
                                style = {styles.button}
                            >
                                <TouchableOpacity 
                                    onPress={() => {
                                        this.setState({delete: 1})
                                    }}
                                    style = {{justifyContent: "center", alignItems: "center"}}
                                >
                                    <MaterialCommunityIcons name = "delete" size = {40} color = "black"/>    

                                    <Text
                                        style = {{
                                            paddingLeft: 10,
                                            fontSize: 20}}
                                    >
                                        Delete
                                    </Text>
                                </TouchableOpacity>
                            </View>      
                        </View>
                        
                        {/* FlatList and Boxes */}
                        <View
                            style = {{ flex: 1 }}>
                            <FlatList     
                                style={{flex: 1}}
                                data={ this.state.ListKey } 
                                extraData = { this.state.ListKey }
                                keyExtractor={(item, index) => index}
                                renderItem={({item}) => 
                                    <View style={styles.GridViewBlockStyle}>           
                                        <TouchableOpacity  
                                            onPress={() => {
                                                changeScreenOrientationLand()
                                                this.props.navigation.navigate('Photo', {base64: this.state.ListData[this.state.ListKey.indexOf(item)]})
                                            }}
                                        > 
                                            <Text style={styles.GridViewInsideTextItemStyle}>
                                                {item}
                                            </Text> 
                                        </TouchableOpacity>                   
                                    </View>}
                                numColumns={2}
                            /> 
                        </View>
                        
                        {/* Modal opened when trigerred */}
                        <Modal 
                            ref = {"findByID"}
                            position = {"center"}
                            isDisable = {!this.state.visible}
                            backdropPressToClose = {false}
                            swipeToClose = {false}
                            style = {{
                                alignItems: "center",
                                justifyContent: "center",
                                height: 300,
                                width: 300,
                                backgroundColor: "yellow"
                            }}
                            >
                            <TextInput
                                style={{
                                    height: 60,
                                    width: "100%",
                                    backgroundColor: "white",
                                    borderRadius:100,
                                    padding: 10,
                                    fontSize: 20
                                }}
                                placeholder= {"Enter ID you want to find..."}
                                onChangeText={(text) => this.setState({key: text})}
                            />                        
                            <View
                                style = {{ padding: 5, flexDirection: "row" }}
                            >
                                <TouchableOpacity
                                    onPress={() => {
                                        if (this.state.key === ""){
                                            Alert.alert("ID cannot be NULL. \nPlease type again.", "",)                                    
                                        }
                                        else {
                                            if (this.state.ListKey.indexOf(this.state.key) === -1) {
                                                Alert.alert("Cannot find this ID: " + this.state.key + ". \nPlease type again.", "",)
                                            }
                                            else {
                                                this.setState({visible: !this.state.visible}),
                                                this.refs.findByID.close()
                                                this.props.navigation.navigate('Photo', {base64: this.state.ListData[this.state.ListKey.indexOf(this.state.key)]})
                                            }
                                        }
                                        
                                    }}
                                    style = {styles.subbutton}>
                                    <Text
                                        style = {{
                                        fontSize: 18,
                                        fontWeight: "bold",
                                        color: 'white'
                                        }}>
                                        OK
                                    </Text>
                                </TouchableOpacity> 
                                <TouchableOpacity
                                    onPress={() => {
                                        this.setState({visible: !this.state.visible}),
                                        this.refs.findByID.close()
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
                );
            }
            else if (this.state.delete === 1){
                return (
                    <View style={styles.MainContainer}>

                        {/* 3 buttons above changed into 2 buttons */}
                        <View style={{marginTop: 10, marginBottom: 10, flexDirection: "row"}}>
                            <View
                                style = {styles.button2}
                            >
                                <TouchableOpacity 
                                    onPress={() => {                                      
                                        if (this.state.ListDelete.length === 1) {
                                            Alert.alert("Are you sure to delete this " + this.state.ListDelete.length + " chart?", "",
                                                [
                                                    {text: 'OK', onPress: () => {   
                                                        for (var i = 0; i < this.state.ListDelete.length; i++) {      
                                                            this._removeData(this.state.ListDelete[i]) 
                                                        }
                                                        this.setState({ListDelete: []})  
                                                        }},
                                                    {text: 'Cancel', onPress: () => {
                                                        this.setState({ListDelete: []})
                                                    },}
                                                ]
                                            )
                                        }   
                                        else {
                                            Alert.alert("Are you sure to delete these " + this.state.ListDelete.length + " charts?", "",
                                                [
                                                    {text: 'OK', onPress: () => {   
                                                        for (var i = 0; i < this.state.ListDelete.length; i++) {      
                                                            this._removeData(this.state.ListDelete[i]) 
                                                        }
                                                        this.setState({ListDelete: []})  
                                                        }},
                                                    {text: 'Cancel', onPress: () => {
                                                        this.setState({ListDelete: []})
                                                    },}
                                                ]
                                            )
                                        }   
                                    }}
                                    style = {{justifyContent: "center", alignItems: "center"}}
                                >
                                    <MaterialCommunityIcons name = "approval" size = {40} color = "black"/>    

                                    <Text
                                        style = {{
                                            paddingLeft: 10,
                                            fontSize: 20}}
                                    >
                                        Delete
                                    </Text>
                                </TouchableOpacity>
                            </View>  

                            <View
                                style = {styles.button2}
                            >
                                <TouchableOpacity 
                                    onPress={() => {
                                        this.setState({delete: 0, ListDelete: []})
                                    }}
                                    style = {{justifyContent: "center", alignItems: "center"}}
                                >
                                    <MaterialIcons name = "cancel" size = {40} color = "black"/>    

                                    <Text
                                        style = {{
                                            paddingLeft: 10,
                                            fontSize: 20}}
                                    >
                                        Cancel
                                    </Text>
                                </TouchableOpacity>
                            </View>    
                        </View>

                        <View 
                            style = {{justifyContent: "center", alignItems: "center" , margin: 10}}>
                            <Text
                                style = {{
                                    fontSize: 15
                                }}>Choose the boxes that you want to delete</Text>
                            <Text
                                style = {{
                                    fontSize: 20,
                                    color: "red"
                                }}>ID TO BE DELETED: {this.state.ListDelete !== [] ? this.state.ListDelete + "" : ""}</Text>
                            
                        </View>
                        
                        {/* FlatList and Boxes */}
                        <View
                            style = {{ flex: 1 }}>
                            <FlatList     
                                style={{flex: 1}}
                                data={ this.state.ListKey } 
                                extraData = { this.state.ListKey }
                                keyExtractor={(item, index) => index}
                                renderItem={({item}) => 
                                    <View style={styles.GridViewBlockStyle}>           
                                        <TouchableOpacity
                                            // style = {{backgroundColor: this.state.changecolor === 1? "red": "#00BCD4"}}                                             
                                            onPress={() => {
                                                if (this.state.ListDelete.indexOf(item) === -1) {
                                                    this.state.ListDelete.push(item)
                                                    this.setState({changecolor: 1})
                                                    console.log(this.state.ListDelete)
                                                }
                                            }}
                                        > 
                                            <Text style={styles.GridViewInsideTextItemStyle}>
                                                {item}
                                            </Text> 
                                        </TouchableOpacity>                   
                                    </View>}
                                numColumns={2}
                            /> 
                        </View>
                    </View>
                );
            }
            
        }
    }
}
    
const styles = StyleSheet.create({
   MainContainer :{
        justifyContent: 'center',
        flex:1,
        paddingTop: (Platform.OS) === 'ios' ? 20 : 0
   },
   GridViewBlockStyle: {
        justifyContent: 'center',
        flex:1,
        alignItems: 'center',
        height: 100,
        margin: 5,
        backgroundColor: '#00BCD4',
        borderWidth: 1
   },
   GridViewInsideTextItemStyle: {
      padding: 10,
      fontSize: 18,
      justifyContent: 'center',
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
    button: {
        flexDirection: "row",
        flex: 1/3,
        margin: 5,
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center', 
        borderWidth: 3,
        borderRadius: 10,
        backgroundColor: "gray"
      },
    button2: {
        flexDirection: "row",
        flex: 1/2,
        margin: 5,
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center', 
        borderWidth: 3,
        borderRadius: 10,
        backgroundColor: "gray"
      },
});