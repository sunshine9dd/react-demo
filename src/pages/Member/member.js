import React, { Component } from 'react';
import {connect} from 'react-redux';
import { Table,Modal, Form, Input,Button ,message,Select,Icon,Upload} from 'antd';
import {memberList,memberTypeList,saveMember,deleteMember} from '../../assets/js/api';
import {loadingChangeFn, qiniuChangeFn} from '../../store/action';
import './member.css';
const FormItem = Form.Item;
const confirm = Modal.confirm;
const Option = Select.Option;

let Member = class Member extends Component {
    constructor(props, context) {
        super(props, context);
        this.state={
            modalVisible: false,
            modalTitle:'编辑成员',
            id:'',
            memberImage: '',
            memberImageUrl:'',
            data:[],
            columns:[{
                title: '成员名称',
                dataIndex: 'memberName',
                key: '0'
            }, {
                title: '成员图片',
                key: '1',
                render: (record) => (<img className="memberCover"
                    src={record.memberImageUrl}
                                     />)
            },{
                title: '跳转路径',
                dataIndex: 'url',
                key: '2'
            }, {
                title: '成员类型',
                dataIndex:'memberTypeName',
                key: '3'
            }, {
                title: '成员内容类型',
                key: '4',
                render: (record) => <div>{record.contentType === 'URL'?<span>超链接</span>:<span>富文本</span>}</div>
            }, {
                title: '操作',
                key: '5',
                render: (record) => <div><a onClick={this.editMenu.bind(this,record)}>编辑</a> <a onClick={this.deleteMenu.bind(this,record)}>删除</a></div>
            }],
            loading:false,
            typeList:[],
            type:'',
            formMemberType:'',
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
                    type:res.data[0].type,
                    formMemberType:res.data[0].type
                }, ()=> {
                    this.getMemberList(1);
                });
            }
        });
    }
    //获取成员列表
    getMemberList(current){
        let _this = this;
        _this.setState({
            loading:true
        });
        let data = {
            type:this.state.type,
            current:current,
            size:this.state.pageSize
        };
        memberList(data).then(res => {
            if(res.code === 0){
                for (let i in res.data.list){
                    res.data.list[i].key = i;
                    res.data.list[i].memberTypeName = _this.memberTypeScreen(res.data.list[i].memberType);
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
    //成员类型转换
    memberTypeScreen(type){
        let typeName = '';
        this.state.typeList.map(function (item) {
            if(item.type === type){
                typeName = item.name;
            }
        });
        return typeName;
    }
    //关闭弹窗
    setModalVisible() {
        this.setState({
            modalVisible:false,
            id:''
        });
    }
    //新增成员
    addMenu(){
        // let _this = this;
        sessionStorage.setItem("frzMemberEditId",'');
        this.props.history.push('/MemberEdit');
        // this.props.form.resetFields();
        // this.setState({
        //     modalVisible:true,
        //     id:'',
        //     memberImage: '',
        //     memberImageUrl:'',
        //     formMemberType:_this.state.typeList[0].type,
        //     modalTitle:'增加成员'
        // });
    }
    //修改成员
    editMenu(record){
        sessionStorage.setItem("frzMemberEditId",record.id);
        this.props.history.push('/MemberEdit');
        // let _this = this;
        // _this.setState({
        //     modalVisible:true,
        //     id:record.id,
        //     formMemberType:record.memberType,
        //     memberImage: record.memberImage,
        //     memberImageUrl:record.memberImageUrl,
        //     modalTitle:'修改成员'
        // });
        // _this.props.form.setFieldsValue({
        //     memberName: record.memberName,
        //     url: record.url
        // });
    }
    //删除单个成员
    deleteMenu(record){
        let _this = this;
        confirm({
            title: '您确认要删除'+record.memberName+'吗?',
            cancelText:'取消',
            okText:'确认',
            onOk() {
                deleteMember({data:{id:record.id}}).then(res => {
                    if(res.code === 0){
                        message.success('删除成功！');
                        _this.getMemberList(1);
                    }
                });
            }
        });
    }
    //提交成员
    confirmFn(){
        let _this = this;
        this.props.form.validateFields((errors, values) => {
            if (!!errors) {
                return;
            }
            let data = {
                id:_this.state.id,
                memberName:values.memberName,
                url:values.url,
                memberImage:_this.state.memberImage,
                memberType:_this.state.formMemberType
            };
            _this.props.dispatch(loadingChangeFn(true));
            saveMember(data).then(res => {
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
        this.setState({type:value}, ()=> {
            this.getMemberList(1);
        });
    }
    formSelectChange(value){
        this.setState({
            formMemberType:value
        });
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
                            memberImage: info.fileList[info.fileList.length - 1].response.key,
                            memberImageUrl:_this.state.qiniuHost + info.fileList[info.fileList.length - 1].response.key
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
            <div className="memberBox">
                <div className="contentBox">
                    <div className="titleBox">
                        <Select defaultValue={this.state.type}
                            onChange={this.selectChange.bind(this)}
                            style={{ width: 200 }}
                            value={this.state.type}
                        >
                            {this.state.typeList.map(d => <Option key={d.type}
                                value={d.type}
                                                          >{d.name}</Option>)}
                        </Select>
                        <Button onClick={this.addMenu.bind(this)}
                            type="primary"
                        >新增成员</Button></div>
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
                    <Form className="memberForm">
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
                        <FormItem label="跳转路径">
                            <Input
                                placeholder="请输入成员跳转路径"
                                {...getFieldProps('url',{
                                    rules: [
                                        {required: true, min:1, message: '至少输入1个字符！'},
                                        {required: true, max:100, message: '最多输入100个字符！'}
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
                        <div className="newsTitle">成员图片:</div>
                        <Upload {...props}>
                            <div className="uploadBox">
                                {this.state.memberImageUrl?<img src={this.state.memberImageUrl}/>:''}
                                {this.state.memberImageUrl?'':<Icon type={'plus'} />}
                            </div>
                        </Upload>
                    </Form>
                </Modal>
            </div>
        )
    }
};
Member = Form.create()(Member);
export default connect()(Member);