import React, { Component } from 'react';
import {connect} from 'react-redux';
import { Form, Input,Button,message,Upload,Icon} from 'antd';
import {saveNews,getNewsInfo} from '../../assets/js/api';
import {loadingChangeFn, qiniuChangeFn} from '../../store/action';
import './edit.css';
import Ueditor from '../../components/Ueditor/ueditor';
const FormItem = Form.Item;
const { TextArea } = Input;

let NewsEdit = class NewsEdit extends Component {
    constructor(props, context) {
        super(props, context);
        this.state={
            id:'',
            editorShow:false,
            homeImg: '',
            homeImgUrl:'',
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
        let newsId = sessionStorage.getItem("frzNewsId");
        if(newsId){
            _this.props.dispatch(loadingChangeFn(true));
            getNewsInfo({id:newsId}).then(res => {
                _this.props.dispatch(loadingChangeFn(false));
                if(res.code === 0){
                    _this.props.form.setFieldsValue({
                        title: res.data.title,
                        subtitle: res.data.subtitle,
                        searchTitle:res.data.searchTitle,
                        desc:res.data.desc,
                        keyword:res.data.keyword,
                    });
                    _this.setState({
                        id:res.data.id,
                        homeImg: res.data.homeImg,
                        homeImgUrl:res.data.homeImgUrl,
                        content:res.data.content,
                        // editorShow:true
                    })
                }
                _this.setState({
                    editorShow:true
                })
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
                title:values.title,
                subtitle:values.subtitle,
                searchTitle:values.searchTitle,
                desc:values.desc,
                keyword:values.keyword,
                homeImg:_this.state.homeImg,
                content:_this.state.content
            };
            if(!data.homeImg){
                message.error('请上传新闻资讯封面图！');
                return;
            }else if(!data.content || data.content === '<p><br></p>'){
                message.error('请填写新闻资讯内容！');
                return;
            }
            _this.props.dispatch(loadingChangeFn(true));
            saveNews(data).then(res => {
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
                            homeImg: info.fileList[info.fileList.length - 1].response.key,
                            homeImgUrl: _this.state.qiniuHost + info.fileList[info.fileList.length - 1].response.key
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
                        <FormItem label="新闻资讯标题">
                            <Input
                                placeholder="请输入新闻资讯标题"
                                {...getFieldProps('title',{
                                    rules: [
                                        {required: true, min:1, message: '至少输入1个字符！'},
                                        {required: true, max:40, message: '最多输入40个字符！'}
                                    ]
                                })}
                            />
                        </FormItem>
                        <div className="newsTitle">新闻资讯封面图:</div>
                        <Upload {...props}>
                            <div className="uploadBox">
                                {this.state.homeImgUrl?<img src={this.state.homeImgUrl}/>:''}
                                {this.state.homeImgUrl?'':<Icon type={'plus'} />}
                            </div>
                        </Upload>
                        <FormItem label="新闻资讯简介">
                        <TextArea
                            autosize
                            placeholder="请输入新闻资讯简介"
                            {...getFieldProps('subtitle',{
                                rules: [
                                    {required: true, min:1, message: '至少输入1个字符！'},
                                    {required: true, max:300, message: '最多输入300个字符！'}
                                ]
                            })}
                        />
                        </FormItem>
                        <div className="newsTitle">新闻资讯内容:</div>
                        {this.state.editorShow?<Ueditor id={'myEditor'} setContentFn={this.setContentFn.bind(this)} content={this.state.content}/>:""}
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
NewsEdit = Form.create()(NewsEdit);
export default connect()(NewsEdit);