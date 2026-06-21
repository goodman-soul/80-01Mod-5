import React, { useEffect, useState } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Typography,
  Alert,
  message,
  Space,
  Tag,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { api } from '../../shared/api';
import type { EquipmentTypeWithStock } from '../../shared/types';
import { CATEGORY_LABEL, EquipmentCategory } from '../../shared/types';

const { Title } = Typography;

export function NewReservationPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [types, setTypes] = useState<EquipmentTypeWithStock[]>([]);
  const [selectedType, setSelectedType] = useState<EquipmentTypeWithStock | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.getEquipmentTypes().then(setTypes);
  }, []);

  useEffect(() => {
    const id = form.getFieldValue('type_id');
    if (id) {
      const t = types.find((x) => x.id === id);
      setSelectedType(t || null);
    } else {
      setSelectedType(null);
    }
  }, [form, types, form.getFieldValue('type_id')]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      await api.createReservation({
        elderly_id: values.elderly_id,
        elderly_name: values.elderly_name,
        elderly_phone: values.elderly_phone,
        type_id: values.type_id,
        preferred_date: values.preferred_date.format('YYYY-MM-DD'),
        note: values.note,
        created_by: '管家小李',
      });
      message.success('预约创建成功');
      navigate('/reservations');
    } catch (e: unknown) {
      if ((e as Error).message !== '取消') {
        message.error((e as Error).message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const categoryOptions = [
    { label: '全部', value: undefined },
    { label: CATEGORY_LABEL[EquipmentCategory.WHEELCHAIR], value: EquipmentCategory.WHEELCHAIR },
    { label: CATEGORY_LABEL[EquipmentCategory.WALKER], value: EquipmentCategory.WALKER },
    { label: CATEGORY_LABEL[EquipmentCategory.OXYGEN_CONCENTRATOR], value: EquipmentCategory.OXYGEN_CONCENTRATOR },
  ];

  const [categoryFilter, setCategoryFilter] = useState<EquipmentCategory | undefined>();
  const filteredTypes = categoryFilter
    ? types.filter((t) => t.category === categoryFilter)
    : types;

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/reservations')}>
          返回
        </Button>
        <Title level={3} style={{ margin: 0 }}>新建服务预约</Title>
      </Space>

      <Card style={{ maxWidth: 800 }}>
        <Form form={form} layout="vertical">
          <Title level={5}>老人信息</Title>
          <Space style={{ width: '100%' }} size="large">
            <Form.Item
              label="老人姓名"
              name="elderly_name"
              rules={[{ required: true, message: '请输入姓名' }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="请输入老人姓名" />
            </Form.Item>
            <Form.Item
              label="联系电话"
              name="elderly_phone"
              rules={[{ required: true, message: '请输入电话' }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="请输入联系电话" />
            </Form.Item>
          </Space>
          <Form.Item label="老人编号" name="elderly_id">
            <Input placeholder="选填，内部编号" />
          </Form.Item>

          <Title level={5} style={{ marginTop: 8 }}>
            预约设备
          </Title>

          <Form.Item label="设备分类筛选">
            <Select
              options={categoryOptions}
              value={categoryFilter}
              onChange={setCategoryFilter}
              style={{ width: 200 }}
            />
          </Form.Item>

          <Form.Item
            label="选择设备"
            name="type_id"
            rules={[{ required: true, message: '请选择设备' }]}
          >
            <Select
              placeholder="请选择要预约的设备"
              onChange={() => {}}
              optionRender={(option) => {
                const t = types.find((x) => x.id === option.value);
                if (!t) return option.label as React.ReactNode;
                return (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{t.name}</div>
                      <div style={{ color: '#888', fontSize: 12 }}>{t.description}</div>
                    </div>
                    <Space>
                      <Tag color="green">在库 {t.stock.available}</Tag>
                      <Tag color="orange">消毒中 {t.stock.cleaning}</Tag>
                      <Tag>押金 ¥{t.deposit}</Tag>
                    </Space>
                  </div>
                );
              }}
            >
              {filteredTypes.map((t) => (
                <Select.Option key={t.id} value={t.id}>
                  {t.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {selectedType && (
            <>
              {selectedType.stock.available === 0 && selectedType.stock.cleaning > 0 && (
                <Alert
                  type="warning"
                  showIcon
                  message={`该设备当前无在库库存，但有 ${selectedType.stock.cleaning} 台正在清洁消毒中，预计1-2个工作日后可使用。`}
                  style={{ marginBottom: 16 }}
                />
              )}
              {selectedType.stock.available === 0 && selectedType.stock.cleaning === 0 && (
                <Alert
                  type="error"
                  showIcon
                  message="该设备当前无可用库存，请选择同类其他型号。"
                  style={{ marginBottom: 16 }}
                />
              )}
              {selectedType.stock.available > 0 && selectedType.stock.available <= 1 && (
                <Alert
                  type="info"
                  showIcon
                  message={`库存紧张，仅剩 ${selectedType.stock.available} 台可借。`}
                  style={{ marginBottom: 16 }}
                />
              )}

              <Card size="small" style={{ marginBottom: 16 }}>
                <Space direction="vertical" size={4}>
                  <div><strong>设备：</strong>{selectedType.name}</div>
                  <div><strong>描述：</strong>{selectedType.description}</div>
                  <div><strong>押金：</strong>¥{selectedType.deposit}</div>
                  <div>
                    <strong>标准配件：</strong>
                    {selectedType.accessories.map((a) => (
                      <Tag key={a}>{a}</Tag>
                    ))}
                  </div>
                </Space>
              </Card>

              <Card
                size="small"
                title="适配说明"
                type="inner"
                style={{ marginBottom: 16 }}
              >
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                  {selectedType.adaptation_guide}
                </div>
              </Card>

              {selectedType.stock.available === 0 && (
                <Card
                  size="small"
                  title="可替代方案（请提前告知老人）"
                  type="inner"
                  style={{ marginBottom: 16 }}
                >
                  {types
                    .filter(
                      (t) =>
                        t.category === selectedType.category &&
                        t.id !== selectedType.id &&
                        t.stock.available > 0,
                    )
                    .map((t) => (
                      <div key={t.id} style={{ padding: '8px 0' }}>
                        <Space>
                          <strong>{t.name}</strong>
                          <Tag color="green">可借 {t.stock.available} 台</Tag>
                          <Tag>押金 ¥{t.deposit}</Tag>
                        </Space>
                        <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
                          {t.description}
                        </div>
                      </div>
                    ))}
                  {types.filter(
                    (t) =>
                      t.category === selectedType.category &&
                      t.id !== selectedType.id &&
                      t.stock.available > 0,
                  ).length === 0 && (
                    <div style={{ color: '#999' }}>暂无其他可替代型号</div>
                  )}
                </Card>
              )}
            </>
          )}

          <Form.Item
            label="期望服务日期"
            name="preferred_date"
            rules={[{ required: true, message: '请选择日期' }]}
          >
            <DatePicker
              style={{ width: 240 }}
              disabledDate={(d) => d && d.isBefore(dayjs().startOf('day'))}
              placeholder="请选择日期"
            />
          </Form.Item>

          <Form.Item label="备注" name="note">
            <Input.TextArea rows={3} placeholder="选填，如特殊注意事项等" />
          </Form.Item>

          <Space>
            <Button type="primary" onClick={handleSubmit} loading={submitting}>
              提交预约
            </Button>
            <Button onClick={() => navigate('/reservations')}>取消</Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
}
