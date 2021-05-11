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
import ViewShot from 'react-native-view-shot';

class App extends Component {
  state = {
    videoURI: '',
    qr: '',
    openCamera: false,
    ViewMode: false,
    selectScreen: false,
    startScreen: true,
    scannerScreen: false,
    recordScreen: false,
    webScreen: false,
    previewScreen: false,
    rollScreen: false,
    messageScreen: false,
    recording: false,
    captureAudio: true,
    qrScreen: false,

    isRecording: false,

    cameraType: 'back',
    mirrorMode: false,
  };

  textInput = () => {
    const [text, onChangeText] = React.useState('some text');
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

  takeVideo = async () => {
    const {isRecording} = this.state;
    this.setState({captureAudio: true});
    const options = {
      quality: RNCamera.Constants.VideoQuality['480p'],
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
          console.log(this.state.videoURI);
        }
      } catch (e) {
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
  };

  openPreview = () => {
    this.setState({qrScreen: false});
    this.setState({selectScreen: false});
    this.setState({startScreen: false});
    this.setState({recordScreen: false});
    this.setState({webScreen: false});
    this.setState({scannerScreen: false});
    this.setState({rollScreen: false});
    this.setState({messageScreen: false});
    this.setState({previewScreen: true});
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
  };

  openStart = () => {
    this.setState({qrScreen: false});
    this.setState({selectScreen: false});
    this.setState({previewScreen: false});
    this.setState({rollScreen: false});
    this.setState({messageScreen: false});
    this.setState({scannerScreen: false});
    this.setState({recordScreen: false});
    this.setState({webScreen: false});
    this.setState({startScreen: true});
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
  };

  onRead = (e) => {
    this.setState({qrScreen: false});
    this.setState({selectScreen: false});
    this.setState({previewScreen: false});
    this.setState({qr: e.data});
    this.setState({ViewMode: true});
    this.setState({rollScreen: false});
    this.setState({messageScreen: false});
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
          {this.state.startScreen ? (
            <View style={{height: '100%', width: '100%', alignItems: 'center'}}>
              <View style={{height: '3%'}}></View>

              <View
                style={{
                  height: '10%',
                  width: '85%',
                  backgroundColor: 'white',
                  alignItems: 'center',
                  borderRadius: 5,
                }}>
                <Text style={styles.logoSOP}>SopSimple</Text>
              </View>

              <View style={{height: '15%'}}></View>

              <View style={styles.buttonPlacement}>
                <TouchableOpacity
                  style={styles.startButtons}
                  onPress={() => {
                    this.openScanner();
                    //Vibration.vibrate();
                  }}>
                  <View style={{height: '22%'}}></View>
                  <Image
                    source={require('./image/qrcodelogo.png')}
                    style={{
                      maxWidth: '80%',
                      maxHeight: '80%',
                    }}
                  />
                </TouchableOpacity>

                <View style={{width: '10%'}} />

                <TouchableOpacity
                  style={styles.startButtons}
                  onPress={() => this.openRecord()}>
                  <View style={{height: '21%'}}></View>
                  <Image
                    source={require('./image/recordlogo.png')}
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
                    this.openMessages();
                    //Vibration.vibrate();
                  }}>
                  <View style={{height: '29%'}}></View>
                  <Image
                    source={require('./image/messagelogo.png')}
                    style={{maxWidth: '80%', maxHeight: '80%'}}
                  />
                </TouchableOpacity>

                <View style={{width: '10%'}} />

                <TouchableOpacity
                  style={styles.startButtons}
                  onPress={() => {
                    this.openRoll();
                    //Vibration.vibrate();
                  }}>
                  <View style={{height: '29%'}}></View>
                  <Image
                    source={require('./image/camerarolllogo.png')}
                    style={{maxWidth: '90%', maxHeight: '90%'}}
                  />
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
              <Video
                source={{uri: this.state.qr}} // Can be a URL or a local file.
                ref={(ref) => {
                  this.player = ref;
                }} // Store reference
                onBuffer={this.onBuffer} // Callback when remote video is buffering
                onError={this.videoError} // Callback when video cannot be loaded
                style={{
                  height: '70%',
                  width: '100%',
                }}
              />

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
                    backgroundColor: 'white',
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
                    backgroundColor: 'white',
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
                    backgroundColor: 'white',
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
                    backgroundColor: 'white',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 25,
                  }}
                  onPress={() => this.openQR()}>
                  <View>
                    <Text style={styles.textStyle}>GET QR-CODE</Text>
                  </View>
                </TouchableOpacity>

                <View style={{width: '20%'}}></View>
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

          {this.state.qrScreen ? (
            <View
              style={{
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <ViewShot
                style={styles.container}
                ref="viewShot"
                options={{format: 'jpg', quality: 0.9}}>
                <QRCode value={this.state.qr} size={300} />
              </ViewShot>
              <View>
                <Button
                  style={styles.label}
                  title="Save"
                  onPress={this.saveScreenshot}
                />
              </View>
            </View>
          ) : null}
        </SafeAreaView>
      </>
    );
  }
}
/*
{this.state.qr ? <QRCode value={this.state.qr} /> : null}
        {this.state.qr ? (
          <Button title="Open link" onPress={() => console.log('sd')}></Button>
        ) : null}

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>{this.state.qr}</Text>
        </View> */

const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    width: '80%',
  },

  wholeScreen: {
    height: '100%',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(15, 42, 80)',
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
    backgroundColor: 'white',
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
    flex: 1,
    justifyContent: 'center',
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
    height: 110,
    width: 110,
    borderRadius: 55,
    backgroundColor: 'white',
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
