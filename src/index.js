import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './pages/App';
import {HashRouter as Router, Route} from 'react-router-dom';
import * as serviceWorker from './serviceWorker';

import { createStore,applyMiddleware } from 'redux';
import {Provider} from 'react-redux';
import thunk from 'redux-thunk'; // 中间件处理异步
import reducer from './store/index'; // 所有数据

// 创建全局store
let middleware = applyMiddleware(thunk);
const store = createStore(reducer,middleware);
ReactDOM.render(
    <Provider store={store}>
            <Router>
                <Route component={App}
                    path="/"
                />
            </Router>
    </Provider>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
