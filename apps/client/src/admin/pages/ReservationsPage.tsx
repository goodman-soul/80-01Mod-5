import { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Typography,
  Button,
  Space,
  Tag,
  Alert,
  message,
  Modal,
} from 'antd';
import {
  PlusOutlined,
  CheckOutlined,
  CloseOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { api } from '../../shared/api';
import type { ReservationDetail, ReservationStatus } from '../../shared/types';
import { RESERVATION_STATUS_LABEL, CATEGORY_LABEL } from '../../shared/types';

const { Title } = Typography;

const statusColorMap: Record<ReservationStatus, string> = {
  pending: 'gold',
  confirmed: 'blue',
  cancelled: 'red',
  completed: 'green',
};

export function ReservationsPage() {
  const [data, setData] = useState<ReservationDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [alternativesVisible, setAlternativesVisible] = useState(false);
  const [alternativesData, setAlternativesData] = useState<ReservationDetail | null>(null);

  const refresh = () => {
    setLoading(true);
    api.getReservations().then((d) => {
      setData(d);
      setLoading(false);
    });
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleConfirm = async (id: string) => {
    try {
      await api.confirmReservation(id);
      message.success('预约已确认');
      refresh();
    } catch (e: unknown) {
      message.error((e as Error).message);
    }
  };

  const handleCancel = async (id: string) => {
    Modal.confirm({
      title: '取消预约',
      content: '确定要取消该预约吗？',
      okText: '确定取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await api.cancelReservation(id, '管家操作取消');
          message.success('预约已取消');
          refresh();
        } catch (e: unknown) {
          message.error((e as Error).message);
        }
      },
    });
  };

  const handleComplete = async (id: string) => {
    try {
      await api.completeReservation(id);
      message.success('服务已完成');
      refresh();
    } catch (e: unknown) {
      message.error((e as Error).message);
    }
  };

  const columns = [
    {
      title: '老人信息',
      key: 'elderly',
      render: (_: unknown, r: ReservationDetail) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.elderly_name}</div>
          <div style={{ color: '#888', fontSize: 12 }}>{r.elderly_phone}</div>
        </div>
      ),
    },
    {
      title: '预约设备',
      key: 'equipment',
      render: (_: unknown, r: ReservationDetail) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.type?.name}</div>
          <div style={{ color: '#888', fontSize: 12 }}>
            {CATEGORY_LABEL[r.type?.category as keyof typeof CATEGORY_LABEL]}
          </div>
        </div>
      ),
    },
    {
      title: '预约日期',
      dataIndex: 'preferred_date',
      key: 'preferred_date',
    },
    {
      title: '库存状态',
      key: 'stock',
      render: (_: unknown, r: ReservationDetail) => (
        <Space direction="vertical" size={4}>
          <Space>
            <Tag color="green">在库 {r.available_count} 台</Tag>
            <Tag color="orange">消毒中 {r.cleaning_count} 台</Tag>
          </Space>
          {r.stock_warning && (
            <Alert
              type={r.available_count === 0 ? 'warning' : 'info'}
              showIcon
              message={r.stock_warning}
              style={{ maxWidth: 320, padding: '4px 8px', fontSize: 12 }}
            />
          )}
        </Space>
      ),
    },
    {
      title: '备注',
      dataIndex: 'note',
      key: 'note',
      render: (v?: string) => v || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: ReservationStatus) => (
        <Tag color={statusColorMap[status]}>
          {RESERVATION_STATUS_LABEL[status]}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, r: ReservationDetail) => (
        <Space direction="vertical" size={4}>
          <Space>
            {r.status === 'pending' && (
              <>
                <Button
                  size="small"
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => handleConfirm(r.id)}
                >
                  确认
                </Button>
                <Button
                  size="small"
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => handleCancel(r.id)}
                >
                  取消
                </Button>
              </>
            )}
            {r.status === 'confirmed' && (
              <Button
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleComplete(r.id)}
              >
                完成服务
              </Button>
            )}
            {(r.status === 'pending' || r.status === 'confirmed') &&
              r.alternatives.length > 0 && (
                <Button
                  size="small"
                  onClick={() => {
                    setAlternativesData(r);
                    setAlternativesVisible(true);
                  }}
                >
                  替代方案
                </Button>
              )}
          </Space>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginTop: 0 }}>管家 - 服务预约</Title>

      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/reservations/new')}
        >
          新建预约
        </Button>
      </Space>

      <Card>
        <Alert
          message="注意事项"
          description={
            <div>
              当设备正在消毒中或库存紧张时，系统会自动提示并展示同类可替代方案，请提前告知老人。
            </div>
          }
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="可替代方案"
        open={alternativesVisible}
        onCancel={() => { setAlternativesVisible(false); setAlternativesData(null); }}
        footer={[
          <Button key="ok" type="primary" onClick={() => setAlternativesVisible(false)}>
            我已知晓
          </Button>,
        ]}
        width={640}
      >
        {alternativesData && (
          <>
            <Alert
              type="warning"
              showIcon
              message={`${alternativesData.type?.name} 当前在库 ${alternativesData.available_count} 台，消毒中 ${alternativesData.cleaning_count} 台`}
              description={alternativesData.stock_warning || ''}
              style={{ marginBottom: 16 }}
            />
            <Title level={5}>同类其他可替代型号：</Title>
            {alternativesData.alternatives.map((a) => (
              <Card
                key={a.id}
                size="small"
                style={{ marginBottom: 8 }}
                title={
                  <Space>
                    <span>{a.name}</span>
                    <Tag color="green">
                      在库 {a.stock.available} 台
                    </Tag>
                    <Tag>押金 ¥{a.deposit}</Tag>
                  </Space>
                }
              >
                <div style={{ color: '#555' }}>{a.description}</div>
              </Card>
            ))}
            {alternativesData.alternatives.length === 0 && (
              <div style={{ color: '#999', textAlign: 'center', padding: 24 }}>
                暂无其他可替代型号
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
