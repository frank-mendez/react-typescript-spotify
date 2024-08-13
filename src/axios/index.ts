import { createBaseAxiosInstance } from './createBaseAxiosInstance';
import Qs from 'query-string';

export const axios = createBaseAxiosInstance({
    // Add params serializer to convert objects to query string
    // This is useful when you want to pass an object as a query parameter
    paramsSerializer: function (params) {
        return Qs.stringify(params);
    },
});