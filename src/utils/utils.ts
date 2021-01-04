interface Field {
  description: string;
  field: string;
  group: string;
  optional: boolean;
  type: string;
  fieldsKeyList: string[];
}

export interface ApiResponse {
  name: string;
  type: string;
  url: string;
  title: string;
  group: string;
  groupTitle: string;
  version: string;
  parameter: {
    fields: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Parameter: Field[];
    };
  };
  success: {
    fields: {
      基本响应字段: Field[];
      // eslint-disable-next-line @typescript-eslint/naming-convention
      "Success 200": Field[];
    };
  };
}

export function parseResponseTree(data: any[]) {
  const formatResponseList: any = {};
  const apiTree: any = [];
  data.forEach((item) => {
    // 接口
    const data = {
      type: item.type,
      url: item.url,
      label: item.title,
      group: item.group,
      version: item.version,
      parameter: item.parameter?.fields,
      success: item.success?.fields,
      groupTitle: item.groupTitle,
      isDir: false,
      contextValue: "item",
      collapsibleState: 0,
    };
    if (formatResponseList[item.group]) {
      formatResponseList[item.group].push(data);
    } else {
      formatResponseList[item.group] = [data];
    }
  });
  Object.keys(formatResponseList).forEach((key) => {
    // 模块
    apiTree.push({
      isDir: true,
      contextValue: "module",
      collapsibleState: 1,
      label: formatResponseList[key][0].groupTitle,
      children: formatResponseList[key],
    });
  });
  return apiTree;
}

export function arrayToJson(fields: Field[]) {
  const obj: any = {};
  fields.map((item) => {
    item.fieldsKeyList = item.field.split(".");
    return item;
  });

  fields.forEach((item) => {
    // 第一个循环，是要添加的对象
    item.fieldsKeyList.forEach((_addKey, index) => {
      // 每一次循环后 获取到的对象
      let curObj: any = null;
      // 这个循环是获得对象里面最深一级的属性
      for (var i = 0; i <= index; i++) {
        const curKey = item.fieldsKeyList[i];
        // 是否最后一位
        const hasLast = index === item.fieldsKeyList.length - 1;
        if (i === 0) {
          if (!obj[curKey]) {
            if (hasLast) {
              obj[curKey] = lastValueType(item.type);
            } else {
              obj[curKey] = {};
            }
          }
          if (Array.isArray(obj[curKey])) {
            curObj = obj[curKey][0];
          } else {
            curObj = obj[curKey];
          }
        } else {
          if (!curObj[curKey]) {
            if (hasLast) {
              curObj[curKey] = lastValueType(item.type);
            } else {
              curObj[curKey] = {};
            }
          }
          if (Array.isArray(curObj[curKey])) {
            curObj = curObj[curKey][0];
          } else {
            curObj = curObj[curKey];
          }
        }
      }
    });
  });
  return obj;
}

/**
 * 当字段是最后一个的时候，根据传入的类型。判断字段
 * @param type string
 */
function lastValueType(type: string) {
  const lowerCaseType = type.toLocaleLowerCase();
  const reg = /\w+\[\]/g;
  let _type = lowerCaseType,
    isArray = false,
    result = null;
  if (reg.test(lowerCaseType)) {
    _type = lowerCaseType.split("[]")[0];
    isArray = true;
  }
  if (_type === "object") {
    result = {};
  } else if (_type === "string") {
    result = "";
  } else if (_type === "int" || _type === "float") {
    result = 1;
  }
  return isArray ? [result] : result;
}

export function parseUrl({
  type,
  url,
}: ApiResponse): {
  funcName: string;
  api: string;
  params: any[];
} {
  // 解析方法名
  let funcName = url,
    api = url,
    params: any[] = [],
    // 解析路径 获取参数
    paramKeyList = url.match(/(\/)?\:\w+/g) || [];
  let urlKeyList = funcName.match(/\/\w{1}|(\/)?\:\w{1}|\_\w{1}/g) || [];
  urlKeyList.forEach((reg) => {
    /** 此代码是把路由链接转成方法名：
     * 1 匹配出路由首字母转大写
     * 2 如果是参数类型前面添加By
     * 3 由于后端接口可能乱写，所以参数类型防止reg[2] 拿不到数据需要做兼容
     */
    funcName = funcName.replace(
      new RegExp(reg, "g"),
      /\:/.test(reg)
        ? `By${(reg[2] || reg[1]).toUpperCase()}`
        : reg[1].toUpperCase()
    );
  });

  funcName = `${type}${funcName}`;

  paramKeyList.forEach((item) => {
    var param = item.split(":")[1];
    params.push(param);
    api = api.replace(new RegExp(item, "g"), "/${" + param + "}");
  });
  return { funcName, api, params };
}
