/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {Component} from 'react';
import MediaUploader from './MediaUploader';

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
} from 'react-native';

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

GoogleSignin.configure({
  scopes: [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/youtube',
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/plus.login',
    'https://www.googleapis.com/auth/youtubepartner',
    'https://www.googleapis.com/auth/youtube.force-ssl',
  ],
  webClientId:
    '914938236641-94a0qhj2mkhr42q17ba2ntchgn27te85.apps.googleusercontent.com', //oath2 web client id
  offlineAccess: true,
  iosClientId:
    '914938236641-m0i5tt3shosnuovqcviuf5ss0oet3v6g.apps.googleusercontent.com', //oath2 ios id

  // API KEY AIzaSyDdG7th-7xYRMFfuVpkvxjoqRdwpJ7NJYo - not sure if this needs to be used
});

class App extends Component {
  state = {
    currentUser: {},
    videoURI: '',
    qr: '',
    openCamera: false,
    ViewMode: false,
    startScreen: false,
    scannerScreen: false,
    recordScreen: false,
    webScreen: false,
    previewScreen: false,
    rollScreen: false,
    recording: false,
    captureAudio: true,

    isRecording: false,

    cameraType: 'back',
    mirrorMode: false,

    passedToken: '',
    userGoogleInfo: {},
    googleLoaded: false,
  };

  getCurrentUser = async () => {
    const currentUser = await GoogleSignin.getCurrentUser();
    this.setState({currentUser});
    console.log(currentUser.user.givenName);
  };

  mediaUpload = (file) => {
    var metadata = {
      snippet: {
        title: 'Testing video upload',
        description: 'A random video',
        categoryId: 22,
      },
      status: {
        privacyStatus: 'private',
        embeddable: true,
        license: 'youtube',
      },
    };
    var uploader = new MediaUploader({
      baseUrl: 'https://www.googleapis.com/upload/youtube/v3/videos',
      file: file,
      token: this.state.passedToken,
      metadata: metadata,
      id: 0,
      params: {
        part: Object.keys(metadata).join(','),
      },
      onError: function (data) {
        console.log('error', data);
        // onError code
      }.bind(this),
      onProgress: function (data) {
        console.log('Progress', data);
        // onProgress code
      }.bind(this),
      onComplete: function (data) {
        console.log('Complete', data);
        // onComplete code
      }.bind(this),
    });
    uploader.upload();
  };

  uploadVideo = () => {
    mediaUpload(this.state.videoURI);
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

  /*record = async () => {
    if (this.camera) {
      const options = {quality: 0.5, base64: true};
      const data = await this.camera.recordAsync(options);
      console.log(data.uri);
    }
  };*/

  takeVideo = async () => {
    const {isRecording} = this.state;
    this.setState({captureAudio: true});
    const options = {
      quality: RNCamera.Constants.VideoQuality['480p'],
      codec: RNCamera.Constants.VideoCodec['H264']
    }
    if (this.camera && !isRecording) {
      try {
        const promise = this.camera.recordAsync(options);

        if (promise) {
          this.setState({isRecording: true});
          const data = await promise;
          //console.warn('takeVideo', data.uri);
          CameraRoll.save(data.uri);
          this.setState({videoURI: data.uri});
          console.log(this.state.videoURI);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();

      this.setState({
        userGoogleInfo: userInfo,
        googleLoaded: true,
        passedToken: tokens.accessToken,
        startScreen: true,
      });
    } catch (error) {
      console.log(error.message);
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

  openPreview = () => {
    this.setState({startScreen: false});
    this.setState({recordScreen: false});
    this.setState({webScreen: false});
    this.setState({scannerScreen: false});
    this.setState({rollScreen: false});
    this.setState({previewScreen: true});
  };

  openRoll = () => {
    this.setState({previewScreen: false});
    this.setState({startScreen: false});
    this.setState({recordScreen: false});
    this.setState({webScreen: false});
    this.setState({scannerScreen: false});
    this.setState({rollScreen: true});
  };

  openScanner = () => {
    this.setState({previewScreen: false});
    this.setState({rollScreen: false});
    this.setState({startScreen: false});
    this.setState({recordScreen: false});
    this.setState({webScreen: false});
    this.setState({scannerScreen: true});
  };

  openStart = () => {
    this.getCurrentUser();
    console.log('STARTSCREEN');
    this.setState({previewScreen: false});
    this.setState({rollScreen: false});
    this.setState({scannerScreen: false});
    this.setState({recordScreen: false});
    this.setState({webScreen: false});
    this.setState({startScreen: true});
  };

  openRecord = () => {
    this.setState({videoURI: ''});
    this.setState({previewScreen: false});
    this.setState({rollScreen: false});
    this.setState({startScreen: false});
    this.setState({scannerScreen: false});
    this.setState({webScreen: false});
    this.setState({recordScreen: true});
  };

  openWeb = () => {
    this.setState({previewScreen: false});
    this.setState({rollScreen: false});
    this.setState({startScreen: false});
    this.setState({recordScreen: false});
    this.setState({scannerScreen: false});
    this.setState({webScreen: true});
  };

  onRead = (e) => {
    this.setState({previewScreen: false});
    this.setState({qr: e.data});
    this.setState({ViewMode: true});

    this.setState({rollScreen: false});
    this.setState({startScreen: false});
    this.setState({recordScreen: false});
    this.setState({scannerScreen: false});
    this.setState({webScreen: true});
  };

  setOpenCamera = () => {
    this.setState({openCamera: true});
  };

  setViewModeFalse = () => {
    this.setState({ViewMode: false});
  };

  render() {
    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={styles.wholeScreen}>
          {!this.state.googleLoaded ? (
            <View style={{height: '100%', width: '100%', alignItems: 'center'}}>
              <Image
                source={require('./image/easysoplogo.jpg')}
                style={{height: '15%', width: '75%', borderRadius: 20}}
              />

              <View style={{height: '12%'}}></View>
              <Text style={{color: 'white', fontFamily: 'AvenirNext-DemiBold'}}>
                Sign in with your Google account to upload videos
              </Text>
              <View style={{height: '5%'}}></View>
              <GoogleSigninButton
                onPress={this.signIn}
                size={GoogleSigninButton.Size.Wide}
                color={GoogleSigninButton.Color.Dark}
                style={{width: '55%', height: 48}}
              />
            </View>
          ) : null}
          {this.state.startScreen ? (
            <View style={{height: '100%', width: '100%', alignItems: 'center'}}>
              <Image
                source={require('./image/easysoplogo.jpg')}
                style={{height: '15%', width: '75%', borderRadius: 20}}
              />

              <View style={{height: '15%'}}></View>
              <View style={styles.buttonPlacement}>
                <TouchableOpacity
                  style={styles.startButtons}
                  onPress={() => {
                    this.openScanner();
                    //Vibration.vibrate();
                  }}>
                  <View>
                    <Text style={styles.textStyle}>SCANNER</Text>
                  </View>
                </TouchableOpacity>

                <View style={{height: '10%'}} />

                <TouchableOpacity
                  style={styles.startButtons}
                  onPress={() => this.openRecord()}>
                  <View style={styles.startButtons}>
                    <Text style={styles.textStyle}>RECORD</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {this.state.scannerScreen ? (
            <View style={styles.cameraScreen}>
              <View>
                <QRCodeScanner
                  ref={(node) => {
                    this.scanner = node;
                  }}
                  onRead={this.onRead}
                />
              </View>

              <View>
                <TouchableOpacity
                  style={styles.scannerButton}
                  onPress={() => {
                    this.openStart();
                    //Vibration.vibrate();
                  }}>
                  <View>
                    <Text style={styles.textStyle}>BACK</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {this.state.webScreen ? (
            <View
              style={{
                height: '100%',
                width: '100%',
              }}>
              <WebView source={{uri: this.state.qr}}></WebView>

              <View
                style={{
                  height: '30%',
                  width: '100%',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <TouchableOpacity
                  style={styles.scannerButtons}
                  onPress={() => {
                    this.openStart();
                  }}>
                  <View>
                    <Text style={styles.textStyle}>BACK</Text>
                  </View>
                </TouchableOpacity>

                <View style={{width: '10%'}}></View>

                <TouchableOpacity
                  style={styles.scannerButtons}
                  onPress={() => {
                    this.openScanner();
                  }}>
                  <View>
                    <Text style={styles.textStyle}>SCAN AGAIN</Text>
                  </View>
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

              <View style={{height: '6%'}}></View>

              <View
                style={{
                  width: '100%',
                  height: '40%',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <TouchableOpacity
                  style={{
                    height: '39%',
                    width: '25%',
                    borderRadius: 25,
                    backgroundColor: 'lightgrey',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={() => this.openStart()}>
                  <Text style={styles.textStyle}>BACK</Text>
                </TouchableOpacity>

                <View style={styles.outerRecordingButton}>
                  {!this.state.isRecording ? (
                    <TouchableOpacity onPress={() => this.takeVideo()}>
                      <View style={styles.recordingCircle}></View>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={() => this.stopVideo()}>
                      <View style={styles.recordingSquare}></View>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity
                  style={{
                    height: '39%',
                    width: '25%',
                    borderRadius: 25,
                    backgroundColor: 'lightgrey',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={() => this.changeCameraType()}>
                  <Image
                    source={require('./image/flip-camera.png')}
                    style={{height: '40%', width: '66%'}}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {this.state.previewScreen ? (
            <View
              style={{
                width: '100%',
                height: '100%',
                justifyContent: 'center',
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
              <View
                style={{height: '20%', width: '100%', flexDirection: 'row'}}>
                <TouchableOpacity
                  style={{
                    marginTop: '8%',
                    height: '80%',
                    width: '40%',
                    backgroundColor: 'lightgrey',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 25,
                  }}
                  onPress={() => this.openRecord()}>
                  <View>
                    <Text style={styles.textStyle}>RECORD AGAIN</Text>
                  </View>
                </TouchableOpacity>

                <View style={{width: '20%'}}></View>

                <TouchableOpacity
                  style={{
                    marginTop: '8%',
                    height: '80%',
                    width: '40%',
                    backgroundColor: 'lightgrey',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 25,
                  }}
                  //onPress={() => this.uploadVideo()}
                  onPress={() => this.mediaUpload(this.state.videoURI)}>
                  <View>
                    <Text style={styles.textStyle}>UPLOAD</Text>
                  </View>
                </TouchableOpacity>
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
              <Video
                source={{uri: this.state.videoURI}} // Can be a URL or a local file.
                ref={(ref) => {
                  this.player = ref;
                }} // Store reference
                onBuffer={this.onBuffer} // Callback when remote video is buffering
                onError={this.videoError} // Callback when video cannot be loaded
                style={{height: '100%', width: '100%'}}
              />
            </View>
          ) : null}
        </SafeAreaView>
      </>
    );
  }
}

/* QR CODE GENERATOR
{this.state.qr ? <QRCode value={this.state.qr} /> : null}
        {this.state.qr ? (
          <Button title="Open link" onPress={() => console.log('sd')}></Button>
        ) : null}

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{this.state.qr}</Text>
        </View>
*/

const styles = StyleSheet.create({
  wholeScreen: {
    height: '100%',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },

  buttonPlacement: {
    height: '40%',
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },

  startButtons: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '45%',
    width: '70%',
    borderRadius: 30,
    backgroundColor: 'lightgrey',
  },

  scannerButtons: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '50%',
    width: '40%',
    borderRadius: 30,
    backgroundColor: 'lightgrey',
  },

  cameraScreen: {
    flex: 1,
    justifyContent: 'center',
  },

  scannerButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '45%',
    width: '100%',
    borderRadius: 30,
    backgroundColor: 'lightgrey',
  },

  textStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'AvenirNext-DemiBold',
    fontSize: 30,
  },

  outerRecordingButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 110,
    width: 110,
    borderRadius: 55,
    backgroundColor: 'lightgrey',
  },

  recordingCircle: {
    height: 55,
    width: 55,
    borderRadius: 35,
    backgroundColor: 'red',
  },

  recordingSquare: {
    height: 45,
    width: 45,
    backgroundColor: 'red',
  },
});

export default App;
