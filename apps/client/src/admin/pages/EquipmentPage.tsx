import { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Typography,
  Tabs,
  Button,
  Modal,
  Descriptions,
  Space,
  Statistic,
  Row,
  Col,
} from 'antd';
import { InfoCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { api } from '../../shared/api';
import type { EquipmentTypeWithStock, Equipment } from '../../shared/types';
import {
  CATEGORY_LABEL,
  EQUIPMENT_STATUS_LABEL,
  EquipmentCategory,
  EquipmentStatus,
} from '../../shared/types';

const { Title } = Typography;

const statusColorMap: Record<EquipmentStatus, string> = {
  [EquipmentStatus.IN_STOCK]: 'green',
  [EquipmentStatus.BORROWED]: 'blue',
  [EquipmentStatus.CLEANING]: 'orange',
  [EquipmentStatus.MAINTENANCE]: 'red',
  [EquipmentStatus.DAMAGED]: 'red',
};

export function EquipmentPage() {
  const [equipmentTypes, setEquipmentTypes] = useState<
    EquipmentTypeWithStock[]
  >([]);
  const [selectedType, setSelectedType] =
    useState<EquipmentTypeWithStock | null>(null);
  const [equipments, setEquipments] = useState<
    (Equipment & { type: EquipmentTypeWithStock })[]
  >([]);
  const [detailVisible, setDetailVisible] = useState(false);

  useEffect(() => {
    api.getEquipmentTypes().then((data) => {
      setEquipmentTypes(data);
    });
  }, []);

  useEffect(() => {
    if (selectedType) {
      api.getEquipmentsByType(selectedType.id).then(setEquipments);
    }
  }, [selectedType]);

  const tabItems = [
    { key: 'all', label: '全部' },
    { key: EquipmentCategory.WHEELCHAIR, label: CATEGORY_LABEL[EquipmentCategory.WHEELCHAIR] },
    { key: EquipmentCategory.WALKER, label: CATEGORY_LABEL[EquipmentCategory.WALKER] },
    { key: EquipmentCategory.OXYGEN_CONCENTRATOR, label: CATEGORY_LABEL[EquipmentCategory.OXYGEN_CONCENTRATOR] },
  ];

  const columns = [
    {
      title: '设备编号',
      dataIndex: 'serial_number',
      key: 'serial_number',
      width: 150,
    },
    {
      title: '设备名称',
      key: 'name',
      render: (_: unknown, record: Equipment & { type: EquipmentTypeWithStock }) =>
        record.type?.name,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: EquipmentStatus) => (
        <Tag color={statusColorMap[status]}>
          {EQUIPMENT_STATUS_LABEL[status]}
        </Tag>
      ),
    },
    {
      title: '上次清洁时间',
      dataIndex: 'last_cleaned_at',
      key: 'last_cleaned_at',
      render: (t?: string) =>
        t ? new Date(t).toLocaleString('zh-CN') : '-',
    },
    {
      title: '上次维修时间',
      dataIndex: 'last_maintained_at',
      key: 'last_maintained_at',
      render: (t?: string) =>
        t ? new Date(t).toLocaleString('zh-CN') : '-',
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginTop: 0 }}>设备管理</Title>

      <Tabs
        defaultActiveKey="all"
        items={tabItems}
        onChange={() => {
          setSelectedType(null);
        }}
      >
      </Tabs>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        {equipmentTypes.map((t) => (
          <Col span={8} key={t.id}>
            <Card
              hoverable
              onClick={() => {
                setSelectedType(t);
                setDetailVisible(true);
              }}
              style={{ marginBottom: 16 }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>
                    {t.name}
                    <Tag style={{ marginLeft: 8 }}>
                      {CATEGORY_LABEL[t.category]}
                    </Tag>
                  </div>
                  <div style={{ color: '#888', fontSize: 13, marginTop: 4 }}>
                    {t.description}
                  </div>
                </div>
                <EyeOutlined style={{ color: '#1677ff', fontSize: 16 }} />
              </div>
              <Row gutter={8} style={{ marginTop: 16 }}>
                <Col span={6}>
                  <Statistic
                    title="在库"
                    value={t.stock.available}
                    valueStyle={{ fontSize: 18, color: '#52c41a' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="消毒中"
                    value={t.stock.cleaning}
                    valueStyle={{ fontSize: 18, color: '#faad14' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="借出"
                    value={t.stock.borrowed}
                    valueStyle={{ fontSize: 18, color: '#1677ff' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="押金"
                    value={t.deposit}
                    prefix="¥"
                    valueStyle={{ fontSize: 18 }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={selectedType?.name}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
        ]}
      >
        {selectedType && (
          <>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="分类">
                {CATEGORY_LABEL[selectedType.category]}
              </Descriptions.Item>
              <Descriptions.Item label="押金">
                ¥{selectedType.deposit}
              </Descriptions.Item>
              <Descriptions.Item label="描述" span={2}>
                {selectedType.description}
              </Descriptions.Item>
              <Descriptions.Item label="标准配件" span={2}>
                {selectedType.accessories.map((a) => (
                  <Tag key={a}>{a}</Tag>
                ))}
              </Descriptions.Item>
            </Descriptions>

            <Card
              size="small"
              title={
                <Space>
                  <InfoCircleOutlined style={{ color: '#1677ff' }} />
                  适配说明
                </Space>
              }
              style={{ marginBottom: 16 }}
            >
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                {selectedType.adaptation_guide}
              </div>
            </Card>

            <Title level={5}>设备明细</Title>
            <Table
              size="small"
              rowKey="id"
              columns={columns}
              dataSource={equipments}
              pagination={false}
              loading={!equipments.length}
            />
          </>
        )}
      </Modal>
    </div>
  );
}
