import React, { Component } from 'react';
import { Form, Input, Button,message } from 'antd';
import './user.css';
import { JSEncrypt } from 'jsencrypt';
import {connect} from 'react-redux'; // action
import { loadingChangeFn } from '../../store/action/index';
import {userSave} from '../../assets/js/api';
const FormItem = Form.Item;

let User = class User extends Component {
    constructor(props, context) {
        super(props, context);
        this.state={
            id:'',
            qiniuHost:'',
            avatar:'FlaSfW3iqckj-0abHkRNLi-zW43F',
            avatarUrl:'',
            fileList:[],
            qiniuToken:''
        }
    }
    // 加载完成后
    componentDidMount(){
        let fuRuiAccount = sessionStorage.getItem('fuRuiAccount');
        if (fuRuiAccount) {
            fuRuiAccount = JSON.parse(fuRuiAccount);
            if (fuRuiAccount.account && fuRuiAccount.password) {
                this.props.form.setFieldsValue({
                    account: fuRuiAccount.account,
                    password: fuRuiAccount.password,
                    userName: fuRuiAccount.userName
                    // phoneNumber: fuRuiAccount.phoneNumber
                });
                this.setState({
                    id:fuRuiAccount.id
                    // avatarUrl:fuRuiAccount.avatarUrl,
                    // qiniuHost:fuRuiAccount.qiniuHost,
                    // qiniuToken:fuRuiAccount.qiniuToken
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
                id:_this.state.id,
                account:values.account,
                password:_this.rsaFn(values.password),
                userName:values.userName
                // phoneNumber:values.phoneNumber,
                // avatar:_this.state.avatar
            };
            _this.props.dispatch(loadingChangeFn(true));
            userSave(data).then(res => {
                _this.props.dispatch(loadingChangeFn(false));
                if(res.code === 0){
                    message.success('修改成功！');
                    setTimeout(function () {
                        sessionStorage.removeItem('fuRuiAccount');
                        localStorage.removeItem('fuRuiAccount');
                        _this.props.history.push("/") ;//跳转到登录
                    },1000)
                }
            });
        });
    }
    //检验手机号是否正确
    // checkPhoneNumber(rule, value, callback){
    //     let mobileRegular=/^(0|86|17951)?(13[0-9]|15[012356789]|17[012345678]|18[0-9]|14[56789]|19[89]|166)[0-9]{8}$/;
    //     if(!mobileRegular.test(value)){
    //         callback([new Error('手机号格式错误！')]);
    //     }else {
    //         callback();
    //     }
    // }
    render(){
        // let _this = this;
        const { getFieldProps } = this.props.form;
        // const phoneNumber = getFieldProps('phoneNumber',{
        //     rules: [
        //         {required: true, message: '手机号不能为空！'},
        //         {validator: this.checkPhoneNumber}
        //     ]
        // });
        // const props = {
        //     name: 'file',
        //     action: 'http://up.qiniu.com',
        //     showUploadList:false,
        //     accept:'image/gif,image/jpeg,image/png,image/jpg',
        //     listType:'picture',
        //     data:{
        //         token:_this.state.qiniuToken  //七牛token
        //     },
        //     onChange(info) {
        //         if (info.file.status !== 'uploading') {
        //             _this.setState({
        //                 avatar: info.fileList[0].response.key,
        //                 avatarUrl:_this.state.qiniuHost + info.fileList[0].response.key
        //             })
        //         }
        //         if (info.file.status === 'done') {
        //             message.success(`${info.file.name} 上传成功。`);
        //         } else if (info.file.status === 'error') {
        //             message.error(`${info.file.name} 上传失败。`);
        //         }
        //     }
        // };
        return (
            <div className="userBox">
                <div className="contentBox">
                    <Form inline="true">
                        {/*<div className="avatarUrl">头像：<img src={this.state.avatarUrl?this.state.avatarUrl:(this.state.qiniuHost+'FlaSfW3iqckj-0abHkRNLi-zW43F')} />*/}
                        {/*<Upload {...props}>*/}
                        {/*<Button type="primary">修改头像</Button>*/}
                        {/*</Upload>*/}
                        {/*</div>*/}
                        <FormItem label="用户昵称">
                            <Input disabled
                                placeholder="请输入用户名"
                                {...getFieldProps('userName',{
                                       rules: [
                                           {required: true, min:1, message: '至少输入1个字符！'},
                                           {required: true, max:20, message: '最多输入20个字符！'}
                                       ]
                                   })}
                            />
                        </FormItem>
                        <FormItem label="登录账号">
                            <Input disabled
                                placeholder="请输入账号名"
                                {...getFieldProps('account',{
                                       rules: [
                                           {required: true, min:1, message: '至少输入1个字符！'},
                                           {required: true, max:20, message: '最多输入20个字符！'}
                                       ]
                                   })}
                            />
                        </FormItem>
                        <FormItem label="登录密码">
                            <Input
                                placeholder="请输入密码"
                                type="password"
                                {...getFieldProps('password',{
                                    rules: [
                                        {required: true, min:6, message: '至少输入6个字符！'},
                                        {required: true, max:20, message: '最多输入20个字符！'}
                                    ]
                                })}
                            />
                        </FormItem>
                        {/*<FormItem label="手机号码">*/}
                        {/*<Input*/}
                        {/*placeholder="请输入手机号码"*/}
                        {/*{...phoneNumber}*/}
                        {/*/>*/}
                        {/*</FormItem>*/}
                        <Button onClick={this.handleSubmit.bind(this)}
                            type="primary"
                        >更新账户</Button>
                    </Form>
                </div>
            </div>
        )
    }
};
User = Form.create()(User);
export default connect()(User);
