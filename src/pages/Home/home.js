import React, { Component } from 'react';
import {connect} from 'react-redux';
import { Table,Modal, Form, Input,Button,InputNumber,message} from 'antd';
import './home.css';
import {menuList, saveMenu,getMenuInfo,deleteMenu} from '../../assets/js/api';
import {loadingChangeFn} from '../../store/action';
const FormItem = Form.Item;
const confirm = Modal.confirm;

let Home = class Home extends Component {
    constructor(props, context) {
        super(props, context);
        this.state={
            modalVisible: false,
            modalTitle:'编辑菜单',
            id:'',
            data:[],
            columns:[{
                title: '菜单名称',
                dataIndex: 'menuName',
                key: '0'
            }, {
                title: '菜单路径',
                dataIndex: 'url',
                key: '1'
            }, {
                title: '排序',
                dataIndex: 'sort',
                key: '2'
            }, {
                title: '操作',
                key: '3',
                // render: (record) => <div><a onClick={this.editMenu.bind(this,record.id)}>编辑</a> {record.url == '/Home'?'':<a onClick={this.deleteMenu.bind(this,record)}>删除</a>}</div>
            }],
            paginationShow:false,
            loading:false
        }
    }
    //组件初始化
    componentDidMount(){
        this.getMenuList();
    }
    //获取菜单列表
    getMenuList(){
        let _this = this;
        _this.setState({
            loading:true
        });
        menuList({}).then(res => {
            if(res.code === 0){
                for (let i in res.data){
                    res.data[i].key = i;
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
    //新增菜单
    addMenu(){
        this.props.form.resetFields();
        this.setState({
            modalVisible:true,
            id:'',
            modalTitle:'增加菜单'
        });
    }
    //修改菜单
    editMenu(id){
        let _this = this;
        getMenuInfo({id:id}).then(res => {
            if(res.code === 0){
                _this.setState({
                    modalVisible:true,
                    id:id,
                    modalTitle:'修改菜单'
                });
                _this.props.form.setFieldsValue({
                    menuName: res.data.menuName,
                    sort: res.data.sort,
                    url: res.data.url
                });
            }
        });
    }
    //删除单个菜单
    deleteMenu(record){
        // let _this = this;
        confirm({
            title: '您确认要删除'+record.menuName+'吗?',
            cancelText:'取消',
            okText:'确认',
            onOk() {
                deleteMenu({data:{id:record.id}}).then(res => {
                    if(res.code === 0){
                        message.success('删除成功！');
                        setTimeout(function () {
                            // _this.getMenuList();
                            window.location.reload();
                        },1000)
                    }
                });
            }
        });
    }
    //提交菜单
    confirmFn(){
        let _this = this;
        this.props.form.validateFields((errors, values) => {
            if (!!errors) {
                return;
            }
            let data = {
                id:_this.state.id,
                sort:values.sort,
                menuName:values.menuName,
                url:values.url,
                icon:''
            };
            _this.props.dispatch(loadingChangeFn(true));
            saveMenu(data).then(res => {
                _this.props.dispatch(loadingChangeFn(false));
                if(res.code === 0){
                    message.success('操作成功！');
                    _this.setState({
                        modalVisible:false
                    });
                    setTimeout(function () {
                        // _this.getMenuList();
                        window.location.reload();
                    },1000)
                }
            });
        });
    }
    render(){
        const { getFieldProps } = this.props.form;
        return (
            <div className="homeBox">
                <div className="contentBox">
                    <div className="titleBox">
                        {/*<Button  onClick={this.addMenu.bind(this)}*/}
                        {/*type="primary"*/}
                                              {/*>新增菜单</Button>*/}
                    </div>
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
                        <FormItem label="菜单名称">
                            <Input
                                placeholder="请输入菜单名称"
                                {...getFieldProps('menuName',{
                                    rules: [
                                        {required: true, min:1, message: '至少输入1个字符！'},
                                        {required: true, max:20, message: '最多输入20个字符！'}
                                    ]
                                })}
                            />
                        </FormItem>
                        <FormItem label="菜单地址">
                            <Input
                                placeholder="请输入菜单地址"
                                {...getFieldProps('url',{
                                    rules: [
                                        {required: true, min:1, message: '至少输入1个字符！'},
                                        {required: true, max:100, message: '最多输入100个字符！'}
                                    ]
                                })}
                            />
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
Home = Form.create()(Home);
export default connect()(Home);