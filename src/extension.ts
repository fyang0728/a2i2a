import * as vscode from 'vscode';
import ApiNodeAction from './action/apiNode';
import DataProvider from './tree-view/DataProvider';
import { TreeNode } from './tree-view/BaseProvider';
import { ApiResponse, parseResponseTree, parseUrl } from './utils/utils';
import fieldParse from './utils/fieldParse';
import funcTemplate from './utils/funcTemplate';
import createFile from './utils/createFile';
import { getApiSource } from './http/api';

export function activate(context: vscode.ExtensionContext) {
  ApiNodeAction.context = context;
  const dataProvider = new DataProvider();
  vscode.window.createTreeView('api', {
    treeDataProvider: dataProvider,
    showCollapseAll: true,
  });
  const addApi = vscode.commands.registerCommand(
    'api.addApi',
    async function () {
      const projectName = await vscode.window.showInputBox({
        placeHolder: '请输入项目名',
      });
      if (!projectName) {
        return;
      }
      const apiPath = await vscode.window.showInputBox({
        placeHolder: '请输入接口地址',
      });
      if (!apiPath) {
        return;
      }
      const res = await getApiSource(apiPath);
      const apiTree = parseResponseTree(res.data);
      // 项目
      const isAdd = ApiNodeAction.addApiNode({
        label: projectName || '',
        link: apiPath || '',
        isDir: true,
        contextValue: 'dir',
        collapsibleState: 1,
        children: apiTree,
      });
      isAdd && dataProvider.refreshNodeList();
    }
  );

  const removeApi = vscode.commands.registerCommand(
    'api.removeNode',
    function (root: TreeNode) {
      ApiNodeAction.removeApiNode(root.label!);
      dataProvider.refreshNodeList();
    }
  );
  const refreshApi = vscode.commands.registerCommand(
    'api.refreshApi',
    async function (root) {
      const customList = ApiNodeAction.getApiNodes();
      let index = -1;
      customList.some((item, i) => {
        index = i;
        return item.link === root.link;
      });
      const res = await getApiSource(root.link);
      const apiTree = parseResponseTree(res.data);
      customList[index].children = apiTree;
      ApiNodeAction.setApiNodes(customList);
      dataProvider.refreshNodeList();
    }
  );

  const buildApi = vscode.commands.registerCommand(
    'api.apiBuild',
    function (root) {
      let newRoot = [];
      root.isDir ? (newRoot = root.children) : (newRoot = [root]);
      const interfaceArray: string[] = [];
      const apiArray: string[] = [];
      newRoot.forEach((apiItem: ApiResponse) => {
        const { funcName, api, params } = parseUrl(apiItem);
        try {
          const prefixName = funcName.replace(
            /\w{1}/,
            funcName[0].toUpperCase()
          );
          // 请求参数
          if (apiItem.parameter) {
            interfaceArray.push(
              fieldParse(apiItem.parameter, prefixName + 'Req')
            );
          }
          // 响应参数
          if (apiItem.success) {
            interfaceArray.push(
              fieldParse(apiItem.success, prefixName + 'Res')
            );
          }
          apiArray.push(
            funcTemplate(
              funcName,
              api,
              apiItem.type,
              prefixName,
              params,
              apiItem.parameter ? true : false
            )
          );
        } catch (error) {
          console.warn(error);
        }
      });
      createFile(interfaceArray.join(' '), 'type');
      createFile(apiArray.join('\n'), 'api');
    }
  );
  context.subscriptions.push(addApi, removeApi, buildApi, refreshApi);
}

export function deactivate() {}
