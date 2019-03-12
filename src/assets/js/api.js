/* eslint-disable no-unused-vars */
import axios from 'axios';
import qs from 'qs';
import { message } from 'antd';
import React from 'react';
import {hashHistory} from 'react-router';

/**
 * @axios基本配置
 */
axios.defaults.timeout = 15000;
if (window.location.hostname === 'furise.com' || window.location.hostname === '47.98.146.53') {
    // 生产环境
    axios.defaults.baseURL = 'http://47.98.146.53:8110/';
} else {
    // 本地环境
    // axios.defaults.baseURL = 'http://192.168.0.154:8888/';
    //测试环境
    axios.defaults.baseURL = 'http://116.62.63.151:8110/';
}
console.log(window.location.hostname);


/**
 * @axios设置全局headers信息
 */
let getHeaders = () => {
    let fuRuiAccessToken = sessionStorage.getItem('fuRuiAccessToken');
    let fuRuiAccount = sessionStorage.getItem('fuRuiAccount');
    if (fuRuiAccessToken && fuRuiAccount) {
        fuRuiAccount = JSON.parse(fuRuiAccount);
        axios.defaults.headers.common['access_token'] = fuRuiAccessToken;
        axios.defaults.headers.common['access_token_user_id'] = fuRuiAccount.id;
    }
};


/**
 * @请求拦截
 */
axios.interceptors.request.use(function (config) {
    let fuRuiAccessToken = sessionStorage.getItem('fuRuiAccessToken');
    let fuRuiAccount = sessionStorage.getItem('fuRuiAccount');
    if (fuRuiAccessToken && fuRuiAccount) {
        fuRuiAccount = JSON.parse(fuRuiAccount);
        config.headers.access_token = fuRuiAccessToken;
        config.headers.access_token_user_id = fuRuiAccount.id;
    }
    return config
}, function (error) {
    return Promise.reject(error)
});

/**
 * @数据返回拦截
 */
axios.interceptors.response.use(function (res) {
    getHeaders();
    if (res.data.code === 1012) { //会话过期处理||token为空
        message.error(res.data.msg);
        hashHistory.push('/');
        return res;
    } else if(res.data.code  === 0){
        sessionStorage.setItem('fuRuiAccessToken',res.headers.access_token);
        return res;
    }else {
        message.error(res.data.msg);
        return res;
    }

}, function (error) {
    return Promise.reject({code: 1012, msg: '请求超时,请稍后重试', error: error});
});

/********************************** form-data ********************************************/

/**
 * @post请求
 * @param url
 * @param params
 * @returns {Promise.<TResult>}
 */
let post = (url, params) => {
    return axios.post(url, qs.stringify(params)).then(res => res.data).catch(error => error);
};

/**
 * @get请求
 * @param url
 * @param params
 * @returns {Promise.<TResult>}
 */
let get = (url, params) => {
    return axios.get(url, {params: params}).then(res => res.data).catch(error => error);
};
/**
 * @delete请求
 * @param url
 * @param params
 * @returns {Promise.<TResult>}
 */
let appDelete = (url, params) => {
    return axios.delete(url,params,{
        headers:{
            'Content-Type':'application/json'
        }
    }).then(res => res.data).catch(error => error);
};

/****************** application *******************/
let appPost = (url, params) => {
    return axios.post(url, JSON.stringify(params),{
        headers:{
            'Content-Type':'application/json'
        }
    }).then(res => res.data).catch(error => error);
};
/****************** multipart/form-data上传文件 *******************/
let uploadFilePost = (url, params) => {
    return axios.post(url, params,{
        headers:{
            'Content-Type':'multipart/form-data'
        }
    }).then(res => res.data).catch(error => error);
};




/**************************** @api接口  *******************************************/
/**
 * @获取七牛TOKEN
 */
export const getQiniuToken = params => {
    return get('api/v1/upload/qinNiu/info', params);
};
/**
 * @系统登录
 */
export const userLogin = params => {
    return appPost('api/v1/user/login', params);
};
/**
 * @系统修改账户
 */
export const userSave = params => {
    return appPost('api/v1/user/save', params);
};
/**
 * @获取系统菜单信息
 */
export const menuList = params => {
    return get('api/v1/menu/query', params);
};
/**
 * @修改或新增系统菜单
 */
export const saveMenu = params => {
    return appPost('api/v1/menu/save', params);
};
/**
 * @获取单个菜单信息
 */
export const getMenuInfo = params => {
    return get('api/v1/menu/info', params);
};
/**
 * @删除单个菜单信息
 */
export const deleteMenu = params => {
    return appDelete('api/v1/menu/delete', params);
};
/**
 * @分页获取友情链接信息
 */
export const linksList = params => {
    return get('api/v1/links/query', params);
};
/**
 * @修改或新增友情链接
 */
export const saveLinks= params => {
    return appPost('api/v1/links/save', params);
};
/**
 * @删除友情链接
 */
export const deleteLinks= params => {
    return appDelete('api/v1/links/delete', params);
};
/**
 * @分页获取新闻资讯信息
 */
export const newsList = params => {
    return get('api/v1/news/query', params);
};
/**
 * @获取单个新闻资讯信息
 */
export const getNewsInfo = params => {
    return get('api/v1/news/info', params);
};
/**
 * @修改或新增新闻资讯
 */
export const saveNews= params => {
    return appPost('api/v1/news/save', params);
};
/**
 * @删除新闻资讯
 */
export const deletenews= params => {
    return appDelete('api/v1/news/delete', params);
};
/**
 * @获取官网导航栏信息
 */
export const navigateList = params => {
    return get('api/v1/navigate/query', params);
};
/**
 * @修改或新增官网导航栏
 */
export const saveNavigate = params => {
    return appPost('api/v1/navigate/save', params);
};
/**
 * @获取单个官网导航栏信息
 */
export const getNavigateInfo = params => {
    return get('api/v1/navigate/info', params);
};
/**
 * @删除单个官网导航栏信息
 */
export const deleteNavigate = params => {
    return appDelete('api/v1/navigate/delete', params);
};
/**
 * @根据类型获取成员列表信息
 */
export const memberList = params => {
    return get('api/v1/member/query', params);
};
/**
 * @根据获取成员类型信息
 */
export const memberTypeList = params => {
    return get('api/v1/member/types', params);
};
/**
 * @修改或新增成员
 */
export const saveMember= params => {
    return appPost('api/v1/member/save', params);
};
/**
 * @获取单个成员信息
 */
export const getMemberInfo = params => {
    return get('api/v1/member/info', params);
};
/**
 * @删除单个成员
 */
export const deleteMember= params => {
    return appDelete('api/v1/member/delete', params);
};
/**
 * @获取公司列表信息
 */
export const companyList = params => {
  return get('api/v1/company/query', params);
};
/**
 * @修改公司信息
 */
export const saveCompany= params => {
    return appPost('api/v1/company/save', params);
};
/**
 * @根据类型获取banner列表信息
 */
export const bannerList = params => {
    return get('api/v1/banner/query', params);
};
/**
 * @修改或新增banner
 */
export const savebanner= params => {
    return appPost('api/v1/banner/save', params);
};
/**
 * @获取单个banner信息
 */
export const getBannerInfo = params => {
    return get('api/v1/banner/info', params);
};
/**
 * @删除单个banner
 */
export const deleteBanner= params => {
    return appDelete('api/v1/banner/delete', params);
};