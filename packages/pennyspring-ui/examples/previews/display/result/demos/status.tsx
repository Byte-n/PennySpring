import React from 'react';
import { Button, Column, Result, Row, Text } from '@pennyspring/ui';
import type { ResultStatus } from '@pennyspring/ui';

const STATUS_SAMPLES: {
  status: ResultStatus;
  titleText: string;
  subtitleText: string;
  hint: string;
}[] = [
  {
    status: 'success',
    titleText: '记账成功',
    subtitleText: '¥ 128.00 · 餐饮',
    hint: 'success · 保存、同步、导入完成',
  },
  {
    status: 'warning',
    titleText: '2 笔待确认',
    subtitleText: '来自微信账单导入',
    hint: 'warning · 有结果但需要用户判断',
  },
  {
    status: 'error',
    titleText: '同步失败',
    subtitleText: '网络中断，已保留本地记录',
    hint: 'error · 错误必须给下一步，不只报错',
  },
  {
    status: 'info',
    titleText: '暂无账单',
    subtitleText: '导入后自动生成分类',
    hint: 'info · 中性说明，不带语义色实底',
  },
];

export function ResultStatusDemo() {
  return (
    <Column gap="large">
      {STATUS_SAMPLES.map(({ status, titleText, subtitleText, hint }) => (
        <Column key={status} gap="small">
          <Text color="tertiary" size="xs">{hint}</Text>
          <Result
            size="small"
            status={status}
            subtitleText={subtitleText}
            titleText={titleText}
          />
        </Column>
      ))}
      <Column gap="small">
        <Text color="tertiary" size="xs">错误态给下一步：主按钮在左，次按钮在右，间距 8</Text>
        <Result
          status="error"
          subtitleText="文件超过 20MB，请缩小时间范围后重试"
          titleText="导出失败"
          extra={
            <Row gap="small">
              <Button size="small" variant="solid">重新导出</Button>
              <Button size="small" variant="outlined">取消</Button>
            </Row>
          }
        />
      </Column>
    </Column>
  );
}

export default ResultStatusDemo;
