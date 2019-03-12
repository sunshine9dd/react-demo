import {combineReducers} from 'redux';
import * as data from './reducer';

export default combineReducers({
    ...data
});