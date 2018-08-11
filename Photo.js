import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, FlatList, Alert,Image, Platform } from 'react-native';

export default class PhotoScreen extends Component {
    state = {
        data: ""
    }

    render () {
        data = this.props.navigation.getParam('base64')

        return (
            <View
                style={{
                    flex: 1,
                    alignItems: 'center',
                    padding: 5,
                    flexDirection: "column"
                }}
            >
                <View>
                    <TouchableOpacity
                        onPress = {() => {
                            Expo.ScreenOrientation.allow(Expo.ScreenOrientation.Orientation.PORTRAIT);
                            this.props.navigation.goBack()
                        }}
                        style = {styles.subbutton}>
                        <Text
                            style = {{
                            fontSize: 20,
                            fontWeight: "bold",
                            color: 'white'
                            }}>BACK</Text>
                    </TouchableOpacity>                 
                </View>
                {data &&
                    <Image
                        source={{ uri: 'data:image/png;base64,' + data }}
                        style={{ width: "100%", flex: 1}}
                    />}
            </View>
        )

        
    }
}

const styles = StyleSheet.create ({
    subbutton: {
        marginTop:10,
        paddingTop: 5,
        paddingBottom: 5,
        paddingRight: 15,
        paddingLeft: 15,
        backgroundColor:'#00BCD4',
        borderRadius:100,                        //button with curves
        borderWidth: 2,
        borderColor: 'black',
        alignItems: "center",
    },
})