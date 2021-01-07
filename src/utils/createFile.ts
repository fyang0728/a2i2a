import * as vscode from 'vscode';
const fs = require('fs');

export default async function createFile(
  context: string,
  type: 'type' | 'api'
) {
  const uri = await vscode.window.showSaveDialog({
    saveLabel: type === 'api' ? '保存接口文件' : '保存类型文件',
    filters: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      TypeScript: ['ts', 'tsx'],
    },
  });
  if (uri) {
    fs.writeFile(uri.path, context, (err: any) => {
      if (err) {
        vscode.window.showErrorMessage(
          `${type === 'type' ? '类型' : '接口'}文件创建失败`
        );
        console.log(err);
      }
    });
  } else {
    vscode.window.showWarningMessage(
      `${type === 'type' ? '类型' : '接口'}文件取消保存！`
    );
  }
}
