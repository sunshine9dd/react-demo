import React, { Component } from 'react';
import {connect} from 'react-redux';
import { Link} from 'react-router-dom';
import { Table,Modal, Form, Input,Button,InputNumber,message,Select} from 'antd';
import './menu.css';
import {navigateList,memberTypeList,saveNavigate,getNavigateInfo,deleteNavigate} from '../../assets/js/api';
import {loadingChangeFn} from '../../store/action';
const FormItem = Form.Item;
const confirm = Modal.confirm;
const Option = Select.Option;

let Menu = class Menu extends Component {
    constructor(props, context) {
        super(props, context);
        this.state={
            modalVisible: false,
            modalTitle:'编辑导航栏',
            id:'',
            typeList:[],
            memberType:'NONE',
            data:[],
            columns:[{
                title: '导航栏名称',
                key: '0',
                render: (record) =>  <span className="linkNav" onClick={this.goMenuChildFn.bind(this,record)}>{record.navigateName}</span>
            }, {
                title: '导航栏路径',
                dataIndex: 'url',
                key: '1'
            }, {
                title: '子导航数',
                dataIndex: 'child',
                key: '2'
            },{
                title: '排序',
                dataIndex: 'sort',
                key: '3'
            }, {
                title: '操作',
                key: '4',
                render: (record) => <div><a onClick={this.editMenu.bind(this,record)}>编辑</a> {record.url == '/'?'':<a onClick={this.deleteMenuFn.bind(this,record)}>删除</a>}</div>
            }],
            paginationShow:false,
            loading:false
        }
    }
    //组件初始化
    componentDidMount(){
        let _this = this;
        memberTypeList({}).then(res => {
            if(res.code === 0){
                _this.setState({
                    typeList:res.data
                }, ()=> {
                    this.getMenuList();
                });
            }
        });
    }
    //获取导航栏列表
    getMenuList(){
        let _this = this;
        _this.setState({
            loading:true
        });
        navigateList({}).then(res => {
            if(res.code === 0){
                for (let i in res.data){
                    res.data[i].key = i;
                    res.data[i].child = res.data[i].subNavigates.length
                }
                _this.setState({
                    loading:false,
                    data:res.data
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
    //导航栏子页面
    goMenuChildFn(record){
        sessionStorage.setItem("frzMenuId",record.id);
        this.props.history.push('/MenuChild');
    }
    //新增导航栏
    addMenu(){
        this.props.form.resetFields();
        this.setState({
            modalVisible:true,
            id:'',
            memberType:'NONE',
            modalTitle:'增加导航栏'
        });
    }
    //修改导航栏
    editMenu(record){
        let _this = this;
        getNavigateInfo({id:record.id}).then(res => {
            if(res.code === 0){
                _this.setState({
                    modalVisible:true,
                    id:record.id,
                    memberType:res.data.memberType?res.data.memberType:'NONE',
                    modalTitle:'修改导航栏'
                });
                _this.props.form.setFieldsValue({
                    navigateName: res.data.navigateName,
                    sort: res.data.sort,
                    url: res.data.url
                });
            }
        });
    }
    //删除单个导航栏
    deleteMenuFn(record){
        let _this = this;
        confirm({
            title: '您确认要删除'+record.navigateName+'吗?',
            cancelText:'取消',
            okText:'确认',
            onOk() {
                deleteNavigate({data:{id:record.id}}).then(res => {
                    if(res.code === 0){
                        message.success('删除成功！');
                        _this.getMenuList();
                    }
                });
            }
        });
    }
    //提交导航栏
    confirmFn(){
        let _this = this;
        this.props.form.validateFields((errors, values) => {
            if (!!errors) {
                return;
            }
            let data = {
                id:_this.state.id,
                sort:values.sort,
                navigateName:values.navigateName,
                memberType:_this.state.memberType,
                url:values.url,
                navigateType:'URL'
            };
            _this.props.dispatch(loadingChangeFn(true));
            saveNavigate(data).then(res => {
                _this.props.dispatch(loadingChangeFn(false));
                if(res.code === 0){
                    message.success('操作成功！');
                    _this.setState({
                        modalVisible:false
                    });
                    _this.getMenuList();
                }
            });
        });
    }
    memberTypeChange(value){
        this.setState({
            memberType:value
        });
    }
    render(){
        const { getFieldProps } = this.props.form;
        return (
            <div className="menuBox">
                <div className="contentBox">
                    <div className="titleBox"><Button  onClick={this.addMenu.bind(this)}
                        type="primary"
                                              >新增导航栏</Button></div>
                    <Table columns={this.state.columns}
                        dataSource={this.state.data}
                        loading={this.state.loading}
                        pagination={this.state.paginationShow}
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
                        <FormItem label="导航栏地址">
                            <Input
                                placeholder="请输入导航栏地址"
                                {...getFieldProps('url',{
                                    rules: [
                                        {required: true, min:1, message: '至少输入1个字符！'},
                                        {required: true, max:100, message: '最多输入100个字符！'}
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
                        <FormItem label="排序">
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
                    </Form>
                </Modal>
            </div>
        )
    }
};
Menu = Form.create()(Menu);
export default connect()(Menu);