// @flow
import React from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  AsyncStorage
} from 'react-native';
import { LinearGradient, Amplitude } from 'expo';
import uuid from 'uuid/v1';
import { primaryGradientArray } from './utils/Colors';
import Header from './components/Header';
import SubTitle from './components/SubTitle';
import Input from './components/Input';
import List from './components/List';
import Button from './components/Button';
const headerTitle = 'RNTODO';
export default class Main extends React.Component {
  state: any = {
    inputValue: '',
    loadingItems: false,
    allItems: {},
    isCompleted: false,
    user: 'testman'
  };
  componentDidMount = () => {
    this.loadingItems();
    Amplitude.initialize("d247884b28754c6b54bb21907e4c08d2");
    Amplitude.setUserId(this.state.user)
  };
  newInputValue = value => {
    this.setState({
      inputValue: value
    });
  };
  loadingItems = async () => {
    try {
      const allItems = await AsyncStorage.getItem('ToDos');
      this.setState({
        loadingItems: true,
        allItems: JSON.parse(allItems) || {}
      });
    } catch (err) {
      console.log(err);
    }
  };
  onDoneAddItem = () => {
    const { inputValue } = this.state;
    if (inputValue !== '') {
      this.setState(prevState => {
        const id = uuid();
        const newItemObject = {
          [id]: {
            id,
            isCompleted: false,
            text: inputValue,
            createdAt: Date.now()
          }
        };
        const newState = {
          ...prevState,
          inputValue: '',
          allItems: {
            ...prevState.allItems,
            ...newItemObject
          }
        };
        this.saveItems(newState.allItems);
        Amplitude.setUserProperties({"status":"activated"});
        Amplitude.logEventWithProperties("task added", {"id":id, "text": inputValue});
        return { ...newState };
      });
    }
  };
  deleteItem = id => {
    this.setState(prevState => {
      const allItems = prevState.allItems;
      delete allItems[id];
      const newState = {
        ...prevState,
        ...allItems
      };
      this.saveItems(newState.allItems);
      Amplitude.logEventWithProperties("task deleted", {"id":id})
      return { ...newState };
    });
  };
  completeItem = id => {
    this.setState(prevState => {
      const newState = {
        ...prevState,
        allItems: {
          ...prevState.allItems,
          [id]: {
            ...prevState.allItems[id],
            isCompleted: true
          }
        }
      };
      this.saveItems(newState.allItems);
      Amplitude.logEventWithProperties("task completed", {"id": id})
      return { ...newState };
    });
  };
  incompleteItem = id => {
    this.setState(prevState => {
      const newState = {
        ...prevState,
        allItems: {
          ...prevState.allItems,
          [id]: {
            ...prevState.allItems[id],
            isCompleted: false
          }
        }
      };
      this.saveItems(newState.allItems);
      return { ...newState };
    });
  };
  deleteAllItems = async () => {
    try {
      await AsyncStorage.removeItem('ToDos');
      this.setState({ allItems: {} });
    } catch (err) {
      console.log(err);
      Amplitude.logEvent("all tasks deleted")
    }
  };
  saveItems = newItem => {
    const saveItem = AsyncStorage.setItem('To Dos', JSON.stringify(newItem));
  };
  render() {
    const { inputValue, loadingItems, allItems } = this.state;
    return (
      <LinearGradient colors={primaryGradientArray} style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.centered}>
          <Header title={headerTitle} />
        </View>
        <View style={styles.inputContainer}>
          <SubTitle subtitle={"What's Next?"} />
          <Input
            inputValue={inputValue}
            onChangeText={this.newInputValue}
            onDoneAddItem={this.onDoneAddItem}
          />
        </View>
        <View style={styles.list}>
          <View style={styles.column}>
            <SubTitle subtitle={'Recent Notes'} />
            <View style={styles.deleteAllButton}>
              <Button deleteAllItems={this.deleteAllItems} />
            </View>
          </View>
          {loadingItems ? (
            <ScrollView contentContainerStyle={styles.scrollableList}>
              {Object.values(allItems)
                .reverse()
                .map(item => (
                  <List
                    key={item.id}
                    {...item}
                    deleteItem={this.deleteItem}
                    completeItem={this.completeItem}
                    incompleteItem={this.incompleteItem}
                  />
                ))}
            </ScrollView>
          ) : (
            <ActivityIndicator size="large" color="white" />
          )}
        </View>
      </LinearGradient>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  centered: {
    alignItems: 'center'
  },
  inputContainer: {
    marginTop: 40,
    paddingLeft: 15
  },
  list: {
    flex: 1,
    marginTop: 70,
    paddingLeft: 15,
    marginBottom: 10
  },
  scrollableList: {
    marginTop: 15
  },
  column: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  deleteAllButton: {
    marginRight: 40
  }
});