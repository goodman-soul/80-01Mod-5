import { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Typography,
  Button,
  Modal,
  Form,
  Select,
  Checkbox,
  message,
  Descriptions,
  Tag,
  Alert,
} from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { api } from '../../shared/api';
import type { Equipment } from '../../shared/types';
import type { EquipmentTypeWithStock } from '../../shared/types';

const { Title } = Typography;

interface PendingShipment {
  borrow_request_id: string;
  elderly_name: string;
  elderly_phone: string;
  type_name: string;
  deposit: number;
  expected_return_date: string;
  adaptation_notes?: string;
  available_equipments: (Equipment & { type: EquipmentTypeWithStock })[];
}

export function WarehouseShipPage() {
  const [data, setData] = useState<PendingShipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [shipVisible, setShipVisible] = useState(false);
  const [selected, setSelected] = useState<PendingShipment | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const refresh = () => {
    setLoading(true);
    api.getPendingShipments().then((d) => {
      setData(d);
      setLoading(false);
    });
  };

  useEffect(() => {
    refresh();
  }, []);

  const openShip = (record: PendingShipment) => {
    if (record.available_equipments.length === 0) {
      message.warning('当前无可用设备可借出');
      return;
    }
    setSelected(record);
    const defaultAcc = record.available_equipments[0]?.type?.accessories || [];
    form.setFieldsValue({
      equipment_id: record.available_equipments[0]?.id,
      accessories: defaultAcc,
      shipped_by: '仓管小王',
    });
    setShipVisible(true);
  };

  const handleShip = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await api.shipEquipment({
        borrow_request_id: selected!.borrow_request_id,
        equipment_id: values.equipment_id,
        accessories: values.accessories,
        shipped_by: values.shipped_by,
      });
      message.success('发货成功');
      setShipVisible(false);
      setSelected(null);
      form.resetFields();
      refresh();
    } catch (e: unknown) {
      if ((e as Error).message !== '取消') {
        message.error((e as Error).message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const selectedEquipment = selected?.available_equipments.find(
    (e) => e.id === form.getFieldValue('equipment_id'),
  );

  const columns = [
    {
      title: '老人信息',
      key: 'elderly',
      render: (_: unknown, r: PendingShipment) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.elderly_name}</div>
          <div style={{ color: '#888', fontSize: 12 }}>{r.elderly_phone}</div>
        </div>
      ),
    },
    {
      title: '设备',
      dataIndex: 'type_name',
      key: 'type_name',
    },
    {
      title: '押金',
      dataIndex: 'deposit',
      key: 'deposit',
      render: (d: number) => `¥${d}`,
    },
    {
      title: '预计归还日',
      dataIndex: 'expected_return_date',
      key: 'expected_return_date',
    },
    {
      title: '可用设备',
      key: 'available',
      render: (_: unknown, r: PendingShipment) => (
        <Tag color={r.available_equipments.length > 0 ? 'green' : 'red'}>
          {r.available_equipments.length} 台可借
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, r: PendingShipment) => (
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={() => openShip(r)}
          disabled={r.available_equipments.length === 0}
        >
          发货
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginTop: 0 }}>仓管 - 设备发货</Title>

      <Card>
        <Alert
          message="发货流程"
          description="1. 选择可用设备；2. 记录设备编号；3. 核对并勾选随附配件；4. 确认发货。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Table
          rowKey="borrow_request_id"
          columns={columns}
          dataSource={data}
          loading={loading}
          locale={{ emptyText: '暂无待发货申请' }}
        />
      </Card>

      <Modal
        title="确认发货"
        open={shipVisible}
        onOk={handleShip}
        onCancel={() => { setShipVisible(false); setSelected(null); }}
        confirmLoading={submitting}
        okText="确认发货"
        width={680}
      >
        {selected && (
          <Form form={form} layout="vertical">
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="老人">{selected.elderly_name}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{selected.elderly_phone}</Descriptions.Item>
              <Descriptions.Item label="设备">{selected.type_name}</Descriptions.Item>
              <Descriptions.Item label="押金">¥{selected.deposit}</Descriptions.Item>
              <Descriptions.Item label="预计归还">{selected.expected_return_date}</Descriptions.Item>
              <Descriptions.Item label="适配备注">
                {selected.adaptation_notes || '无'}
              </Descriptions.Item>
            </Descriptions>

            <Form.Item
              label="选择设备（记录编号）"
              name="equipment_id"
              rules={[{ required: true, message: '请选择设备' }]}
            >
              <Select
                placeholder="请选择要借出的设备"
                onChange={() => {
                  const eqId = form.getFieldValue('equipment_id');
                  const eq = selected.available_equipments.find((e) => e.id === eqId);
                  if (eq) {
                    form.setFieldsValue({
                      accessories: eq.type?.accessories || [],
                    });
                  }
                }}
              >
                {selected.available_equipments.map((eq) => (
                  <Select.Option key={eq.id} value={eq.id}>
                    编号: {eq.serial_number}
                    {eq.last_cleaned_at
                      ? ` (最近清洁: ${new Date(eq.last_cleaned_at).toLocaleDateString('zh-CN')})`
                      : ''}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {selectedEquipment && (
              <Alert
                type="info"
                showIcon
                message={`设备编号: ${selectedEquipment.serial_number}`}
                description={
                  <div>
                    <div>状态: 在库可借</div>
                    {selectedEquipment.last_cleaned_at && (
                      <div>最近清洁: {new Date(selectedEquipment.last_cleaned_at).toLocaleString('zh-CN')}</div>
                    )}
                  </div>
                }
                style={{ marginBottom: 16 }}
              />
            )}

            <Form.Item
              label="随附配件"
              name="accessories"
              rules={[{ required: true, message: '请确认随附配件' }]}
            >
              <Checkbox.Group
                options={
                  selected.available_equipments[0]?.type?.accessories.map((a) => ({
                    label: a,
                    value: a,
                  })) || []
                }
              />
            </Form.Item>

            <Form.Item
              label="发货人"
              name="shipped_by"
              rules={[{ required: true, message: '请填写发货人' }]}
            >
              <Select
                options={[
                  { label: '仓管小王', value: '仓管小王' },
                  { label: '仓管小李', value: '仓管小李' },
                ]}
              />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}
