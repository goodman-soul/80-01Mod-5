import { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Typography,
  Button,
  Space,
  Modal,
  Descriptions,
  message,
  Input,
} from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { api } from '../../shared/api';
import type {
  BorrowRequestDetail,
  BorrowRequestStatus,
} from '../../shared/types';
import { BORROW_STATUS_LABEL, EquipmentCategory } from '../../shared/types';

const { Title, Text } = Typography;

const statusColorMap: Record<BorrowRequestStatus, string> = {
  pending: 'gold',
  approved: 'blue',
  rejected: 'red',
  shipped: 'cyan',
  returned: 'orange',
  completed: 'green',
};

export function BorrowRequestsPage() {
  const [data, setData] = useState<BorrowRequestDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selected, setSelected] = useState<BorrowRequestDetail | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectVisible, setRejectVisible] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);

  const refresh = () => {
    setLoading(true);
    api.getBorrowRequests().then((d) => {
      setData(d);
      setLoading(false);
    });
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await api.approveBorrowRequest(id);
      message.success('已批准');
      refresh();
    } catch (e: unknown) {
      message.error((e as Error).message);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget || !rejectReason.trim()) {
      message.warning('请填写驳回原因');
      return;
    }
    try {
      await api.rejectBorrowRequest(rejectTarget, rejectReason.trim());
      message.success('已驳回');
      setRejectVisible(false);
      setRejectTarget(null);
      setRejectReason('');
      refresh();
    } catch (e: unknown) {
      message.error((e as Error).message);
    }
  };

  const columns = [
    {
      title: '申请人',
      key: 'elderly',
      render: (_: unknown, r: BorrowRequestDetail) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.elderly_name}</div>
          <div style={{ color: '#888', fontSize: 12 }}>{r.elderly_phone}</div>
        </div>
      ),
    },
    {
      title: '设备',
      key: 'equipment',
      render: (_: unknown, r: BorrowRequestDetail) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.type?.name}</div>
          <div style={{ color: '#888', fontSize: 12 }}>
            押金 ¥{r.type?.deposit}
          </div>
        </div>
      ),
    },
    {
      title: '押金状态',
      dataIndex: 'deposit_paid',
      key: 'deposit_paid',
      render: (paid: boolean) =>
        paid ? (
          <Tag color="green">已缴纳</Tag>
        ) : (
          <Tag color="red">未缴纳</Tag>
        ),
    },
    {
      title: '预计归还日',
      dataIndex: 'expected_return_date',
      key: 'expected_return_date',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: BorrowRequestStatus) => (
        <Tag color={statusColorMap[status]}>
          {BORROW_STATUS_LABEL[status]}
        </Tag>
      ),
    },
    {
      title: '申请时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (t: string) => new Date(t).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, r: BorrowRequestDetail) => (
        <Space>
          <Button size="small" onClick={() => { setSelected(r); setDetailVisible(true); }}>
            详情
          </Button>
          {r.status === 'pending' && (
            <>
              <Button
                size="small"
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(r.id)}
              >
                批准
              </Button>
              <Button
                size="small"
                danger
                icon={<CloseOutlined />}
                onClick={() => {
                  setRejectTarget(r.id);
                  setRejectVisible(true);
                }}
              >
                驳回
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginTop: 0 }}>借用申请管理</Title>

      <Card>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="借用申请详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        width={720}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
        ]}
      >
        {selected && (
          <>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="老人姓名">{selected.elderly_name}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{selected.elderly_phone}</Descriptions.Item>
              <Descriptions.Item label="申请设备">{selected.type?.name}</Descriptions.Item>
              <Descriptions.Item label="设备分类">
                {selected.type?.category === EquipmentCategory.WHEELCHAIR
                  ? '轮椅'
                  : selected.type?.category === EquipmentCategory.WALKER
                  ? '助行器'
                  : '制氧机'}
              </Descriptions.Item>
              <Descriptions.Item label="押金">¥{selected.type?.deposit}</Descriptions.Item>
              <Descriptions.Item label="押金状态">
                {selected.deposit_paid ? <Tag color="green">已缴纳</Tag> : <Tag color="red">未缴纳</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="预计归还日">{selected.expected_return_date}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusColorMap[selected.status]}>
                  {BORROW_STATUS_LABEL[selected.status]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="适配备注" span={2}>
                {selected.adaptation_notes || <Text type="secondary">无</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="库存情况" span={2}>
                <Space>
                  <Tag color="green">在库可借 {selected.available_count} 台</Tag>
                  <Tag color="orange">消毒中 {selected.cleaning_count} 台</Tag>
                </Space>
              </Descriptions.Item>
            </Descriptions>

            {selected.alternatives.length > 0 && (
              <Card size="small" title="可替代方案" type="inner">
                {selected.alternatives.map((a) => (
                  <div key={a.id} style={{ padding: '8px 0' }}>
                    <Space>
                      <Text strong>{a.name}</Text>
                      <Tag color="green">可借 {a.stock.available} 台</Tag>
                      <Text type="secondary">押金 ¥{a.deposit}</Text>
                    </Space>
                    <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
                      {a.description}
                    </div>
                  </div>
                ))}
              </Card>
            )}

            <Card size="small" title="适配说明" type="inner" style={{ marginTop: 12 }}>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                {selected.type?.adaptation_guide}
              </div>
            </Card>
          </>
        )}
      </Modal>

      <Modal
        title="驳回申请"
        open={rejectVisible}
        onOk={handleReject}
        onCancel={() => { setRejectVisible(false); setRejectTarget(null); setRejectReason(''); }}
        okText="确认驳回"
        okButtonProps={{ danger: true }}
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
          请填写驳回原因，老人将会收到通知：
        </Text>
        <Input.TextArea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={4}
          placeholder="例如：库存不足、押金未缴纳等..."
        />
      </Modal>
    </div>
  );
}
