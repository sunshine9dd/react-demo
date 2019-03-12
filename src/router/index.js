import React from 'react';
import {Route, Switch} from 'react-router-dom';

import Login from '../pages/Login/login';
import Home from '../pages/Home/home';
import Company from '../pages/Company/company';
import FriendshipLink from '../pages/FriendshipLink/friendshipLink';
import Member from '../pages/Member/member';
import MemberEdit from '../pages/Member/edit';
import Menu from '../pages/Menu/menu';
import MenuChild from '../pages/Menu/menuChild';
import MenuEdit from '../pages/Menu/edit';
import News from '../pages/News/news';
import NewsEdit from '../pages/News/edit';
import User from '../pages/User/user';
import Banner from '../pages/Banner/banner';
import CompanyInfo from '../pages/Company/companyInfo';


export default () => (
    <div>
        <Switch>
            <Route component={Login}
                exact
                path="/"
            />
            <Route component={Home}
                path="/Home"
            />
            <Route component={Company}
                path="/Company"
            />
              <Route component={CompanyInfo}
                  path="/CompanyInfo"
              />
            <Route component={FriendshipLink}
                path="/FriendshipLink"
            />
            <Route component={Member}
                path="/Member"
            />
            <Route component={MemberEdit}
                path="/MemberEdit"
            />
            <Route component={Menu}
                path="/Menu"
            />
            <Route component={MenuChild}
                path="/MenuChild"
            />
            <Route component={MenuEdit}
                path="/MenuEdit"
            />
            <Route component={News}
                path="/News"
            />
            <Route component={NewsEdit}
                path="/NewsEdit"
            />
            <Route component={User}
                path="/User"
            />
            <Route component={Banner}
                   path="/Banner"
            />
        </Switch>
    </div>
);
