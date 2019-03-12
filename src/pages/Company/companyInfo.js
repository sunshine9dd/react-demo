import React, { Component } from 'react';
import {connect} from 'react-redux';
import { Form, Input,Button,message,Upload,Icon,InputNumber } from 'antd';
import Ueditor from '../../components/Ueditor/ueditor';
import {saveCompany,companyList} from '../../assets/js/api';
import {loadingChangeFn, qiniuChangeFn} from '../../store/action';
import './companyInfo.css';
const FormItem = Form.Item;
const { TextArea } = Input;

let CompanuInfo = class CompanuInfo extends Component {
    constructor(props, context) {
        super(props, context);
        this.state={
            id:'',
            logo: '',
            logoUrl:'',
            companyProfile:'',
            officeAddress:'',
            editorShow:false,
            qiniuHost:'',
            qiniuToken:''
        }
    }
    //组件初始化
    componentDidMount(){
        let _this = this;
        let fuRuiAccount = sessionStorage.getItem('fuRuiAccount');
        if (fuRuiAccount) {
            fuRuiAccount = JSON.parse(fuRuiAccount);
            if (fuRuiAccount.account && fuRuiAccount.password) {
                this.setState({
                    qiniuHost:fuRuiAccount.qiniuHost,
                    qiniuToken:fuRuiAccount.qiniuToken
                })
            }
        }
        _this.props.dispatch(loadingChangeFn(true));
        companyList({current:1,size:10}).then(res => {
            _this.props.dispatch(loadingChangeFn(false));
            if(res.code === 0){
                _this.props.form.setFieldsValue({
                    companyName: res.data.list[0].companyName,
                    phoneNumber: res.data.list[0].phoneNumber,
                    address: res.data.list[0].address,
                    fax: res.data.list[0].fax,
                    caseNumber: res.data.list[0].caseNumber,
                    zipCode: res.data.list[0].zipCode,
                    remarks: res.data.list[0].remarks
                });
                _this.setState({
                    id:res.data.list[0].id,
                    logo:res.data.list[0].logo,
                    companyProfile:res.data.list[0].companyProfile,
                    officeAddress:res.data.list[0].officeAddress,
                    logoUrl:res.data.list[0].logoUrl,
                    editorShow:true
                })
            }else {
                _this.setState({editorShow:true})
            }
        });
    }
    //点击提交
    handleSubmit(e) {
        let _this = this;
        e.preventDefault();
        this.props.form.validateFields((errors, values) => {
            if (!!errors) {
                message.error('还有部分信息填写错误哦！');
                return;
            }
            let data = {
                id:_this.state.id,
                companyName:values.companyName,
                phoneNumber:values.phoneNumber,
                address:values.address,
                caseNumber:values.caseNumber,
                zipCode:values.zipCode?values.zipCode:'',
                remarks:values.remarks?values.remarks:'',
                fax:values.fax?values.fax:'',
                logo:_this.state.logo,
                companyProfile:_this.state.companyProfile,
                officeAddress:_this.state.officeAddress
            };
            if(data.zipCode){
                let zipCodeRegular= /^[1-9][0-9]{5}$/;
                if(!zipCodeRegular.test(data.zipCode)){
                    message.error('邮编号码格式错误！');
                    return;
                }
            }
            if(data.fax){
                let faxRegular=  /^(\d{3,4}-)?\d{7,8}$/;
                if(!faxRegular.test(data.fax)){
                    message.error('传真号码格式错误！');
                    return;
                }
            }
            saveCompany(data).then(res => {
                if(res.code === 0){
                    document.documentElement.scrollTop = 0;
                    message.success('修改成功！');
                }
            });
        });
    }
    //检验手机号是否正确
    checkPhoneNumber(rule, value, callback){
        let mobileRegular=/^(0|86|17951)?(13[0-9]|15[012356789]|17[012345678]|18[0-9]|14[56789]|19[89]|166)[0-9]{8}$/;
        if(!mobileRegular.test(value)&&value!=''){
            callback([new Error('电话号码格式错误！')]);
        }else {
            callback();
        }
    }
    setContentFn(type,value){
        if(type == '1'){
            this.setState({companyProfile: value});
        }else {
            this.setState({officeAddress: value});
        }
    }
    render(){
        let _this = this;
        const { getFieldProps } = this.props.form;
        const phoneNumber = getFieldProps('phoneNumber',{
            rules: [
                {required: true, message: '手机号不能为空！'},
                {validator: this.checkPhoneNumber}
            ]
        });
        const props = {
            name: 'file',
            action: 'http://up.qiniu.com',
            showUploadList:false,
            accept:'image/gif,image/jpeg,image/png,image/jpg',
            listType:'picture',
            data:{
                token:_this.state.qiniuToken  //七牛token
            },
            beforeUpload(info){
                let type = info.name.replace(/.+\./, "");//截取文件名的后缀
                if(type.toLowerCase() == "gif" || type.toLowerCase() == "jpg" || type.toLowerCase() == "jpeg" || type.toLowerCase() == "png"){

                }else {
                    message.error("文件类型错误,请上传图片类型格式文件！");
                    return false;
                }
            },
            onChange(info) {
                if (info.file.status !== 'uploading') {
                    if(info.fileList[info.fileList.length - 1].response) {
                        _this.setState({
                            logo: info.fileList[info.fileList.length - 1].response.key,
                            logoUrl: _this.state.qiniuHost + info.fileList[info.fileList.length - 1].response.key
                        });
                    }
                }
                if (info.file.status === 'done') {
                    message.success(`${info.file.name} 上传成功。`);
                } else if (info.file.status === 'error') {
                    _this.props.dispatch(qiniuChangeFn(true));
                    message.error(`${info.file.name} 上传失败,请刷新后重试！`);
                }
            }
        };
        return (
            <div className="newsEditBox">
                <div className="contentBox">
                    <Form>
                        <FormItem label="公司名称">
                            <Input
                                placeholder="请输入公司名称"
                                {...getFieldProps('companyName',{
                                    rules: [
                                        {required: true, min:1, message: '至少输入1个字符！'},
                                        {max:30, message: '最多输入30个字符！'}
                                    ]
                                })}
                            />
                        </FormItem>
                        <FormItem label="公司电话">
                        <Input className="inputNum"
                            placeholder="请输入公司电话"
                            {...phoneNumber}
                        />
                        </FormItem>
                        <FormItem label="公司地址">
                            <Input
                                placeholder="请输入公司地址"
                                {...getFieldProps('address',{
                                    rules: [
                                        {required: true, min:1, message: '至少输入1个字符！'},
                                        { max:100, message: '最多100个字符！'}
                                    ]
                                })}
                            />
                        </FormItem>
                        <FormItem label="公司邮编">
                            <InputNumber className="inputNum"
                                placeholder="请输入公司邮编"
                                {...getFieldProps('zipCode')}
                            />
                        </FormItem>
                        <FormItem label="公司传真">
                            <Input className="inputNum"
                                placeholder="请输入公司传真"
                                {...getFieldProps('fax')}
                            />
                        </FormItem>
                        <FormItem label="公司LOGO">
                        <Upload {...props}>
                            <div className="uploadBox">
                                {this.state.logoUrl?<img src={this.state.logoUrl}/>:''}
                                {this.state.logoUrl?'':<Icon type={'plus'} />}
                            </div>
                        </Upload>
                        </FormItem>
                        <FormItem label="公司简介">
                            {this.state.editorShow?<Ueditor id={'companyProfile'} setContentFn={this.setContentFn.bind(this,'1')} content={this.state.companyProfile}/>:""}
                        </FormItem>
                        <FormItem label="备注">
                        <TextArea
                            autosize
                            placeholder="请输入备注"
                            {...getFieldProps('remarks')}
                        />
                        </FormItem>
                        <FormItem label="办公地址">
                            {this.state.editorShow?<Ueditor id={'officeAddress'} setContentFn={this.setContentFn.bind(this,'2')} content={this.state.officeAddress}/>:""}
                        </FormItem>
                        <FormItem label="网站备案号">
                            <Input
                                placeholder="请输入网站备案号"
                                {...getFieldProps('caseNumber',{
                                    rules: [
                                        {required: true, min:1, message: '至少输入1个字符！'},
                                        { max:100, message: '最多100个字符！'}
                                    ]
                                })}
                            />
                        </FormItem>
                        <Button className="submitBtn"
                            onClick={this.handleSubmit.bind(this)}
                            type="primary"
                        >确认修改</Button>
                    </Form>
                </div>
            </div>
        )
    }
};
CompanuInfo = Form.create()(CompanuInfo);
export default connect()(CompanuInfo);