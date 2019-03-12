import React, { Component } from 'react';
import Header from '../components/Header/header';
import Nav from '../components/Nav/nav';
import { Spin  } from 'antd';
import './App.css';
import getRouter from '../router/index';
import { connect } from 'react-redux';
import {getQiniuToken} from '../assets/js/api';
import {qiniuChangeFn} from '../store/action';

class App extends Component {
    constructor(props) {
        super(props);
        this.state={
            navigateShow: false
        }
    }
    // 刷新时判断当前路由
    componentDidMount(){
        let path=this.props.history.location.pathname;// 当前路由名字
       this.checkPathFn(path);
          this.setTitleFn();
    }
    // 路由发生变化-触发生命周期函数
    UNSAFE_componentWillReceiveProps(){
        let {pathname} =this.props.history.location;// 当前路由名字
        this.checkPathFn(pathname);
        this.setTitleFn();
    }
    //设置头部title
    setTitleFn(){
        let pathname = sessionStorage.getItem('fuRuiNavKey');
        switch(pathname){
            case '/':
                document.title='登录';
                break;
            case '/Home':
                document.title='菜单管理';
                break;
            case '/CompanyInfo':
                document.title='公司管理';
                break;
            case '/FriendshipLink':
                document.title='友情链接';
                break;
            case '/Member':
                document.title='成员管理';
                break;
            case '/Menu':
                document.title='导航栏管理';
                break;
            case '/News':
                document.title='新闻资讯';
                break;
            case '/User':
                document.title='用户管理';
                break;
            default:
                document.title='福瑞至';
                break;
        }
    }
    /**
     * loading组件是否显示
     */
    loadingShowFn(){
        let {loadingChangeData:{loadingStatus}}=this.props;
        if(loadingStatus){
            return <div id="loadingBox"><Spin /></div>;
        }
    }
    /**
     * 是否重新获取七牛token
     */
    getQiniuTokenFn(){
        let _this = this;
        let {qiniuChangeData:{qiniuStatus}}=this.props;
        let fuRuiAccount = sessionStorage.getItem('fuRuiAccount');
        if(qiniuStatus && fuRuiAccount){
            //获取七牛host和token
            getQiniuToken().then(res => {
                if(res.code === 0){
                    fuRuiAccount = JSON.parse(fuRuiAccount);
                    fuRuiAccount.qiniuHost = res.data.host+'/';
                    fuRuiAccount.qiniuToken = res.data.token;
                    sessionStorage.setItem('fuRuiAccount', JSON.stringify(fuRuiAccount));
                }
                _this.props.dispatch(qiniuChangeFn(false));
            });
        }
    }
    /**
     * 是否展示导航栏
     */
    checkPathFn(path){
        if(path==='/'){
            this.setState({
                navigateShow:false
            })
        }else{
            this.setState({
                navigateShow:true
            })
        }
    }
  render() {
    return (
      <div className="App">
          {this.state.navigateShow?<Header {...this.props}></Header>:''}
          {this.state.navigateShow?<Nav pathName={this.props.history.location.pathname} ></Nav>:'' }
          {this.loadingShowFn()}
          {this.getQiniuTokenFn()}
          <div id="appContent">
              {getRouter()}
          </div>
      </div>
    );
  }
}

export default connect(({loadingChangeData,qiniuChangeData})=>{return {loadingChangeData,qiniuChangeData}})(App);
