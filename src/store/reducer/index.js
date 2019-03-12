import {
    LOADING_STATUS,
    QINIU_STATUS
} from '../action/index';
const loadingStatus = { loadingStatus:false };
export function loadingChangeData(loadingStatusData = loadingStatus, action) {
    switch (action.type) {
        case LOADING_STATUS:
            return Object.assign({},loadingStatusData,action.data);
        default:
            return loadingStatusData;
    }
}
const qiniuStatus = { qiniuStatus:false };
export function qiniuChangeData(qiniuStatusData = qiniuStatus, action) {
    switch (action.type) {
        case QINIU_STATUS:
            return Object.assign({},qiniuStatusData,action.data);
        default:
            return qiniuStatusData;
    }
}

