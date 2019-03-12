// 弹窗状态
export const LOADING_STATUS = 'LOADING_STATUS';
//七牛状态
export const QINIU_STATUS = 'QINIU_STATUS';


// 关闭、打开loading层
export function loadingChangeFn(loadingStatus){
    return {type: LOADING_STATUS,data:{loadingStatus:loadingStatus}};
}
// 是否重新获取七牛token
export function qiniuChangeFn(qiniuStatus){
    return {type: QINIU_STATUS,data:{qiniuStatus:qiniuStatus}};
}


