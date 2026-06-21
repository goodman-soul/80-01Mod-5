import { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Typography,
  Button,
  Modal,
  Form,
  Input,
  Radio,
  message,
  Space,
  Tag,
  Alert,
  Tooltip,
} from 'antd';
import {
  RollbackOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { api } from '../../shared/api';
import type { ReturnRecord, Equipment } from '../../shared/types';
import { BorrowRequestStatus } from '../../shared/types';

const { Title, Text } = Typography;

interface ReturnRecordDetail
  extends ReturnRecord {
  equipment: Equipment & { type: { name: string; accessories: string[] } };
  elderly_name?: string;
}

export function WarehouseReturnPage() {
  const [data, setData] = useState<ReturnRecordDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [returnVisible, setReturnVisible] = useState(false);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'cleaning' | 'all'>('pending');

  const refresh = () => {
    setLoading(true);
    api.getPendingReturns().then((d) => {
      setData(d as ReturnRecordDetail[]);
      setLoading(false);
    });
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleReturn = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const borrows = await api.getBorrowRequests(BorrowRequestStatus.SHIPPED);
      const target = borrows.find(
        (b) => b.equipment_id && b.equipment_id === values.equipment_id,
      );
      if (!target) {
        throw new Error('未找到对应借出记录，请检查设备编号');
      }
      await api.returnEquipment({
        borrow_request_id: target.id,
        equipment_id: values.equipment_id,
        has_damage: values.has_damage,
        damage_description: values.damage_description,
      });
      message.success('归还登记成功');
      setReturnVisible(false);
      form.resetFields();
      refresh();
    } catch (e: unknown) {
      message.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCleaning = async (record: ReturnRecordDetail) => {
    try {
      await api.completeCleaning({
        return_record_id: record.id,
        completed_by: '仓管小王',
      });
      message.success('清洁消毒完成');
      refresh();
    } catch (e: unknown) {
      message.error((e as Error).message);
    }
  };

  const handleRestock = async (record: ReturnRecordDetail) => {
    try {
      await api.restockEquipment({ return_record_id: record.id });
      message.success('已再次上架');
      refresh();
    } catch (e: unknown) {
      message.error((e as Error).message);
    }
  };

  const filteredData = data.filter((r) => {
    if (activeTab === 'pending') return !r.cleaning_completed && !r.restocked;
    if (activeTab === 'cleaning') return r.cleaning_completed && !r.restocked;
    return true;
  });

  const columns = [
    {
      title: '老人',
      dataIndex: 'elderly_name',
      key: 'elderly_name',
      render: (v?: string) => v || '-',
    },
    {
      title: '设备信息',
      key: 'equipment',
      render: (_: unknown, r: ReturnRecordDetail) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.equipment.type?.name}</div>
          <div style={{ color: '#888', fontSize: 12 }}>
            编号: {r.equipment.serial_number}
          </div>
        </div>
      ),
    },
    {
      title: '归还时间',
      dataIndex: 'returned_at',
      key: 'returned_at',
      render: (t: string) => new Date(t).toLocaleString('zh-CN'),
    },
    {
      title: '清洁消毒',
      key: 'cleaning',
      render: (_: unknown, r: ReturnRecordDetail) =>
        r.cleaning_completed ? (
          <Space>
            <Tag color="green">已完成</Tag>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {r.cleaning_completed_by} ·{' '}
              {r.cleaning_completed_at &&
                new Date(r.cleaning_completed_at).toLocaleDateString('zh-CN')}
            </Text>
          </Space>
        ) : (
          <Tag color="orange">待消毒</Tag>
        ),
    },
    {
      title: '损坏情况',
      key: 'damage',
      render: (_: unknown, r: ReturnRecordDetail) =>
        r.has_damage ? (
          <Tooltip title={r.damage_description}>
            <Tag color="red">有损坏</Tag>
          </Tooltip>
        ) : (
          <Tag color="green">完好</Tag>
        ),
    },
    {
      title: '上架状态',
      key: 'restock',
      render: (_: unknown, r: ReturnRecordDetail) =>
        r.restocked ? (
          <Space>
            <Tag color="green">已上架</Tag>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {r.restocked_at &&
                new Date(r.restocked_at).toLocaleDateString('zh-CN')}
            </Text>
          </Space>
        ) : (
          <Tag color="default">未上架</Tag>
        ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, r: ReturnRecordDetail) => (
        <Space>
          {!r.cleaning_completed && !r.has_damage && (
            <Button
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleCleaning(r)}
            >
              完成消毒
            </Button>
          )}
          {r.has_damage && (
            <Tag color="red">待维修</Tag>
          )}
          {r.cleaning_completed && !r.restocked && !r.has_damage && (
            <Button
              size="small"
              type="primary"
              icon={<ReloadOutlined />}
              onClick={() => handleRestock(r)}
            >
              再次上架
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginTop: 0 }}>仓管 - 设备归还</Title>

      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<RollbackOutlined />}
          onClick={() => setReturnVisible(true)}
        >
          登记归还
        </Button>
      </Space>

      <Card
        tabList={[
          { key: 'pending', tab: '待消毒' },
          { key: 'cleaning', tab: '待上架' },
          { key: 'all', tab: '全部记录' },
        ]}
        activeTabKey={activeTab}
        onTabChange={(k) => setActiveTab(k as 'pending' | 'cleaning' | 'all')}
      >
        <Alert
          message="归还处理流程"
          description="1. 登记归还，检查是否损坏；2. 完成清洁消毒；3. 确认无误后再次上架。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          locale={{ emptyText: '暂无记录' }}
        />
      </Card>

      <Modal
        title="登记设备归还"
        open={returnVisible}
        onOk={handleReturn}
        onCancel={() => { setReturnVisible(false); form.resetFields(); }}
        confirmLoading={submitting}
        okText="确认归还"
        width={560}
      >
        <Form form={form} layout="vertical">
          <Alert
            type="warning"
            showIcon
            message="归还检查要点"
            description={
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>核对设备编号与借出记录一致</li>
                <li>检查外观是否有损坏、磨损</li>
                <li>核对配件是否齐全</li>
              </ul>
            }
            style={{ marginBottom: 16 }}
          />
          <Form.Item
            label="设备编号"
            name="equipment_id"
            rules={[{ required: true, message: '请输入或选择设备编号' }]}
          >
            <Input placeholder="例如：WC-M-001" />
          </Form.Item>
          <Form.Item
            label="是否有损坏"
            name="has_damage"
            rules={[{ required: true, message: '请选择' }]}
          >
            <Radio.Group>
              <Radio value={false}>完好</Radio>
              <Radio value={true}>有损坏</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prev, curr) => prev.has_damage !== curr.has_damage}
          >
            {({ getFieldValue }) =>
              getFieldValue('has_damage') ? (
                <Form.Item
                  label="损坏描述"
                  name="damage_description"
                  rules={[{ required: true, message: '请描述损坏情况' }]}
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="请详细描述损坏情况，如：左扶手断裂、前轮漏气等..."
                  />
                </Form.Item>
              ) : null
            }
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
