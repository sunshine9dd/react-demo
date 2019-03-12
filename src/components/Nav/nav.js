import React, {Component} from 'react';
import { Menu } from 'antd';
import './nav.css';
import {connect} from 'react-redux';
import { Link} from 'react-router-dom';
import {menuList} from '../../assets/js/api';

class Nav extends Component {
    constructor(props) {
        super(props);
        this.state={
            current: '/Home',
            menuList:[]
        }
    }
    // 耍新时判断当前路由
    componentDidMount(){
        let _this = this;
        if(sessionStorage.getItem('fuRuiAccount')){
            menuList({}).then(res => {
                if(res.code === 0){
                    _this.setState({
                        menuList:res.data
                    });
                }
            });
        }
        let path = this.props.pathName;
        let key = sessionStorage.getItem('fuRuiNavKey');
        let current = '';
        if(key){
            current = key;
        }else {
            current = path;
        }
        this.setState({
            current: current
        });
    }
    menuClick(e){
        this.setState({
            current: e.key
        });
        sessionStorage.setItem('fuRuiNavKey',e.key);
    }
    render() {
        let list = [];
        this.state.menuList.map(function (item) {
            list.push(<Menu.Item key={item.url}><Link to={item.url}>{item.menuName}</Link></Menu.Item>);
        });
        return (
            <div id="leftNav">
                <Menu mode="inline"
                    onClick={this.menuClick.bind(this)}
                    selectedKeys={[this.state.current]}
                    theme="dark"
                >
                    {list}
                </Menu>
            </div>
        )
    }
}
export default connect()(Nav);
