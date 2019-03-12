import React, { Component } from 'react';
import {connect} from 'react-redux';
import { Form, Input,Button,message,Upload,Icon,Select,Radio} from 'antd';
import Ueditor from '../../components/Ueditor/ueditor';
import {saveMember, getMemberInfo, memberTypeList} from '../../assets/js/api';
import {loadingChangeFn, qiniuChangeFn} from '../../store/action';
import './edit.css';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const Option = Select.Option;

let MemberEdit = class MemberEdit extends Component {
    constructor(props, context) {
        super(props, context);
        this.state={
            id:'',
            typeList:[],
            editorShow:false,
            memberImage: '',
            memberImageUrl:'',
            formMemberType:'',
            contentType:'URL',
            content:'',
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
        memberTypeList({}).then(res => {
            if(res.code === 0){
                res.data.splice(0, 1);
                _this.setState({
                    typeList:res.data,
                    formMemberType:res.data[0].type
                }, ()=> {
                    _this.getDetailFn();
                });
            }
        });

    }
    //获取成员详情
    getDetailFn(){
        let _this = this;
        let memberId = sessionStorage.getItem("frzMemberEditId");
        if(memberId){
            _this.props.dispatch(loadingChangeFn(true));
            getMemberInfo({id:memberId}).then(res => {
                _this.props.dispatch(loadingChangeFn(false));
                if(res.code === 0){
                    _this.props.form.setFieldsValue({
                        memberName: res.data.memberName,
                        url: res.data.url,
                        searchTitle:res.data.searchTitle,
                        desc:res.data.desc,
                        keyword:res.data.keyword,
                    });
                    _this.setState({
                        id:res.data.id,
                        memberImage: res.data.memberImage,
                        memberImageUrl:res.data.memberImageUrl,
                        formMemberType:res.data.memberType,
                        contentType:res.data.contentType,
                        content:res.data.content,
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
    handleSubmit(e) {
        let _this = this;
        e.preventDefault();
        this.props.form.validateFields((errors, values) => {
            if (!!errors) {
                return;
            }
            let data = {
                id:_this.state.id,
                memberName:values.memberName,
                url:values.url,
                searchTitle:values.searchTitle,
                desc:values.desc,
                keyword:values.keyword,
                memberImage:_this.state.memberImage,
                memberType:_this.state.formMemberType,
                contentType:_this.state.contentType,
                content:_this.state.content
            };
            if(!data.memberImage){
                message.error('请上传成员封面图！');
                return;
            }
            if(data.contentType === 'RICH_TEXT'){
                data.url = '/memberInfo';
                if(!data.content || data.content === '<p><br></p>'){
                    message.error('请填写富文本内容！');
                    return;
                }
            }else {
                data.content = "";
            }
            _this.props.dispatch(loadingChangeFn(true));
            saveMember(data).then(res => {
                _this.props.dispatch(loadingChangeFn(false));
                if(res.code === 0){
                    message.success('操作成功！');
                    window.history.back();
                }
            });
        });
    }
    goBackFn(){
        window.history.back();
    }
    formSelectChange(value){
        this.setState({
            formMemberType:value
        });
    }
    radioChangeFn(e){
        this.setState({
            contentType: e.target.value
        });
    }
    setContentFn(value){
        this.setState({content: value});
    }
    render(){
        let _this = this;
        const { getFieldProps } = this.props.form;
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
                            memberImage: info.fileList[info.fileList.length - 1].response.key,
                            memberImageUrl: _this.state.qiniuHost + info.fileList[info.fileList.length - 1].response.key
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
            <div className="MemberEditBox">
                <div className="contentBox">
                    <Form>
                        <FormItem label="成员名称">
                            <Input
                                placeholder="请输入成员名称"
                                {...getFieldProps('memberName',{
                                    rules: [
                                        {required: true, min:1, message: '至少输入1个字符！'},
                                        {required: true, max:20, message: '最多输入20个字符！'}
                                    ]
                                })}
                            />
                        </FormItem>
                        <div className="newsTitle">成员类型:</div>
                        <Select defaultValue={this.state.formMemberType}
                                onChange={this.formSelectChange.bind(this)}
                                style={{ width: 200,marginBottom:24 }}
                                value={this.state.formMemberType}
                        >
                            {this.state.typeList.map(d => <Option key={d.type}
                                                                  value={d.type}
                            >{d.name}</Option>)}
                        </Select>
                        <div className="newsTitle">成员封面图:</div>
                        <Upload {...props}>
                            <div className="uploadBox">
                                {this.state.memberImageUrl?<img src={this.state.memberImageUrl}/>:''}
                                {this.state.memberImageUrl?'':<Icon type={'plus'} />}
                            </div>
                        </Upload>
                        <FormItem label="成员内容类型">
                            <RadioGroup onChange={this.radioChangeFn.bind(this)}
                                        value={this.state.contentType}
                            >
                                <Radio value="URL">超链接</Radio>
                                <Radio value="RICH_TEXT">富文本</Radio>
                            </RadioGroup>
                        </FormItem>
                        {this.state.contentType === 'URL'?<FormItem label="跳转路径">
                            <Input
                                placeholder="请输入成员跳转路径"
                                {...getFieldProps('url',{
                                    rules: [
                                        {required: true, min:1, message: '至少输入1个字符！'},
                                        {required: true, max:100, message: '最多输入100个字符！'}
                                    ]
                                })}
                            />
                        </FormItem>:''}
                        {this.state.contentType === 'RICH_TEXT'?<div className="newsTitle">富文本内容:</div>:''}
                        <div style={{display:(this.state.contentType === 'RICH_TEXT')?'block':'none'}}>
                            {this.state.editorShow?<Ueditor id={'myEditor'} setContentFn={this.setContentFn.bind(this)} content={this.state.content}/>:""}
                        </div>
                        <FormItem label="搜索标题">
                            <Input
                                placeholder="请输入新闻资讯搜索标题"
                                {...getFieldProps('searchTitle',{
                                    rules: [
                                        {required: true, min:1, message: '至少输入1个字符！'},
                                        {required: true, max:40, message: '最多输入40个字符！'}
                                    ]
                                })}
                            />
                        </FormItem>
                        <FormItem label="搜索描述">
                            <Input
                                placeholder="请输入新闻资讯搜索描述"
                                {...getFieldProps('desc',{
                                    rules: [
                                        {required: true, min:1, message: '至少输入1个字符！'},
                                        {required: true, max:40, message: '最多输入40个字符！'}
                                    ]
                                })}
                            />
                        </FormItem>
                        <FormItem label="搜索关键字">
                            <Input
                                placeholder="请输入新闻资讯搜索描述"
                                {...getFieldProps('keyword',{
                                    rules: [
                                        {required: true, min:1, message: '至少输入1个字符！'},
                                        {required: true, max:40, message: '最多输入40个字符！'}
                                    ]
                                })}
                            />
                        </FormItem>
                        <Button className="submitBtn"
                                onClick={this.handleSubmit.bind(this)}
                                type="primary"
                        >确认</Button>
                        <Button className="goBack"
                                onClick={this.goBackFn.bind(this)}
                                type="primary"
                        >返回上一页</Button>
                    </Form>
                </div>
            </div>
        )
    }
};
MemberEdit = Form.create()(MemberEdit);
export default connect()(MemberEdit);