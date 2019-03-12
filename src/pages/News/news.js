import React, { Component } from 'react';
import {connect} from 'react-redux';
import { Table,Modal, Form,Button,message} from 'antd';
import {newsList,deletenews} from '../../assets/js/api';
import './news.css';
const confirm = Modal.confirm;

let News = class News extends Component {
    constructor(props, context) {
        super(props, context);
        this.state={
            modalVisible: false,
            modalTitle:'编辑新闻资讯',
            id:'',
            data:[],
            columns:[{
                title: '新闻资讯标题',
                dataIndex: 'title',
                key: '0'
            }, {
                title: '新闻资讯介绍',
                dataIndex: 'subtitle',
                key: '1'
            }, {
                title: '新闻资讯图片',
                key: '2',
                render: (record) => (<img className="newsCover"
                    src={record.homeImgUrl}
                                     />)
            }, {
                title: '创建时间',
                dataIndex: 'createTime',
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
            pageSize:10,
            homeImg: '',
            homeImgUrl:'',
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
        this.getNewsList(1);
    }
    //获取新闻资讯列表
    getNewsList(current){
        let _this = this;
        _this.setState({
            loading:true
        });
        let data = {
            current:current,
            size:this.state.pageSize
        };
        newsList(data).then(res => {
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
    //新增新闻资讯
    addMenu(){
        sessionStorage.setItem("frzNewsId",'');
        this.props.history.push('/NewsEdit');
    }
    //编辑新闻资讯
    editMenu(record){
        sessionStorage.setItem("frzNewsId",record.id);
        this.props.history.push('/NewsEdit');
    }
    //删除单个新闻资讯
    deleteMenu(record){
        let _this = this;
        confirm({
            title: '您确认要删除'+record.title+'吗?',
            cancelText:'取消',
            okText:'确认',
            onOk() {
                deletenews({data:{id:record.id}}).then(res => {
                    if(res.code === 0){
                        message.success('删除成功！');
                        _this.getNewsList(1);
                    }
                });
            }
        });
    }
    render(){
        let _this = this;
        return (
            <div className="newsBox">
                <div className="contentBox">
                    <div className="titleBox"><Button
                        onClick={this.addMenu.bind(this)}
                        type="primary"
                                              >新增新闻资讯</Button></div>
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
                                   _this.getNewsList(num);
                               }
                           }}
                    />
                </div>
            </div>
        )
    }
};
News = Form.create()(News);
export default connect()(News);