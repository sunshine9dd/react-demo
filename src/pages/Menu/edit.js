import React, { Component } from 'react';
import {connect} from 'react-redux';
import { Form, Input,Button,message,InputNumber,Radio,Select } from 'antd';
import Ueditor from '../../components/Ueditor/ueditor';
import {saveNavigate,getNavigateInfo,memberTypeList} from '../../assets/js/api';
import {loadingChangeFn} from '../../store/action';
import './edit.css';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;

let MenuEdit = class MenuEdit extends Component {
    constructor(props, context) {
        super(props, context);
        this.state={
            parentId:'',
            id:'',
            editorShow:false,
            richText:'',
            navigateType:'URL',
            typeList:[],
            memberType:'NONE',
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
        let parentId = sessionStorage.getItem("frzMenuId");
        _this.setState({
            parentId:parentId
        });
        memberTypeList({}).then(res => {
            if(res.code === 0){
                _this.setState({
                    typeList:res.data
                }, ()=> {
                   _this.getDetailFn();
                });
            }
        });
    }
    //获取详情
    getDetailFn(){
        let _this = this;
        let navId = sessionStorage.getItem("frzMenuEditId");
        if(navId){
            _this.props.dispatch(loadingChangeFn(true));
            getNavigateInfo({id:navId}).then(res => {
                _this.props.dispatch(loadingChangeFn(false));
                if(res.code === 0){
                    _this.props.form.setFieldsValue({
                        navigateName: res.data.navigateName,
                        url: res.data.url,
                        sort: res.data.sort
                    });
                    _this.setState({
                        id:res.data.id,
                        richText:res.data.richText,
                        memberType:res.data.memberType?res.data.memberType:'NONE',
                        navigateType: res.data.navigateType,
                        editorShow:true
                    })
                }
            });
        }else {
            _this.setState({
                editorShow:true
            })
        }
    }
    radioChangeFn(e){
        this.setState({
            navigateType: e.target.value
        });
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
                parentId:_this.state.parentId,
                sort:values.sort,
                navigateName:values.navigateName,
                memberType:_this.state.memberType,
                url:values.url,
                navigateType:this.state.navigateType,
                richText:_this.state.richText
            };
            if(data.navigateType === 'RICH_TEXT'){
                data.url = '/productCenter';
                if(!data.richText || data.richText === '<p><br></p>'){
                    message.error('请填写富文本内容！');
                    return;
                }
            }else {
                data.richText = '';
            }
            _this.props.dispatch(loadingChangeFn(true));
            saveNavigate(data).then(res => {
                _this.props.dispatch(loadingChangeFn(false));
                if(res.code === 0){
                    message.success('操作成功！');
                    window.history.back();
                }
            });
        });
    }
    memberTypeChange(value){
        this.setState({
            memberType:value
        });
    }
    goBackFn(){
        window.history.back();
    }
    setContentFn(value){
        this.setState({richText: value});
    }
    render(){
        const { getFieldProps } = this.props.form;
        return (
            <div className="menuEditBox">
                <div className="contentBox">
                    <Form>
                        <FormItem label="导航栏名称">
                            <Input
                                placeholder="请输入导航栏名称"
                                {...getFieldProps('navigateName',{
                                    rules: [
                                        {required: true, min:1, message: '至少输入1个字符！'},
                                        {required: true, max:20, message: '最多输入20个字符！'}
                                    ]
                                })}
                            />
                        </FormItem>
                        <FormItem label="成员类型">
                            <Select defaultValue={this.state.memberType}
                                onChange={this.memberTypeChange.bind(this)}
                                style={{ width: 200 }}
                                value={this.state.memberType}
                            >
                                {this.state.typeList.map(d => <Option key={d.type}
                                    value={d.type}
                                                              >{d.name}</Option>)}
                            </Select>
                        </FormItem>
                        <FormItem label="导航栏类型">
                            <RadioGroup onChange={this.radioChangeFn.bind(this)}
                                value={this.state.navigateType}
                            >
                                <Radio value="URL">超链接</Radio>
                                <Radio value="RICH_TEXT">富文本</Radio>
                            </RadioGroup>
                        </FormItem>
                        {this.state.navigateType === 'URL'?<FormItem label="导航栏地址">
                            <Input
                                placeholder="请输入导航栏地址"
                                {...getFieldProps('url',{
                                    rules: [
                                        {required: true, min:1, message: '至少输入1个字符！'},
                                        {required: true, max:100, message: '最多输入100个字符！'}
                                    ]
                                })}
                            />
                        </FormItem>:''}
                        {this.state.navigateType === 'RICH_TEXT'?<div className="newsTitle">富文本内容:</div>:''}
                        <div style={{display:(this.state.navigateType === 'RICH_TEXT')?'block':'none'}}>
                            {this.state.editorShow?<Ueditor id={'myEditor'} setContentFn={this.setContentFn.bind(this)} content={this.state.richText}/>:""}
                        </div>
                        <FormItem label="排序">
                            <InputNumber
                                className="inputNum"
                                min={1}
                                max={100}
                                placeholder="请输入排序号码"
                                {...getFieldProps('sort',{
                                    rules: [
                                        {required: true, message: '必须输入排序！'}
                                    ]
                                })}
                            />
                        </FormItem>
                        <Button className="submitBtn"
                            onClick={this.handleSubmit.bind(this)}
                            type="primary"
                        >确认</Button>
                        <Button
                            className="goBack"
                            onClick={this.goBackFn.bind(this)}
                            type="primary"
                        >返回上一页</Button>
                    </Form>
                </div>
            </div>
        )
    }
};
MenuEdit = Form.create()(MenuEdit);
export default connect()(MenuEdit);