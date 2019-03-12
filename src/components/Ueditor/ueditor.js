import React, {Component} from 'react';
import {connect} from "react-redux";
import * as qiniu from "qiniu-js";
import {qiniuChangeFn} from "../../store/action";
import {message} from "antd";
class Ueditor extends Component {
    constructor(props){
        super(props);
        this.state={
            id:this.props.id?this.props.id:null,
            content:this.props.content?this.props.content:'',
            ueditor :null,
        }
    }
    componentDidMount(){
        let _this = this;
        let UE = window.UE;
        let {id,content} = this.state;
        if(id){
            try {
                /*加载之前先执行删除操作，否则如果存在页面切换，
                再切回带编辑器页面重新加载时不刷新无法渲染出编辑器*/
                UE.delEditor(id);
            }catch (e) {}
            let  ueditor = UE.getEditor(id, {
                autoHeightEnabled: true,
                autoFloatEnabled: true,
                imageScaleEnabled: false, //禁止图片拉伸缩放
                toolbars:[[
                    'fullscreen', 'source', '|', 'undo', 'redo', '|',
                    'bold', 'italic', 'underline', 'fontborder', 'strikethrough', 'superscript', 'subscript', 'removeformat', 'formatmatch', 'autotypeset', 'blockquote', 'pasteplain', '|', 'forecolor', 'backcolor', 'insertorderedlist', 'insertunorderedlist', 'selectall', 'cleardoc', '|',
                    'rowspacingtop', 'rowspacingbottom', 'lineheight', '|',
                    'customstyle', 'paragraph', 'fontfamily', 'fontsize', '|',
                    'directionalityltr', 'directionalityrtl', 'indent', '|',
                    'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|', 'touppercase', 'tolowercase', '|',
                    'link', 'unlink', 'anchor', '|', 'imagenone', 'imageleft', 'imageright', 'imagecenter', '|',
                    'diyimg', 'emotion', 'map','insertcode', '|',
                    'horizontal', 'date', 'time', 'spechars', 'snapscreen', 'wordimage', '|',
                    'inserttable', 'deletetable', 'insertparagraphbeforetable', 'insertrow', 'deleterow', 'insertcol', 'deletecol', 'mergecells', 'mergeright', 'mergedown', 'splittocells', 'splittorows', 'splittocols', 'charts', '|',
                    'print', 'preview', 'searchreplace', 'drafts', 'help'
                ]],
            });
            ueditor.ready(function() {
                // ueditor.setHeight(500);
                ueditor.setContent(content);
                // console.log(ueditor.getPlainTxt())
                //上传图片设置
                ueditor.commands['diyimg'] = {
                    execCommand : function(){
                        let that = this;
                        const upload = async function(event){
                            let e=window.event||event;
                            // 获取当前选中的文件
                            let file = e.target.files[0];
                            let type = file.name.replace(/.+\./, "");//截取文件名的后缀
                            if(type.toLowerCase() == "gif" || type.toLowerCase() == "jpg" || type.toLowerCase() == "jpeg" || type.toLowerCase() == "png"){

                            }else {
                                message.error("文件类型错误,请上传图片类型格式文件！");
                                return false;
                            }
                            let randomNum = Date.parse(new Date()) + Math.floor(Math.random() * 1000);//随机数+时间戳
                            const observable = await qiniu.upload(file,randomNum, _this.state.qiniuToken);
                            observable.subscribe({
                                error:err=> {
                                    _this.props.dispatch(qiniuChangeFn(true));
                                    message.error("图片上传失败，请刷新后重试");
                                },
                                complete: res => {
                                    that.execCommand('inserthtml', '<img src="' + _this.state.qiniuHost+res.key + '" style="max-width: 100%"/>');
                                },
                                next:res =>{
                                    console.log('上传中,已上传'+parseInt(res.total.percent)+'%');
                                }
                            });
                        };
                        const fileInput = document.getElementById('diyimg_'+id);//获取dom上隐藏的一个input标签
                        fileInput.onchange = upload;
                        fileInput.click();//触发input标签实现文件上传
                        return true;
                    }
                };
                //富文本输入完成后
                ueditor.addListener( 'afterSelectionChange', function( ) {
                    _this.props.setContentFn(ueditor.getContent());
                })
            });
            this.setState({ueditor });
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
        }
    }
    render(){
        let {id} = this.state;
        return (
            <div>
                <textarea id={id} style={{width:'100%',lineHeight:'normal',position:'relative',zIndex:'2'}}/>
                <input type="file" id={'diyimg_'+id} style={{display:'none'}} accept='image/gif,image/jpeg,image/png,image/jpg'/>
            </div>
        );
    }
};
export default connect()(Ueditor);