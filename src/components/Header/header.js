import React, {Component} from 'react';
import './header.css';
import { Menu, Dropdown, Icon } from 'antd';
import {connect} from 'react-redux';
import {hashHistory} from 'react-router'

const onClick = function () {
    sessionStorage.removeItem('fuRuiAccount');
    sessionStorage.removeItem('fuRuiNavKey');
    hashHistory.push('/');
    window.location.reload();
};

const menu = (
    <Menu onClick={onClick}>
        <Menu.Item key="0">退出</Menu.Item>
    </Menu>
);
class Header extends Component {
    constructor(props, context) {
        super(props, context);
        this.state={
            userName:''
        }
    }
    // 加载完成后
    componentDidMount(){
        let fuRuiAccount = sessionStorage.getItem('fuRuiAccount');
        if (fuRuiAccount) {
            fuRuiAccount = JSON.parse(fuRuiAccount);
            if (fuRuiAccount.account && fuRuiAccount.password) {
                this.setState({
                    userName:fuRuiAccount.userName
                })
            }
        }else {
            this.props.history.push("/") ;//跳转到登录
        }
    }
    render() {
        return (
            <div id="headerTop">
               <h2>福瑞至后台管理系统</h2>
                <Dropdown overlay={menu}>
                    <div className="ant-dropdown-link" >
                        {this.state.userName} <Icon type="caret-down" />
                    </div>
                </Dropdown>
            </div>
        )
    }
}
export default connect()(Header);