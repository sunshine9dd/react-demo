import React, { Component } from 'react';
import {connect} from 'react-redux';
import { Table,Modal, Form,Button,message} from 'antd';
import './menu.css';
import {getNavigateInfo,deleteNavigate} from '../../assets/js/api';
const confirm = Modal.confirm;

let Menu = class Menu extends Component {
    constructor(props, context) {
        super(props, context);
        this.state={
            modalVisible: false,
            modalTitle:'编辑导航栏',
            id:'',
            parentId:'',
            parentName:'',
            data:[],
            columns:[{
                title: '导航栏名称',
                dataIndex: 'navigateName',
                key: '0'
            }, {
                title: '导航栏路径',
                dataIndex: 'url',
                key: '1'
            }, {
                title: '导航栏类型',
                key: '2',
                render: (record) => <div>{record.navigateType === 'URL'?<span>超链接</span>:<span>富文本</span>}</div>
            }, {
                title: '排序',
                dataIndex: 'sort',
                key: '3'
            }, {
                title: '操作',
                key: '4',
                render: (record) => <div><a onClick={this.editMenu.bind(this,record.id)}>编辑</a> <a onClick={this.deleteMenuFn.bind(this,record)}>删除</a></div>
            }],
            paginationShow:false,
            loading:false
        }
    }
    //组件初始化
    componentDidMount(){
        let menuId = sessionStorage.getItem("frzMenuId");
        this.getMenuList(menuId);
    }
    //获取导航栏列表
    getMenuList(id){
        let _this = this;
        _this.setState({
            loading:true
        });
        getNavigateInfo({id:id}).then(res => {
            if(res.code === 0){
                for (let i in res.data.subNavigates){
                    res.data.subNavigates[i].key = i;
                }
                _this.setState({
                    loading:false,
                    parentId:res.data.id,
                    parentName:res.data.navigateName,
                    data:res.data.subNavigates
                });
            }
        });
    }
    //新增导航栏
    addMenu(){
        sessionStorage.setItem("frzMenuEditId",'');
        this.props.history.push('/MenuEdit');
    }
    //修改导航栏
    editMenu(id){
        sessionStorage.setItem("frzMenuEditId",id);
        this.props.history.push('/MenuEdit');
    }
    //删除单个导航栏
    deleteMenuFn(record){
        let _this = this;
        let parentId = _this.state.parentId;
        confirm({
            title: '您确认要删除'+record.navigateName+'吗?',
            cancelText:'取消',
            okText:'确认',
            onOk() {
                deleteNavigate({data:{id:record.id}}).then(res => {
                    if(res.code === 0){
                        message.success('删除成功！');
                        _this.getMenuList(parentId);
                    }
                });
            }
        });
    }
    goBackFn(){
        window.history.back();
    }
    render(){
        return (
            <div className="menuBox">
                <div className="contentBox">
                    <div className="titleBox">
                        <span className="leftTitle">导航栏管理</span><span className="nextTitle">{this.state.parentName}</span>
                        <Button  onClick={this.addMenu.bind(this)}
                            type="primary"
                        >新增导航栏</Button>
                        <Button
                            onClick={this.goBackFn.bind(this)}
                            type="primary"
                        >返回上一页</Button>
                    </div>
                    <Table columns={this.state.columns}
                        dataSource={this.state.data}
                        loading={this.state.loading}
                        pagination={this.state.paginationShow}
                    />
                </div>
            </div>
        )
    }
};
Menu = Form.create()(Menu);
export default connect()(Menu);