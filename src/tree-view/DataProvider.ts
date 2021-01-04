import { TreeItem } from 'vscode';
import { BaseProvider, TreeNode } from './BaseProvider';
import ApiNodeAction from '../action/apiNode';
export default class CustomProvider extends BaseProvider {
  constructor() {
    super();
    this.refreshNodeList();
  }
  private rootElements: any[] = [];
  /**
   * 刷新节点列表
   */
  refreshNodeList() {
    const customNodes = ApiNodeAction.getApiNodes();
    if (customNodes.length) {
      this.rootElements = customNodes;
    } else {
      this.rootElements = [];
    }
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: TreeNode): TreeItem | Thenable<TreeItem> {
    return element;
  }

  async getChildren(element?: TreeNode): Promise<TreeNode[]> {
    if (element?.children) {
      return element.children;
    }
    return this.rootElements;
  }
}
