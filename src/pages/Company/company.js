import React, { Component } from 'react';
import {connect} from 'react-redux';
import './company.css';
import { Table, Divider, Modal, Form, Input } from 'antd';
import { companyList } from '../../assets/js/api';

class Company extends Component {
    constructor(props, context) {
        super(props, context);
        this.state={
          pageData: [],
          loading:false,
          paginationData:{
            pageNo: 1,
            pageSize: 10,
            pageTotal: 0
          },
          visible: false,
          confirmLoading: false,
          modelTitle:'查看'
        };
        this.changePage = this.changePage.bind(this);
    }
    componentDidMount(){
      let _this = this;
      _this.setState({
        loading:true
      });
      //初始化页面数据加载
      this.getCompanyList(_this.state.paginationData.pageNo,_this.state.paginationData.pageSize);
    }
    // 显示模态框
    showModal = () => {
      this.setState({
        visible: true
      });
    }
    // 模态框确认
    handleOk = () => {
      this.setState({
        ModalText: 'The modal will be closed after two seconds',
        confirmLoading: true
      });
      setTimeout(() => {
        this.setState({
          visible: false,
          confirmLoading: false
        });
      }, 2000);
    }
    // 模态框取消
    handleCancel = () => {
      console.log('Clicked cancel button');
      this.setState({
        visible: false
      });
    }
    // 翻页
    changePage(selectedRowKeys){
      const _this = this;
      _this.getCompanyList(selectedRowKeys,_this.state.paginationData.pageSize);
    }
    // 获取列表信息
    getCompanyList(pageNo,pageSize){
      const _this = this;
      let queryData = {current:pageNo,size:pageSize};
      companyList(queryData).then(res => {
        _this.setState({
          loading:false
        });
        if(res.code === 0){
          let newPaginationData = {
            pageNo: res.data.pageNo,
            pageSize: _this.state.paginationData.pageSize,
            pageTotal: res.data.totalCount
          }
          _this.setState({
            pageData: res.data.list,
            paginationData: newPaginationData
          })
        }
      });
    }
    // 查看
    check(id){
      console.log('check',id);
      // this.props.history.push({ pathname: '/companyInfo', state: { id:id } });
      this.showModal();
    }
    // 编辑
    del(id){
      console.log('del',id);
    }
    // 删除
    edit(id){
      console.log('edit',id);
    }
    render(){
      const { visible, confirmLoading } = this.state;
      const formItemLayout = {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 5 }
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 12 }
        }
      };
      const columns = [{
        title: '公司名称',
        dataIndex: 'companyName',
        key: 'companyName'
      },{
        title: '地址',
        dataIndex: 'address',
        key: 'address'
      }, {
        title: '公司简介',
        dataIndex: 'companyProfile',
        key: 'companyProfile',
        render: (text) => <div className="companyText"
            title={text}
                          >{text}</div>
      }, {
        title: '公司创建时间',
        dataIndex: 'createTime',
        key: 'createTime'
      }, {
        title: '传真',
        key: 'fax',
        dataIndex: 'fax'
      }, {
        title: '邮编',
        key: 'zipCode',
        dataIndex: 'zipCode'
      }, {
        title: '联系电话',
        key: 'phoneNumber',
        dataIndex: 'phoneNumber'
      }, {
        title: '备注',
        key: 'remarks',
        dataIndex: 'remarks'
      }, {
        title: '办公地址',
        key: 'officeAddress',
        dataIndex: 'officeAddress',
        render: (text) => <div className="officeText">{text}</div>
      }, {
        title: 'logo',
        key: 'logoUrl',
        render: (text, record) => (
          <img className="companyLogo"
              src={record.logoUrl}
          />
        )
      },{
        title: '操作',
        key: 'action',
        render: (record) => (
          //text, record
          <span>
            <span className="actionClass"
                onClick={this.check.bind(this,record.id)}
            >查看</span>
            <Divider type="vertical" />
            <span  className="actionClass"
                onClick={this.edit.bind(this,record.id)}
            >编辑</span>
            <Divider type="vertical" />
            <span  className="actionClass"
                onClick={this.del.bind(this,record.id)}
            >删除</span>
          </span>
        )
      }];
      return (
        <div className="company">
          <div className="contentBox">
            <Table columns={columns}
                dataSource={this.state.pageData}
                loading={this.state.loading}
                pagination={{
                  current: this.state.paginationData.pageNo,
                  total: this.state.paginationData.pageTotal,
                  onChange: this.changePage
                }}
            />
          </div>
          <Modal
              cancelText="取消"
              confirmLoading={confirmLoading}
              destroyOnClose={false}
              okText="确认"
              onCancel={this.handleCancel.bind(this)}
              onOk={this.handleOk.bind(this)}
              title={this.state.modelTitle}
              visible={visible}
          >
            <Form>
              <Form.Item
                  {...formItemLayout}
                  help="Should be combination of numbers & alphabets"
                  label="Fail"
                  validateStatus="error"
              >
                <Input id="error"
                    placeholder="unavailable choice"
                />
              </Form.Item>
            </Form>
          </Modal>
        </div>
      )
    }
}
export default connect()(Company);