import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import NewApp from './restruct/App';

import './index.scss';
import 'animate.css';
import './theme/index.scss';

ReactDOM.render(<App/>, document.getElementById('root'));
ReactDOM.render(<NewApp/>, document.getElementById('new-root'));
