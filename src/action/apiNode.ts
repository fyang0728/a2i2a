import { ExtensionContext, Webview, Uri } from 'vscode';
interface Node {
  label: string;
  link: string;
  isDir: boolean;
  contextValue: string;
  collapsibleState: number;
  children: Node;
}
export default class ApiNodeAction {
  static context: ExtensionContext | undefined;

  /**
   * 获取WebView的上下文地址
   * @param webview webview
   */
  static getWebViewContextPath(webview: Webview): string {
    return webview
      .asWebviewUri(Uri.file(this.context!.extensionPath))
      .toString();
  }

  /**
   * 保存加入的API列表节点
   * @param nodes
   */
  static setApiNodes(nodes: Node[]) {
    this.context?.globalState.update('nodes', nodes);
  }

  /**
   * 获取所有API列表节点
   */
  static getApiNodes(): Node[] {
    return this.context?.globalState.get<Node[]>('nodes') || [];
  }

  /**
   * 添加一个API列表节点
   * @param node 要添加的节点
   * @returns true表示添加成功，false表示节点已存在无需添加
   */
  static addApiNode(node: Node): boolean {
    const nodes = this.getApiNodes();
    nodes.push(node);
    this.setApiNodes(nodes);
    return true;
  }

  /**
   * 删除API列表节点
   * @param nodeName 要删除的API节点名称
   */
  static removeApiNode(nodeName: string) {
    const nodes = this.getApiNodes();
    const i = nodes.findIndex((n) => n.label === nodeName);
    if (i >= 0) {
      nodes.splice(i, 1);
    }
    this.setApiNodes(nodes);
  }
}
