import React from "react";

import { Route, HashRouter, Switch } from 'react-router-dom'

import App from './App';
import NotFoundPage from './components/NotFoundPage/NotFoundPage';
import Historic from './views/Historic/Historic'

const Routes = () => (
    <HashRouter basename="/">
      <Switch>
        <Route exact path='/' component={() => <App/>} />
        <Route path='/history'  component={() => <Historic/>} />
        <Route path='*' exact={true} component={NotFoundPage} />
      </Switch>
    </HashRouter>
  );

export default Routes;