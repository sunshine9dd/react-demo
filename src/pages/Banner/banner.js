import React, { Component } from 'react';
import {connect} from 'react-redux';
import { Table,Modal, Form, Input,Button ,message,Select,Icon,Upload,InputNumber} from 'antd';
import {bannerList,savebanner,getBannerInfo,deleteBanner} from '../../assets/js/api';
import {loadingChangeFn, qiniuChangeFn} from '../../store/action';
import './banner.css';
const FormItem = Form.Item;
const confirm = Modal.confirm;
const Option = Select.Option;

let Banner = class Banner extends Component {
    constructor(props, context) {
        super(props, context);
        this.state={
            modalVisible: false,
            modalTitle:'编辑banner',
            id:'',
            image: '',
            imageUrl:'',
            data:[],
            columns:[{
                title: 'banner名称',
                dataIndex: 'title',
                key: '0'
            }, {
                title: 'banner图片',
                key: '1',
                render: (record) => (<img className="bannerCover"
                                          src={record.imageUrl}
                />)
            },{
                title: '描述',
                dataIndex: 'desc',
                width:'300px',
                key: '2'
            },{
                title: '排序',
                dataIndex: 'sort',
                key: '3'
            }, {
                title: 'banner状态',
                key: '4',
                render: (record) => <div>{record.isShow === 'YES'?<span>显示</span>:<span>不显示</span>}</div>
            }, {
                title: '操作',
                key: '5',
                render: (record) => <div><a onClick={this.editMenu.bind(this,record)}>编辑</a> <a onClick={this.deleteMenu.bind(this,record)}>删除</a></div>
            }],
            loading:false,
            conditionIsShow:'',
            isShow:'YES',
            title:'',
            total:0,
            current:1,
            defaultCurrent:1,
            pageSize:10,
            qiniuHost:'',
            qiniuToken:''
        }
    }
    //组件初始化
    componentDidMount(){
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
        this.getMemberList(1);
    }
    //获取banner列表
    getMemberList(current){
        let _this = this;
        _this.setState({
            loading:true
        });
        let data = {
            isShow:this.state.conditionIsShow,
            title:this.state.title,
            current:current,
            size:this.state.pageSize
        };
        bannerList(data).then(res => {
            if(res.code === 0){
                for (let i in res.data.list){
                    res.data.list[i].key = i;
                }
                _this.setState({
                    loading:false,
                    data:res.data.list,
                    current:res.data.pageNo,
                    pageSize:res.data.pageSize,
                    total:res.data.totalCount
                });
            }
        });
    }
    //关闭弹窗
    setModalVisible() {
        this.setState({
            modalVisible:false,
            id:''
        });
    }
    //新增banner
    addMenu(){
        this.props.form.resetFields();
        this.setState({
            modalVisible:true,
            id:'',
            isShow:'YES',
            image:'',
            imageUrl:'',
            modalTitle:'增加banner'
        });
        this.props.form.setFieldsValue({
            title:'',
            desc:'',
            sort:1,
        });
    }
    //修改banner
    editMenu(record){
        let _this = this;
        _this.setState({
            modalVisible:true,
            id:record.id,
            image: record.image,
            imageUrl:record.imageUrl,
            isShow:record.isShow,
            modalTitle:'修改banner'
        });
        _this.props.form.setFieldsValue({
            title:record.title,
            desc:record.desc,
            sort:record.sort,
        });
    }
    //删除单个banner
    deleteMenu(record){
        let _this = this;
        confirm({
            title: '您确认要删除'+record.title+'吗?',
            cancelText:'取消',
            okText:'确认',
            onOk() {
                deleteBanner({data:{id:record.id}}).then(res => {
                    if(res.code === 0){
                        message.success('删除成功！');
                        _this.getMemberList(1);
                    }
                });
            }
        });
    }
    //提交banner
    confirmFn(){
        let _this = this;
        this.props.form.validateFields((errors, values) => {
            if (!!errors) {
                return;
            }
            let data = {
                id:_this.state.id,
                title:values.title,
                desc:values.desc,
                sort:values.sort,
                image:_this.state.image,
                isShow:_this.state.isShow,
            };
            _this.props.dispatch(loadingChangeFn(true));
            savebanner(data).then(res => {
                _this.props.dispatch(loadingChangeFn(false));
                if(res.code === 0){
                    message.success('操作成功！');
                    _this.setState({
                        modalVisible:false
                    });
                    _this.getMemberList(1);
                }
            });
        });
    }
    selectChange(value){
        this.setState({conditionIsShow:value});
    }
    editChange(value){
        this.setState({isShow:value});
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
                    if(info.fileList[info.fileList.length - 1].response){
                        _this.setState({
                            image: info.fileList[info.fileList.length - 1].response.key,
                            imageUrl:_this.state.qiniuHost + info.fileList[info.fileList.length - 1].response.key
                        });
                    }
                }
                if (info.file.status === 'done') {
                    message.success(`${info.file.name} 上传成功。`);
                } else if (info.file.status === 'error') {
                    _this.props.dispatch(qiniuChangeFn(true));
                    message.error(`${info.file.name} 上传失败!请刷新后重试`);
                }
            }
        };
        return (
            <div className="bannerBox">
                <div className="contentBox">
                    <div className="titleBox">
                        <Select defaultValue={this.state.conditionIsShow}
                                onChange={this.selectChange.bind(this)}
                                style={{ width: 200 }}
                                value={this.state.conditionIsShow}
                        >
                            <Option value="">全部</Option>
                            <Option value="YES">显示</Option>
                            <Option value="NO">不显示</Option>
                        </Select>
                        <Input placeholder="请输入banner名称" defaultValue={this.state.title} onChange={(e)=>{this.state.title = e.target.value}} className="searchInput"/>
                        <Button type="primary" onClick={this.getMemberList.bind(this,1)}>搜索</Button>
                        <Button onClick={this.addMenu.bind(this)} className="add"
                                type="primary"
                        >新增banner</Button></div>
                    <Table columns={this.state.columns}
                           dataSource={this.state.data}
                           loading={this.state.loading}
                           pagination={{
                               showQuickJumper:true,
                               defaultCurrent:this.state.defaultCurrent,
                               total:this.state.total,
                               current:this.state.current,
                               pageSize:this.state.pageSize,
                               onChange(num){
                                   _this.getMemberList(num);
                               }
                           }}
                    />
                </div>
                <Modal
                    cancelText="取消"
                    okText="确认"
                    onCancel={() => this.setModalVisible()}
                    onOk={() => this.confirmFn(false)}
                    title={this.state.modalTitle}
                    visible={this.state.modalVisible}
                    wrapClassName="vertical-center-modal"
                >
                    <Form className="bannerForm">
                        <FormItem label="banner名称">
                            <Input
                                placeholder="请输入banner名称"
                                {...getFieldProps('title',{
                                    rules: [
                                        {required: true, min:1, message: '至少输入1个字符！'},
                                        {required: true, max:40, message: '最多输入40个字符！'}
                                    ]
                                })}
                            />
                        </FormItem>
                        <div className="newsTitle">banner图片:</div>
                        <Upload {...props}>
                            <div className="uploadBox">
                                {this.state.imageUrl?<img src={this.state.imageUrl}/>:''}
                                {this.state.imageUrl?'':<Icon type={'plus'} />}
                            </div>
                        </Upload>
                        <FormItem label="banner描述">
                        <Input
                            placeholder="请输入banner描述"
                            {...getFieldProps('desc',{
                                rules: [
                                    {required: true, min:1, message: '至少输入1个字符！'},
                                    {required: true, max:100, message: '最多输入100个字符！'}
                                ]
                            })}
                        />
                        </FormItem>
                        <FormItem label="banner排序">
                            <InputNumber
                                className="inputNum"
                                min={1}
                                max={100}
                                placeholder="请输入排序号码"
                                {...getFieldProps('sort',{
                                    rules: [
                                        {required: true ,message: '必须输入排序！'}
                                    ]
                                })}
                            />
                        </FormItem>
                        <div className="newsTitle">banner状态:</div>
                        <Select defaultValue={this.state.isShow}
                                onChange={this.editChange.bind(this)}
                                style={{ width: 200 }}
                                value={this.state.isShow}
                        >
                            <Option value="YES">显示</Option>
                            <Option value="NO">不显示</Option>
                        </Select>
                    </Form>
                </Modal>
            </div>
        )
    }
};
Banner = Form.create()(Banner);
export default connect()(Banner);