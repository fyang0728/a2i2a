export default function funcTemplate(
  funcName: string,
  api: string,
  type: string,
  prefixName: string,
  params: string[],
  isReqParams: boolean
): string {
  const paramsStr = parseParams(params, isReqParams, prefixName);
  const tempalte = `export const ${funcName} = (${paramsStr}):Promise<${prefixName}Res> => {
  return request.${type}(\`${api}\`${isUseParams(
    type,
    isReqParams
  )})            
}`;
  return tempalte;
}

/**
 * 判断是 请求方式的参数是用data还是params
 * @param type 类型
 * @param isReqParams 是否存在参数
 */
function isUseParams(type: any, isReqParams: boolean): string {
  if (!isReqParams) {
    return '';
  }
  switch (type) {
    case 'get':
      return ', {params}';
    default:
      return ', {data: params}';
  }
}

/**
 * 解析方法需要的参数
 * @param params
 * @param isReqParams
 * @param prefixName
 */
function parseParams(
  params: string[],
  isReqParams: boolean,
  prefixName: string
): string {
  if (params.length > 0 && !isReqParams) {
    const param = params.join(':any, ') + ':any';
    return param;
  } else if (params.length === 0 && isReqParams) {
    return `params: ${prefixName}Req`;
  } else if (params.length > 0 && isReqParams) {
    return `${params.join(':any, ')} :any, params: ${prefixName}Req`;
  }
  return '';
}
