import React, { Component } from 'react';
import { Form, Input, Button ,Checkbox} from 'antd';
import './login.css';
import { JSEncrypt } from 'jsencrypt';
import {connect} from 'react-redux'; // action
import { loadingChangeFn } from '../../store/action/index';
import {userLogin,getQiniuToken} from '../../assets/js/api';
const FormItem = Form.Item;

let Login = class Login extends Component {
    constructor(props, context) {
        super(props, context);
        this.state={
            valuePropName:''
        }
    }
    // 加载完成后
    componentDidMount(){
        document.title='登录';
        let fuRuiAccount = localStorage.getItem('fuRuiAccount');
        if (fuRuiAccount) {
            fuRuiAccount = JSON.parse(fuRuiAccount);
            if (fuRuiAccount.account && fuRuiAccount.password) {
                this.props.form.setFieldsValue({
                    account: fuRuiAccount.account,
                    password: fuRuiAccount.password,
                    agreement: true
                });
                this.setState({
                    valuePropName:'checked'
                })
            }
        }
    }
    //对密码进行RSA加密
    rsaFn(newStr){
        let publicKey = 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKy3VA7wu/gU1J6ajXn5iXVygHZ3ikTiUPrrYZhYrr1KfXFuBC/nCMIxUGFcIHcvKWPr2RPu1iyq0a9WuljHQckCAwEAAQ=='; // 从后台获取公钥，这里省略，直接赋值
        let encryptor = new JSEncrypt() ; // 新建JSEncrypt对象
        encryptor.setPublicKey(publicKey);  // 设置公钥
        let rsaPassWord = encryptor.encrypt(newStr);
        rsaPassWord = encodeURIComponent(rsaPassWord);
        return rsaPassWord;
    }
    handleSubmit(e) {
        let _this = this;
        e.preventDefault();
        this.props.form.validateFields((errors, values) => {
            if (!!errors) {
                return;
            }
            let data = {
                account:values.account,
                password:this.rsaFn(values.password)
            };
            _this.props.dispatch(loadingChangeFn(true));
            userLogin(data).then(res => {
                if(res.code === 0){
                    res.data.password = values.password;
                    sessionStorage.setItem('fuRuiAccount', JSON.stringify(res.data));
                    //获取七牛host和token
                    getQiniuToken().then(data => {
                        if(data.code === 0){
                            _this.props.dispatch(loadingChangeFn(false));
                            res.data.qiniuHost = data.data.host+'/';
                            res.data.qiniuToken = data.data.token;
                            sessionStorage.setItem('fuRuiAccount', JSON.stringify(res.data));
                            sessionStorage.removeItem('fuRuiNavKey');//清除以前的导航session
                            if(values.agreement){
                                localStorage.setItem('fuRuiAccount', JSON.stringify(res.data));
                            }else{
                                localStorage.removeItem('fuRuiAccount');
                            }
                            this.props.history.push('/Home');
                        }else {
                            _this.props.dispatch(loadingChangeFn(false));
                        }
                    });
                }else {
                    _this.props.dispatch(loadingChangeFn(false));
                }
            });
        });
    }
    render(){
        const { getFieldProps } = this.props.form;
        return (
            <div className="loginBox">
                <div className="login">
                    <div className="box">
                        <h2>福瑞至后台管理系统</h2>
                        <Form horizontal="true">
                            <FormItem
                                label="账户"
                            >
                                <Input placeholder="请输入账户名"
                                    {...getFieldProps('account',{
                                           rules: [{
                                               required: true,
                                               min:1,
                                               message: '至少输入1个字符！'
                                           }]
                                       })}
                                />
                            </FormItem>
                            <FormItem
                                label="密码"
                            >
                                <Input placeholder="请输入密码"
                                    type="password"
                                    {...getFieldProps('password',{
                                           rules: [{
                                               required: true,
                                               min:6,
                                               message: '至少输入6个字符！'
                                           }]
                                       })}
                                />
                            </FormItem>
                            <FormItem>
                                <Checkbox  {...getFieldProps('agreement',{ valuePropName: this.state.valuePropName })}>记住密码</Checkbox>
                            </FormItem>
                            <FormItem wrapperCol={{ span: 12, offset: 7 }}>
                                <Button onClick={this.handleSubmit.bind(this)}
                                    type="primary"
                                >确定</Button>
                            </FormItem>
                        </Form>
                    </div>
                </div>
            </div>
        )
    }
};
Login = Form.create()(Login);
export default connect()(Login);
