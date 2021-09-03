/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {Component} from 'react';

import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Button,
  Vibration,
  Image,
  TextInput,
  TouchableHighlightBase,
  Alert,
  ActivityIndicator,
} from 'react-native';

import ImagePicker from 'react-native-image-crop-picker';

import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-community/google-signin';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import QRCodeScanner from 'react-native-qrcode-scanner';
import {RNCamera} from 'react-native-camera';
import QRCode from 'react-native-qrcode-svg';
import YouTube from 'react-native-youtube';
import {WebView} from 'react-native-webview';
import CameraRoll from '@react-native-community/cameraroll';
import VideoRecorder from 'react-native-beautiful-video-recorder';
import Video from 'react-native-video';
import ViewShot from 'react-native-view-shot';
import {useRef} from 'react';

import RNPrint from 'react-native-print';

class App extends Component {
  state = {
    videoURI: '',
    qr: '',
    openCamera: false,
    ViewMode: false,
    loginScreen: true,
    selectScreen: false,
    startScreen: false,
    scannerScreen: false,
    recordScreen: false,
    webScreen: false,
    previewScreen: false,
    rollScreen: false,
    messageScreen: false,
    recording: false,
    captureAudio: true,
    qrScreen: false,
    playlistScreen: false,
    previewScreenFromRoll: false,
    videoTitle: '',
    videoDescription: '',

    scanResponse: '',

    token: '',

    bearerToken: 'Bearer ',

    qrcodeuri: '',

    qrcodehtml: '',

    selectedPicuture: '',

    isRecording: false,

    currentSelectedPrinter: null,

    cameraType: 'back',
    mirrorMode: false,

    username: '',
    password: '',

    uploading: false,

    playlistTitle: [],
    playlistURL: [],

    playliststart: 0,
    playlistlength: null,
  };

  playliststuff = {
    playlistTitle: [],
    playlistURL: [],

    // variables to determine which playlists to use on the buttons (in case there are more than 4 videos)
    playliststart: 0,
    playlistlength: null,

    // bools to determine how many buttons there should be
    playlistbutton1: false,
    playlistbutton2: false,
    playlistbutton3: false,
    playlistbutton4: false,

    // variables to display how many pages there are
    playlistpage: 1,
    totalpages: 1,

    // bool to check if a selected playlist is open
    inplaylist: false,

    currentplaylist: '',
  };

  loadRolls = () => {
    CameraRoll.getPhotos({
      first: 20,
      assetType: 'Videos',
    })
      .then((r) => {
        this.setState({photos: r.edges});
      })
      .catch((err) => {
        //Error Loading Images
      });
  };

  changeCameraType = () => {
    if (this.state.cameraType === 'back') {
      this.setState({
        cameraType: 'front',
        mirror: false,
      });
    } else {
      this.setState({
        cameraType: 'back',
        mirror: false,
      });
    }
  };

  choosePrinter = async () => {
    const currentSelectedPrinter = await RNPrint.selectPrinter({
      x: 100,
      y: 100,
    });
    this.setState({currentSelectedPrinter});
    if (this.state.currentSelectedPrinter != null) {
      this.silentPrint();
    }
  };

  silentPrint = async () => {
    if (!this.state.currentSelectedPrinter) {
      alert('Must Select Printer First');
    }
    //console.log(this.state.selectedPicture);
    const jobName = await RNPrint.print({
      printerURL: this.state.currentSelectedPrinter.url,
      filePath: this.state.selectedPicture,
    });
  };

  choosePhotoFromLibrary = () => {
    ImagePicker.openPicker({
      width: 500,
      height: 500,
      cropping: true,
      //writeTempFile: true,
    }).then((image) => {
      //console.log(image);
      this.state.selectedPicture = image.path;
      //console.log(this.state.selectedPicture);
      this.openRoll();
    });
  };

  chooseVideoFromLibrary = () => {
    ImagePicker.openPicker({
      mediaType: 'video',
    }).then((video) => {
      //console.log(video);
      this.state.videoURI = video.path;
      this.state.qr = video.path;
      this.openPreviewFromRoll();
    });
  };

  onCapture = (uri) => {
    CameraRoll.save(uri);
    /*this.state.qrcodeuri = uri;
    const temphtml = String(
      '<img height="100" width="100" src="' +
        this.state.selectedPicuture +
        '"> </img>',
    );*/
    //console.log(temphtml);
    //this.state.qrcodehtml = temphtml;
    this.state.selectedPicture = uri;
  };

  getPlaylists = async () => {
    this.playliststuff.inplaylist = false;
    const auth_string = this.state.bearerToken;

    const requestOptions = {
      method: 'GET',
      headers: {
        Authorization: auth_string,
      },
    };

    const response = await fetch(
      'https://sopsimple.com/api/user-playlists',
      requestOptions,
    );

    const responseData = await response.json();

    this.playliststuff.playlistlength = responseData.length;

    console.log(responseData);

    for (
      var i = this.playliststuff.playliststart;
      i < this.playliststuff.playlistlength;
      i++
    ) {
      this.playliststuff.playlistURL[i] = responseData[i].url;
      this.playliststuff.playlistTitle[i] = responseData[i].title;
      //console.log(this.playliststuff.playlistURL[i]);
      //console.log(this.playliststuff.playlistTitle[i]);
    }

    this.numberOfPlaylists();

    var tempvar = this.playliststuff.playlistlength / 4;
    this.playliststuff.totalpages = Math.ceil(tempvar);

    if (response.status == 200) {
      this.openPlaylists();
    }
  };

  // method to determine how many buttons to display
  numberOfPlaylists = () => {
    if (this.playliststuff.playliststart < this.playliststuff.playlistlength) {
      this.playliststuff.playlistbutton1 = true;
    } else {
      this.playliststuff.playlistbutton1 = false;
    }

    if (
      this.playliststuff.playliststart + 1 <
      this.playliststuff.playlistlength
    ) {
      this.playliststuff.playlistbutton2 = true;
    } else {
      this.playliststuff.playlistbutton2 = false;
    }

    if (
      this.playliststuff.playliststart + 2 <
      this.playliststuff.playlistlength
    ) {
      this.playliststuff.playlistbutton3 = true;
    } else {
      this.playliststuff.playlistbutton3 = false;
    }

    if (
      this.playliststuff.playliststart + 3 <
      this.playliststuff.playlistlength
    ) {
      this.playliststuff.playlistbutton4 = true;
    } else {
      this.playliststuff.playlistbutton4 = false;
    }
  };

  nextPlaylists = () => {
    if (
      this.playliststuff.playlistlength - 4 >
      this.playliststuff.playliststart
    ) {
      this.playliststuff.playlistpage++;
      this.playliststuff.playliststart = this.playliststuff.playliststart + 4;

      if (!this.playliststuff.inplaylist) {
        this.getPlaylists();
      } else if (this.playliststuff.inplaylist) {
        this.openSelectedPlaylist(this.playliststuff.currentplaylist);
      }
    }
  };

  previousPlaylists = () => {
    if (this.playliststuff.playliststart > 0) {
      this.playliststuff.playlistpage--;
      this.playliststuff.playliststart = this.playliststuff.playliststart - 4;

      if (!this.playliststuff.inplaylist) {
        this.getPlaylists();
      } else if (this.playliststuff.inplaylist) {
        this.openSelectedPlaylist(this.playliststuff.currentplaylist);
      }
    }
  };

  openSelectedVideo = (selectedvideo) => {
    if (this.playliststuff.inplaylist) {
      this.state.qr = selectedvideo;
      console.log(this.state.qr);
      this.openWeb();
    }
  };

  // method to open the playlist from the playlist menu
  // if already inside a playlist, this method will play a video
  openSelectedPlaylist = async (selectedplaylist) => {
    this.playliststuff.currentplaylist = selectedplaylist;

    if (!this.playliststuff.inplaylist) {
      this.playliststuff.playlistpage = 1;
      this.playliststuff.playliststart = 0;
    }
    this.playliststuff.inplaylist = true;
    const auth_string = this.state.bearerToken;

    const requestOptions = {
      method: 'GET',
      headers: {
        Authorization: auth_string,
      },
    };

    const response = await fetch(
      this.playliststuff.currentplaylist,
      requestOptions,
    );

    const responseData = await response.json();

    this.playliststuff.playlistlength = responseData.length;

    //console.log(responseData[0].video);

    for (
      var i = this.playliststuff.playliststart;
      i < this.playliststuff.playlistlength;
      i++
    ) {
      this.playliststuff.playlistURL[i] = responseData[i].video;
      this.playliststuff.playlistTitle[i] = responseData[i].title;
      console.log(this.playliststuff.playlistURL[i]);
      //console.log(this.playliststuff.playlistTitle[i]);
    }

    this.numberOfPlaylists();

    var tempvar = this.playliststuff.playlistlength / 4;
    this.playliststuff.totalpages = Math.ceil(tempvar);

    this.openPlaylists();
  };

  setTitle = () => {
    Alert.prompt(
      'Title',
      'Set the title of your video',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: (text) => (
            (this.state.videoTitle = text),
            console.log('Title: ' + this.state.videoTitle),
            this.setDescription()
          ),
        },
      ],
      'plain-text',
    );
  };

  setDescription = () => {
    Alert.prompt(
      'Description',
      'Set the description of your video',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: (text) => (
            (this.state.videoDescription = text),
            console.log('Description: ' + this.state.videoDescription),
            this.uploadVideo(),
            (this.state.uploading = true)
          ),
        },
      ],
      'plain-text',
    );
  };

  takeVideo = async () => {
    const {isRecording} = this.state;
    this.setState({captureAudio: true});
    const options = {
      quality: RNCamera.Constants.VideoQuality['720p'],
      codec: RNCamera.Constants.VideoCodec['H264'],
    };
    if (this.camera && !isRecording) {
      try {
        const promise = this.camera.recordAsync(options);

        if (promise) {
          this.setState({isRecording: true});
          const data = await promise;
          //console.warn('takeVideo', data.uri);
          CameraRoll.save(data.uri);
          this.setState({videoURI: data.uri});
          this.setState({qr: data.uri});
          //console.log(this.state.videoURI);
        }
      } catch (e) {
        this.openRecord();
        console.error(e);
      }
    }
  };

  stopVideo = async () => {
    await this.camera.stopRecording();
    this.setState({isRecording: false});
    this.openPreview();
    this.setState({captureAudio: false});
  };

  setRecording = (e) => {
    this.setState({recording: e});
  };

  openLogin = () => {
    this.setState({loginScreen: true});
    this.setState({startScreen: false});
  };

  logout = () => {
    this.setState({startScreen: false});
    this.setState({loginScreen: true});
    this.setState({token: ''});
    this.setState({bearerToken: 'Bearer '});
    this.setState({password: '', username: ''});
  };

  openPlaylists = () => {
    this.setState({playlistScreen: true});
    this.setState({selectScreen: false});
    this.setState({startScreen: false});
    this.setState({previewScreen: false});
    this.setState({rollScreen: false});
    this.setState({messageScreen: false});
    this.setState({scannerScreen: false});
    this.setState({recordScreen: false});
    this.setState({webScreen: false});
    this.setState({startScreen: false});
    this.setState({qrScreen: false});
    this.setState({previewScreenFromRoll: false});
  };

  openSelect = () => {
    this.setState({selectScreen: true});
    this.setState({startScreen: false});
    this.setState({previewScreen: false});
    this.setState({rollScreen: false});
    this.setState({messageScreen: false});
    this.setState({scannerScreen: false});
    this.setState({recordScreen: false});
    this.setState({webScreen: false});
    this.setState({startScreen: false});
    this.setState({qrScreen: false});
    this.setState({previewScreenFromRoll: false});
    this.setState({playlistScreen: false});
  };

  openQR = () => {
    this.setState({qrScreen: true});
    this.setState({selectScreen: false});
    this.setState({startScreen: false});
    this.setState({previewScreen: false});
    this.setState({rollScreen: false});
    this.setState({messageScreen: false});
    this.setState({scannerScreen: false});
    this.setState({recordScreen: false});
    this.setState({webScreen: false});
    this.setState({startScreen: false});
    this.setState({previewScreenFromRoll: false});
    this.setState({playlistScreen: false});
  };

  openPreview = () => {
    this.setState({previewScreen: true});
    this.setState({qrScreen: false});
    this.setState({selectScreen: false});
    this.setState({startScreen: false});
    this.setState({recordScreen: false});
    this.setState({webScreen: false});
    this.setState({scannerScreen: false});
    this.setState({rollScreen: false});
    this.setState({messageScreen: false});
    this.setState({previewScreenFromRoll: false});
    this.setState({playlistScreen: false});
  };

  openPreviewFromRoll = () => {
    this.setState({qrScreen: false});
    this.setState({selectScreen: false});
    this.setState({startScreen: false});
    this.setState({recordScreen: false});
    this.setState({webScreen: false});
    this.setState({scannerScreen: false});
    this.setState({rollScreen: false});
    this.setState({messageScreen: false});
    this.setState({previewScreen: false});
    this.setState({previewScreenFromRoll: true});
    this.setState({playlistScreen: false});
  };

  openRoll = () => {
    this.setState({qrScreen: false});
    this.setState({selectScreen: false});
    this.setState({previewScreen: false});
    this.setState({messageScreen: false});
    this.setState({startScreen: false});
    this.setState({recordScreen: false});
    this.setState({webScreen: false});
    this.setState({scannerScreen: false});
    this.setState({rollScreen: true});
    this.setState({previewScreenFromRoll: false});
    this.setState({playlistScreen: false});
  };

  openScanner = () => {
    this.setState({qrScreen: false});
    this.setState({selectScreen: false});
    this.setState({previewScreen: false});
    this.setState({rollScreen: false});
    this.setState({messageScreen: false});
    this.setState({startScreen: false});
    this.setState({recordScreen: false});
    this.setState({webScreen: false});
    this.setState({scannerScreen: true});
    this.setState({previewScreenFromRoll: false});
    this.setState({playlistScreen: false});
  };

  openStart = () => {
    this.state.qr = '';
    this.playliststuff.inplaylist = false;
    this.playliststuff.playliststart = 0;
    this.playliststuff.playlistpage = 1;
    this.setState({loginScreen: false});
    this.setState({qrScreen: false});
    this.setState({selectScreen: false});
    this.setState({previewScreen: false});
    this.setState({rollScreen: false});
    this.setState({messageScreen: false});
    this.setState({scannerScreen: false});
    this.setState({recordScreen: false});
    this.setState({webScreen: false});
    this.setState({startScreen: true});
    this.setState({previewScreenFromRoll: false});
    this.setState({playlistScreen: false});
  };

  openMessages = () => {
    this.setState({qrScreen: false});
    this.setState({selectScreen: false});
    this.setState({previewScreen: false});
    this.setState({rollScreen: false});
    this.setState({scannerScreen: false});
    this.setState({recordScreen: false});
    this.setState({webScreen: false});
    this.setState({startScreen: false});
    this.setState({messageScreen: true});
    this.setState({previewScreenFromRoll: false});
    this.setState({playlistScreen: false});
  };

  openRecord = () => {
    this.setState({qrScreen: false});
    this.setState({videoURI: ''});
    this.setState({selectScreen: false});
    this.setState({previewScreen: false});
    this.setState({rollScreen: false});
    this.setState({messageScreen: false});
    this.setState({startScreen: false});
    this.setState({scannerScreen: false});
    this.setState({webScreen: false});
    this.setState({recordScreen: true});
    this.setState({previewScreenFromRoll: false});
    this.setState({playlistScreen: false});
  };

  openWeb = () => {
    this.setState({qrScreen: false});
    this.setState({selectScreen: false});
    this.setState({previewScreen: false});
    this.setState({rollScreen: false});
    this.setState({messageScreen: false});
    this.setState({startScreen: false});
    this.setState({recordScreen: false});
    this.setState({scannerScreen: false});
    this.setState({webScreen: true});
    this.setState({previewScreenFromRoll: false});
    this.setState({playlistScreen: false});
  };

  onRead = (e) => {
    this.setState({qrScreen: false});
    this.setState({selectScreen: false});
    this.setState({previewScreen: false});
    this.setState({qr: e.data});
    //this.scanVideo();
    //console.log(e.data);
    //console.log(this.state.bearerToken);
    this.setState({ViewMode: true});
    this.setState({rollScreen: false});
    this.setState({messageScreen: false});
    this.setState({startScreen: false});
    this.setState({recordScreen: false});
    this.setState({scannerScreen: false});
    this.setState({webScreen: true});
    this.setState({previewScreenFromRoll: false});
    this.setState({playlistScreen: false});
    //this.scanVideo();
  };

  videoError = (e) => {
    if (e.error.code === -1013) {
      alert("You don't have access to watch the scanned video!");
      //this.openScanner();
      //this.getToken();
      console.log(e);
    } else {
      alert('Something went wrong. Error code: ' + e.error.code);
    }
    //console.log(e.error.code);
  };

  setOpenCamera = () => {
    this.setState({openCamera: true});
  };

  setViewModeFalse = () => {
    this.setState({ViewMode: false});
  };

  getToken = async () => {
    const requestOptions = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password,
      }),
    };

    const response = await fetch(
      'https://sopsimple.com/api/login_check',
      requestOptions,
    );

    const data = await response.json();
    console.log(data);

    this.setState({token: JSON.stringify(data)});

    this.state.token = this.state.token.slice(10);

    this.state.token = this.state.token.slice(0, this.state.token.length - 2);

    this.state.bearerToken = this.state.bearerToken + this.state.token;

    if (data.code === 401) {
      alert(
        'Error! Code: ' +
          data.code +
          '                                      Message: ' +
          data.message,
      );
    }

    if (data.token) {
      this.openStart();
    }

    //console.log(this.state.bearerToken);
  };

  hackLogin = async () => {
    const requestOptions = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        username: 'admin',
        password: 'admin',
      }),
    };

    const response = await fetch(
      'https://sopsimple.com/api/login_check',
      requestOptions,
    );

    const data = await response.json();
    console.log(data);

    this.setState({token: JSON.stringify(data)});

    this.state.token = this.state.token.slice(10);

    this.state.token = this.state.token.slice(0, this.state.token.length - 2);

    this.state.bearerToken = this.state.bearerToken + this.state.token;

    if (data.code === 401) {
      alert(
        'Error! Code: ' +
          data.code +
          '                                      Message: ' +
          data.message,
      );
    }

    if (data.token) {
      this.openStart();
    }

    //console.log(this.state.bearerToken);
  };

  uploadVideo = async () => {
    this.setState({qrScreen: false});
    this.setState({selectScreen: false});
    this.setState({previewScreen: false});
    this.setState({rollScreen: false});
    this.setState({scannerScreen: false});
    this.setState({recordScreen: false});
    this.setState({webScreen: false});
    this.setState({startScreen: false});
    this.setState({messageScreen: false});
    this.setState({previewScreenFromRoll: false});
    this.setState({uploading: true});

    var video = {
      uri: this.state.videoURI,
      type: 'video/quicktime',
      name: this.state.title + '.mov',
    };

    const auth_string = this.state.bearerToken;

    const str2 = 'video="' + this.state.videoURI + '"';

    let formData = new FormData();

    formData.append('video', video);
    formData.append('title', this.state.videoTitle);
    formData.append('description', this.state.videoDescription);

    //console.log(formData);

    const requestOptions = {
      method: 'POST',
      headers: {Authorization: auth_string},
      body: formData,
    };

    const response = await fetch(
      'https://sopsimple.com/api/add-video',
      requestOptions,
    );

    const responseData = await response.json();

    this.setState({uploading: false});

    this.state.qr = responseData.videoPath;

    if (responseData.status == 'success') {
      this.state.uploading = false;
      this.openQR();
    } else {
      this.state.uploading = false;
      console.log(responseData);
      alert(responseData.status);
    }

    //console.log(responseData);

    //console.log(responseData.videoPath);
  };

  scanVideo = async () => {
    const auth_string = this.state.bearerToken;

    const requestOptions = {
      method: 'GET',
      headers: {
        Authorization: auth_string,
        'Content-type': 'application/json',
      },
    };

    const response = await fetch(this.state.qr, requestOptions);

    console.log(response);
  };

  /*saveScreenshot = () => {
    this.refs.viewShot.capture().then((uri) => {
      RNFS.readFile(uri, 'base64').then((res) => {
        let urlString = 'data:image/jpeg;base64,' + res;
        let options = {
          title: 'Share Title',
          message: 'Share Message',
          url: urlString,
          type: 'image/jpeg',
        };
        Share.open(options)
          .then((res) => {
            console.log(res);
          })
          .catch((err) => {
            err && console.log(err);
          });
      });
    });
  };*/

  render() {
    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={styles.wholeScreen}>
          {this.state.selectScreen ? (
            <View
              style={{height: '100%', width: '100%', alignItems: 'flex-start'}}>
              <View style={styles.leftBar}>
                <TouchableOpacity style={styles.leftBarLogos}>
                  <View style={{flex: 1}}></View>
                </TouchableOpacity>

                <View style={{height: '17%'}}></View>

                <TouchableOpacity style={styles.leftBarLogos}>
                  <View style={{flex: 1}}></View>
                </TouchableOpacity>

                <View style={{height: '17%'}}></View>

                <TouchableOpacity style={styles.leftBarLogos}>
                  <View style={{flex: 1}}></View>
                </TouchableOpacity>

                <View style={{height: '17%'}}></View>

                <TouchableOpacity style={styles.leftBarLogos}>
                  <View style={{flex: 1}}></View>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
          {this.state.loginScreen ? (
            <View
              style={{
                height: '100%',
                width: '100%',
                alignItems: 'center',
              }}>
              <View style={{height: '3%'}}></View>

              <View
                style={{
                  height: '10%',
                  width: '85%',

                  alignItems: 'center',
                  borderRadius: 5,
                }}>
                <Image
                  source={require('./image/sopsimplelogo.png')}
                  style={{
                    maxWidth: '90%',
                    maxHeight: '90%',
                  }}
                />
              </View>

              <View style={{height: '8%'}}></View>

              <TextInput
                style={styles.input}
                placeholder={'Username'}
                placeholderTextColor="rgba(15,42,70,0.3)"
                onChangeText={(value) => this.setState({username: value})}
                value={this.state.username}></TextInput>

              <TextInput
                style={styles.input}
                placeholder={'Password'}
                placeholderTextColor="rgba(15,42,70,0.3)"
                secureTextEntry={true}
                onChangeText={(value) => this.setState({password: value})}
                value={this.state.password}></TextInput>

              <View
                style={{
                  width: '100%',
                  height: '20%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <TouchableOpacity
                  onPress={() => {
                    this.getToken();
                  }}>
                  <Image
                    source={require('./image/loginlogoblue.png')}
                    style={{
                      maxHeight: '90%',
                      maxWidth: '30%',
                    }}></Image>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
          {this.state.startScreen ? (
            <View style={{height: '100%', width: '100%', alignItems: 'center'}}>
              <View style={{height: '3%'}}></View>

              <View
                style={{
                  height: '10%',
                  width: '85%',

                  alignItems: 'center',
                  borderRadius: 5,
                }}>
                <TouchableOpacity
                  onPress={() => {
                    this.logout();
                  }}>
                  <Image
                    source={require('./image/sopsimplelogo.png')}
                    style={{
                      maxWidth: '90%',
                      maxHeight: '90%',
                    }}
                  />
                </TouchableOpacity>
              </View>

              <View style={{height: '12%'}}></View>

              <View style={styles.buttonPlacement}>
                <TouchableOpacity
                  style={styles.startButtons}
                  onPress={() => {
                    this.chooseVideoFromLibrary();
                    //Vibration.vibrate();
                  }}>
                  <View style={{height: '22%'}}></View>
                  <Image
                    source={require('./image/camerarolllogoWHITE.png')}
                    style={{
                      maxWidth: '90%',
                      maxHeight: '90%',
                    }}
                  />
                </TouchableOpacity>

                <View style={{width: '10%'}} />

                <TouchableOpacity
                  style={styles.startButtons}
                  onPress={() => this.openRecord()}>
                  <View style={{height: '21%'}}></View>
                  <Image
                    source={require('./image/recordlogoWHITE.png')}
                    style={{
                      maxWidth: '80%',
                      maxHeight: '80%',
                    }}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.buttonPlacement}>
                <TouchableOpacity
                  style={styles.startButtons}
                  onPress={() => {
                    this.getPlaylists();
                  }}>
                  <View style={{height: '29%'}}></View>
                  <Image
                    source={require('./image/videosicon.png')}
                    style={{
                      maxWidth: '80%',
                      maxHeight: '80%',
                      marginTop: '-10%',
                    }}></Image>
                </TouchableOpacity>

                <View style={{width: '10%'}} />

                <TouchableOpacity
                  style={styles.startButtons}
                  onPress={() => {
                    this.openScanner();
                  }}>
                  <Image
                    source={require('./image/scanlogoWHITE.png')}
                    style={{
                      maxWidth: '80%',
                      maxHeight: '80%',
                      marginTop: '29%',
                    }}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {this.state.playlistScreen ? (
            <View style={{height: '100%', width: '100%', alignItems: 'center'}}>
              <View style={{height: '3%'}}></View>

              <View
                style={{
                  height: '10%',
                  width: '85%',

                  alignItems: 'center',
                  borderRadius: 5,
                }}>
                <Image
                  source={require('./image/sopsimplelogo.png')}
                  style={{
                    maxWidth: '90%',
                    maxHeight: '90%',
                  }}
                />
              </View>

              <View style={{height: '6%'}}></View>

              <View style={{height: '6%'}}>
                <Text>
                  {this.playliststuff.playlistpage} of{' '}
                  {this.playliststuff.totalpages}
                </Text>
              </View>

              <View style={styles.buttonPlacement}>
                {this.playliststuff.playlistbutton1 ? (
                  <TouchableOpacity
                    style={styles.startButtons}
                    onPress={() => {
                      this.openSelectedVideo(
                        this.playliststuff.playlistURL[
                          this.playliststuff.playliststart
                        ],
                      );
                      this.openSelectedPlaylist(
                        this.playliststuff.playlistURL[
                          this.playliststuff.playliststart
                        ],
                      );
                    }}>
                    <Text style={{color: 'white'}}>
                      {
                        this.playliststuff.playlistTitle[
                          this.playliststuff.playliststart
                        ]
                      }
                    </Text>
                  </TouchableOpacity>
                ) : null}
                <View style={{width: '10%'}} />
                {this.playliststuff.playlistbutton2 ? (
                  <TouchableOpacity
                    style={styles.startButtons}
                    onPress={() => {
                      this.openSelectedVideo(
                        this.playliststuff.playlistURL[
                          this.playliststuff.playliststart
                        ],
                      );
                      this.openSelectedPlaylist(
                        this.playliststuff.playlistURL[
                          this.playliststuff.playliststart + 1
                        ],
                      );
                    }}>
                    <Text style={{color: 'white'}}>
                      {
                        this.playliststuff.playlistTitle[
                          this.playliststuff.playliststart + 1
                        ]
                      }
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              <View style={styles.buttonPlacement}>
                {this.playliststuff.playlistbutton3 ? (
                  <TouchableOpacity
                    style={styles.startButtons}
                    onPress={() => {
                      this.openSelectedVideo(
                        this.playliststuff.playlistURL[
                          this.playliststuff.playliststart
                        ],
                      );
                      this.openSelectedPlaylist(
                        this.playliststuff.playlistURL[
                          this.playliststuff.playliststart + 2
                        ],
                      );
                    }}>
                    <Text style={{color: 'white'}}>
                      {
                        this.playliststuff.playlistTitle[
                          this.playliststuff.playliststart + 2
                        ]
                      }
                    </Text>
                  </TouchableOpacity>
                ) : null}
                <View style={{width: '10%'}} />
                {this.playliststuff.playlistbutton4 ? (
                  <TouchableOpacity
                    style={styles.startButtons}
                    onPress={() => {
                      this.openSelectedVideo(
                        this.playliststuff.playlistURL[
                          this.playliststuff.playliststart
                        ],
                      );
                      this.openSelectedPlaylist(
                        this.playliststuff.playlistURL[
                          this.playliststuff.playliststart + 3
                        ],
                      );
                    }}>
                    <Text style={{color: 'white'}}>
                      {
                        this.playliststuff.playlistTitle[
                          this.playliststuff.playliststart + 3
                        ]
                      }
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              <View style={{height: '13%'}}>
                <View
                  style={{
                    flexDirection: 'row',
                    width: '70%',
                    justifyContent: 'space-between',
                  }}>
                  <TouchableOpacity
                    style={styles.changePageButtons}
                    onPress={() => {
                      this.previousPlaylists();
                    }}>
                    <Text style={{color: 'white'}}>Previous</Text>
                  </TouchableOpacity>

                  <View style={{width: '18%'}} />

                  <TouchableOpacity
                    style={styles.changePageButtons}
                    onPress={() => {
                      this.nextPlaylists();
                    }}>
                    <Text style={{color: 'white'}}>Next</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.bottomNav}>
                <TouchableOpacity
                  style={styles.bottomNavButtons}
                  onPress={() => this.openStart()}>
                  <Image
                    source={require('./image/backlogo.png')}
                    style={{
                      maxWidth: '90%',
                      maxHeight: '90%',
                      marginTop: '35%',
                    }}
                  />
                </TouchableOpacity>
                {this.playliststuff.inplaylist ? (
                  <TouchableOpacity
                    style={styles.bottomNavButtons}
                    onPress={() => {
                      this.getPlaylists();
                    }}>
                    <Image
                      source={require('./image/videosicon.png')}
                      style={{
                        maxWidth: '80%',
                        maxHeight: '80%',
                        marginTop: '25%',
                      }}></Image>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          ) : null}

          {this.state.scannerScreen ? (
            <View style={styles.cameraScreen}>
              <View style={{width: '100%', height: '70%'}}>
                <QRCodeScanner
                  ref={(node) => {
                    this.scanner = node;
                  }}
                  onRead={this.onRead}
                />
              </View>

              <View style={{height: '12%'}}></View>

              <View style={styles.bottomNav}>
                <TouchableOpacity
                  style={styles.bottomNavButtons}
                  onPress={() => this.openStart()}>
                  <Image
                    source={require('./image/backlogo.png')}
                    style={{
                      maxWidth: '90%',
                      maxHeight: '90%',
                      marginTop: '35%',
                    }}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {this.state.webScreen ? (
            <View
              style={{
                height: '100%',
                width: '100%',
                justifyContent: 'flex-start',
                alignItems: 'center',
              }}>
              <Video
                source={{
                  uri: this.state.qr,
                  headers: {
                    Authorization: this.state.bearerToken,
                  },
                }}
                ref={(ref) => {
                  this.player = ref;
                }}
                onBuffer={this.onBuffer}
                onError={this.videoError}
                style={{
                  height: '80%',
                  width: '100%',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    backgroundColor: 'white',
                    height: '10%',
                    width: '4%',
                  }}></View>
              </Video>

              <View style={{height: '2%'}}></View>

              <View style={styles.bottomNav}>
                <TouchableOpacity
                  style={styles.bottomNavButtons}
                  onPress={() => this.openStart()}>
                  <Image
                    source={require('./image/backlogo.png')}
                    style={{
                      maxWidth: '90%',
                      maxHeight: '90%',
                      marginTop: '35%',
                    }}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.bottomNavButtons}
                  onPress={() => {
                    this.openScanner();
                    //Vibration.vibrate();
                  }}>
                  <Image
                    source={require('./image/scanlogoWHITE.png')}
                    style={{
                      maxWidth: '80%',
                      maxHeight: '80%',
                      marginTop: '29%',
                    }}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {this.state.recordScreen ? (
            <View
              style={{
                width: '100%',
                height: '100%',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'center',
              }}>
              <View style={{width: '100%', height: '75%'}}>
                <RNCamera
                  captureAudio={this.state.captureAudio}
                  style={{flex: 1}}
                  ref={(cam) => {
                    this.camera = cam;
                  }}
                  type={this.state.cameraType}
                  mirrorImage={this.state.mirrorMode}></RNCamera>
              </View>

              <View style={{height: '7%%'}}></View>

              <View style={styles.bottomNav}>
                <TouchableOpacity
                  style={styles.bottomNavButtons}
                  onPress={() => this.openStart()}>
                  <Image
                    source={require('./image/backlogo.png')}
                    style={{
                      maxWidth: '90%',
                      maxHeight: '90%',
                      marginTop: '35%',
                    }}
                  />
                </TouchableOpacity>
                <View style={styles.outerRecordingButton}>
                  {!this.state.isRecording ? (
                    <TouchableOpacity onPress={() => this.takeVideo()}>
                      <View style={styles.recordingCircle}></View>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={{height: '100%'}}
                      onPress={() => this.stopVideo()}>
                      <View style={{height: '27%'}}></View>
                      <View style={styles.recordingSquare}></View>
                    </TouchableOpacity>
                  )}
                </View>
                {!this.state.isRecording ? (
                  <TouchableOpacity
                    style={styles.bottomNavButtons}
                    onPress={() => this.changeCameraType()}>
                    <View style={{height: '18%'}}></View>
                    <Image
                      source={require('./image/switchcameralogo.png')}
                      style={{maxHeight: '65%', maxWidth: '65%'}}
                    />
                  </TouchableOpacity>
                ) : (
                  <View
                    style={{
                      marginLeft: 5,
                      marginRight: 5,
                      width: '27%',
                    }}></View>
                )}
              </View>
            </View>
          ) : null}

          {this.state.previewScreen ? (
            <View
              style={{
                width: '100%',
                height: '100%',
                justifyContent: 'flex-start',
                alignItems: 'center',
              }}>
              <Video
                source={{uri: this.state.videoURI}} // Can be a URL or a local file.
                ref={(ref) => {
                  this.player = ref;
                }} // Store reference
                onBuffer={this.onBuffer} // Callback when remote video is buffering
                onError={this.videoError} // Callback when video cannot be loaded
                style={{
                  height: '80%',
                  width: '100%',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    backgroundColor: 'white',
                    height: '10%',
                    width: '4%',
                  }}></View>
              </Video>
              <View style={{height: '2%'}}></View>
              <View style={styles.bottomNav}>
                <TouchableOpacity
                  style={styles.bottomNavButtons}
                  onPress={() => this.openRecord()}>
                  <Image
                    source={require('./image/recordlogoWHITE.png')}
                    style={{
                      marginTop: '30%',
                      maxWidth: '80%',
                      maxHeight: '80%',
                    }}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.bottomNavButtons}
                  onPress={() => this.setTitle()}>
                  <Image
                    source={require('./image/sopsimpleqr.png')}
                    style={{
                      maxWidth: '70%',
                      maxHeight: '70%',
                      marginTop: '20%',
                    }}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {this.state.playlistScreen2 ? (
            <View
              style={{
                width: '100%',
                height: '100%',
                justifyContent: 'flex-start',
                alignItems: 'center',
              }}>
              <View style={{height: '80%', width: '100%'}}>
                <ScrollView
                  style={{
                    borderColor: 'black',
                    borderWidth: 1,
                  }}>
                  <TouchableOpacity onPress={() => this.openSelectedPlaylist()}>
                    <Text>{this.state.playlistTitle[0]}</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>

              <View style={{height: '2%'}}></View>

              <View style={styles.bottomNav}>
                <TouchableOpacity
                  style={styles.bottomNavButtons}
                  onPress={() => this.openStart()}>
                  <Image
                    source={require('./image/backlogo.png')}
                    style={{
                      maxWidth: '90%',
                      maxHeight: '90%',
                      marginTop: '35%',
                    }}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.bottomNavButtons}
                  onPress={() => this.chooseVideoFromLibrary()}>
                  <Image
                    source={require('./image/camerarolllogoWHITE.png')}
                    style={{
                      maxWidth: '90%',
                      maxHeight: '90%',
                      marginTop: '35%',
                    }}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.bottomNavButtons}
                  onPress={() => this.setTitle()}>
                  <Image
                    source={require('./image/sopsimpleqr.png')}
                    style={{
                      maxWidth: '70%',
                      maxHeight: '70%',
                      marginTop: '20%',
                    }}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {this.state.previewScreenFromRoll ? (
            <View
              style={{
                width: '100%',
                height: '100%',
                justifyContent: 'flex-start',
                alignItems: 'center',
              }}>
              {this.state.uploading && <ActivityIndicator />}
              <Video
                source={{uri: this.state.videoURI}} // Can be a URL or a local file.
                ref={(ref) => {
                  this.player = ref;
                }} // Store reference
                onBuffer={this.onBuffer} // Callback when remote video is buffering
                onError={this.videoError} // Callback when video cannot be loaded
                style={{
                  height: '80%',
                  width: '100%',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    backgroundColor: 'white',
                    height: '10%',
                    width: '4%',
                  }}></View>
              </Video>
              <View style={{height: '2%'}}></View>
              <View style={styles.bottomNav}>
                <TouchableOpacity
                  style={styles.bottomNavButtons}
                  onPress={() => this.openStart()}>
                  <Image
                    source={require('./image/backlogo.png')}
                    style={{
                      maxWidth: '90%',
                      maxHeight: '90%',
                      marginTop: '35%',
                    }}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.bottomNavButtons}
                  onPress={() => this.chooseVideoFromLibrary()}>
                  <Image
                    source={require('./image/camerarolllogoWHITE.png')}
                    style={{
                      maxWidth: '90%',
                      maxHeight: '90%',
                      marginTop: '35%',
                    }}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.bottomNavButtons}
                  onPress={() => this.setTitle()}>
                  <Image
                    source={require('./image/sopsimpleqr.png')}
                    style={{
                      maxWidth: '70%',
                      maxHeight: '70%',
                      marginTop: '20%',
                    }}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {this.state.messageScreen ? (
            <View
              style={{
                width: '100%',
                height: '100%',
                justifyContent: 'flex-start',
                alignItems: 'center',
              }}>
              <View
                style={{
                  width: '90%',
                  height: '70%',
                  backgroundColor: 'white',
                  borderRadius: 10,
                  justifyContent: 'flex-end',
                }}>
                <View
                  style={{
                    height: '12%',
                    width: '100%',
                    backgroundColor: 'rgb(50, 120, 255)',
                  }}>
                  <TextInput
                    style={styles.input}
                    onChangeText={this.onChangeText}
                    value={this.text}
                  />
                </View>
              </View>
            </View>
          ) : null}

          {this.state.rollScreen ? (
            <View
              style={{
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <ViewShot>
                <QRCode value={this.state.qr} size={300} />
              </ViewShot>

              <View style={styles.bottomNav}>
                <Button title="back" onPress={this.openStart}></Button>
              </View>
            </View>
          ) : null}

          {this.state.qrScreen ? (
            <View
              style={{
                width: '100%',
                height: '100%',
                justifyContent: 'flex-start',
                alignItems: 'center',
              }}>
              <View style={{height: '20%'}}></View>

              <ViewShot
                style={styles.container}
                options={{format: 'jpg', quality: 1.0}}
                onCapture={this.onCapture}
                captureMode="mount">
                <Text style={{textAlign: 'center'}}>
                  {this.state.videoTitle}
                </Text>
                <QRCode value={this.state.qr} size={300} />
              </ViewShot>

              <View style={{height: '21%'}}></View>

              <View style={styles.bottomNav}>
                <TouchableOpacity
                  style={styles.bottomNavButtons}
                  onPress={() => this.openStart()}>
                  <Image
                    source={require('./image/backlogo.png')}
                    style={{
                      maxWidth: '90%',
                      maxHeight: '90%',
                      marginTop: '35%',
                    }}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.bottomNavButtons}
                  onPress={this.choosePrinter}>
                  <View>
                    <Text
                      style={{
                        color: 'white',
                        fontFamily: 'AvenirNext-DemiBold',
                        fontSize: 20,
                      }}>
                      Print
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {this.state.uploading ? (
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: '100%',
              }}>
              <ActivityIndicator></ActivityIndicator>
              <Text>Uploading...</Text>
            </View>
          ) : null}
        </SafeAreaView>
      </>
    );
  }
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderBottomWidth: 1,
    width: '80%',
    opacity: 1,
    //borderColor: 'rgb(15, 42, 70)',
    //borderRadius: 15,
    //backgroundColor: 'lightgrey',
    //color: 'rgb(15, 42, 70)',
  },

  changePageButtons: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '45%',
    borderRadius: 30,
    backgroundColor: 'rgb(15, 42, 70)',
  },

  bottomNavButtons: {
    marginLeft: 5,
    marginRight: 5,
    height: '75%',
    width: '27%',
    backgroundColor: 'rgb(15, 42, 70)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },

  bottomNav: {
    //backgroundColor: 'rgb(230, 230, 235)',
    flexDirection: 'row',
    width: '100%',
    height: '18%',
    //alignItems: 'stretch',
    justifyContent: 'space-between',
  },

  wholeScreen: {
    height: '100%',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(240, 240, 245)',
  },

  leftBar: {
    height: '100%',
    width: '8%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: 'rgb(5, 32, 60)',
    borderRadius: 5,
  },

  leftBarLogos: {
    backgroundColor: 'rgb(25, 60, 120)',
    width: '83%',
    height: '10%',
    borderRadius: 100,
  },

  buttonPlacement: {
    height: '22%',
    width: '80%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },

  startButtons: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '81%',
    width: '45%',
    borderRadius: 30,
    backgroundColor: 'rgb(15, 42, 70)',
  },

  tokenSaver: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    backgroundColor: 'rgb(15, 42, 70)',
  },

  scannerButtons: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '50%',
    width: '40%',
    borderRadius: 30,
    backgroundColor: 'white',
  },

  cameraScreen: {
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },

  scannerButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '45%',
    width: '100%',
    borderRadius: 30,
    backgroundColor: 'white',
  },

  textStyle: {
    color: 'rgb(15, 42, 80)',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'AvenirNext-DemiBold',
    fontSize: 30,
  },

  logoSOP: {
    color: 'rgb(15, 42, 80)',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'Avenir-Heavy',
    fontSize: 60,
  },

  logoSimple: {
    color: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'AvenirNext-DemiBold',
    fontSize: 40,
  },

  outerRecordingButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
    width: 100,
    borderRadius: 50,
    backgroundColor: 'rgb(15, 42, 70)',
  },

  recordingCircle: {
    height: 80,
    width: 80,
    borderRadius: 40,
    backgroundColor: 'white',
  },

  recordingSquare: {
    height: 46,
    width: 46,
    backgroundColor: 'white',
  },
});

export default App;
