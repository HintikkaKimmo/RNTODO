// @flow
import React from 'react';
import { StyleSheet, Text, View, StatusBar } from 'react-native';
import { LinearGradient } from 'expo';
import { primaryGradientArray } from './utils/Colors';
export default class Main extends React.Component {
  render() {
    return (
      <LinearGradient colors={primaryGradientArray} style={styles.container}>
        <StatusBar barStyle="light-content" />;
        <Text>Open up App.js to start working on your app!</Text>
      </LinearGradient>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
