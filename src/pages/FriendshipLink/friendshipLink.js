import React, { Component } from 'react';
import {connect} from 'react-redux';
import { Table,Modal, Form, Input,Button,InputNumber ,message,Select} from 'antd';
import {linksList, saveLinks,deleteLinks} from '../../assets/js/api';
import {loadingChangeFn} from '../../store/action';
import './friendshipLink.css';
const FormItem = Form.Item;
const confirm = Modal.confirm;
const Option = Select.Option;

let FriendshipLink = class FriendshipLink extends Component {
    constructor(props, context) {
        super(props, context);
        this.state={
            modalVisible: false,
            modalTitle:'编辑友情链接',
            id:'',
            linkType:'COOPERATIVE_INSTITUTION',
            data:[],
            columns:[{
                title: '链接名称',
                dataIndex: 'linkName',
                key: '0'
            }, {
                title: '链接路径',
                dataIndex: 'url',
                key: '1'
            }, {
                title: '链接类型',
                key: '2',
                render: (record) => <div>{record.linkType === 'LINKS'?<span>友情链接</span>:<span>合作机构</span>}</div>
            }, {
                title: '排序',
                dataIndex: 'sort',
                key: '3'
            }, {
                title: '操作',
                key: '4',
                render: (record) => <div><a onClick={this.editMenu.bind(this,record)}>编辑</a> <a onClick={this.deleteMenu.bind(this,record)}>删除</a></div>
            }],
            loading:false,
            total:0,
            current:1,
            defaultCurrent:1,
            pageSize:10
        }
    }
    //组件初始化
    componentDidMount(){
        this.getLinksList(1);
    }
    //获取友情链接列表
    getLinksList(current){
        let _this = this;
        _this.setState({
            loading:true
        });
        let data = {
            linkType:'ALL',
            current:current,
            size:this.state.pageSize
        };
        linksList(data).then(res => {
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
    //新增友情链接
    addMenu(){
        this.props.form.resetFields();
        this.setState({
            modalVisible:true,
            id:'',
            linkType:'COOPERATIVE_INSTITUTION',
            modalTitle:'增加链接'
        });
    }
    //修改友情链接
    editMenu(record){
        let _this = this;
        _this.setState({
            modalVisible:true,
            id:record.id,
            linkType:record.linkType,
            modalTitle:'修改链接'
        });
        _this.props.form.setFieldsValue({
            linkName: record.linkName,
            sort: record.sort,
            url: record.url
        });
    }
    //删除单个友情链接
    deleteMenu(record){
        let _this = this;
        confirm({
            title: '您确认要删除'+record.linkName+'吗?',
            cancelText:'取消',
            okText:'确认',
            onOk() {
                deleteLinks({data:{id:record.id}}).then(res => {
                    if(res.code === 0){
                        message.success('删除成功！');
                        _this.getLinksList(1);
                    }
                });
            }
        });
    }
    //提交友情链接
    confirmFn(){
        let _this = this;
        this.props.form.validateFields((errors, values) => {
            if (!!errors) {
                return;
            }
            let data = {
                id:_this.state.id,
                linkType:_this.state.linkType,
                sort:values.sort,
                linkName:values.linkName,
                url:values.url,
                icon:''
            };
            _this.props.dispatch(loadingChangeFn(true));
            saveLinks(data).then(res => {
                _this.props.dispatch(loadingChangeFn(false));
                if(res.code === 0){
                    message.success('操作成功！');
                    _this.setState({
                        modalVisible:false
                    });
                    _this.getLinksList(1);
                }
            });
        });
    }
    selectChange(value){
        this.setState({
            linkType:value
        });
    }
    checkNetWorkFn(rule, value, callback){
        let mobileRegular=/^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/)/;
        if(!mobileRegular.test(value)&& value){
            callback([new Error('网址格式错误！')]);
        }else {
            callback();
        }
    }
    render(){
        let _this = this;
        const { getFieldProps } = this.props.form;
        const url = getFieldProps('url',{
            rules: [
                {required: true, min:1, message: '至少输入1个字符！'},
                {max:100, message: '最多输入100个字符！'},
                {validator: this.checkNetWorkFn}
            ]
        });
        return (
            <div className="friendshipLinkBox">
                <div className="contentBox">
                    <div className="titleBox"><Button
                        onClick={this.addMenu.bind(this)}
                        type="primary"
                                              >新增链接</Button></div>
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
                                   _this.getLinksList(num);
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
                    <Form>
                        <FormItem label="链接名称">
                            <Input
                                placeholder="请输入链接名称"
                                {...getFieldProps('linkName',{
                                    rules: [
                                        {required: true, min:1, message: '至少输入1个字符！'},
                                        {required: true, max:20, message: '最多输入20个字符！'}
                                    ]
                                })}
                            />
                        </FormItem>
                        <FormItem label="链接地址,如(http://furise.com/)">
                            <Input
                                placeholder="请输入链接地址,如http://furise.com/"
                                {...url}
                            />
                        </FormItem>
                        <FormItem label="链接类型">
                            <Select defaultValue={this.state.linkType}
                                onChange={this.selectChange.bind(this)}
                                style={{ width: 200 }}
                                value={this.state.linkType}
                            >
                                <Option value="COOPERATIVE_INSTITUTION">合作机构</Option>
                                <Option value="LINKS">友情链接</Option>
                            </Select>
                        </FormItem>
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
                    </Form>
                </Modal>
            </div>
        )
    }
};
FriendshipLink = Form.create()(FriendshipLink);
export default connect()(FriendshipLink);