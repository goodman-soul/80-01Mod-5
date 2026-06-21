import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Tag, List, Typography } from 'antd';
import {
  ToolOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { api } from '../../shared/api';
import type {
  EquipmentTypeWithStock,
  BorrowRequestDetail,
  ReservationDetail,
} from '../../shared/types';
import { CATEGORY_LABEL, BORROW_STATUS_LABEL, RESERVATION_STATUS_LABEL } from '../../shared/types';

const { Title } = Typography;

export function DashboardPage() {
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentTypeWithStock[]>([]);
  const [borrowRequests, setBorrowRequests] = useState<BorrowRequestDetail[]>([]);
  const [reservations, setReservations] = useState<ReservationDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getEquipmentTypes(),
      api.getBorrowRequests(),
      api.getReservations(),
    ])
      .then(([types, borrows, res]) => {
        setEquipmentTypes(types);
        setBorrowRequests(borrows);
        setReservations(res);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalStock = equipmentTypes.reduce((s, t) => s + t.stock.total, 0);
  const availableStock = equipmentTypes.reduce((s, t) => s + t.stock.available, 0);
  const cleaningStock = equipmentTypes.reduce((s, t) => s + t.stock.cleaning, 0);
  const pendingBorrows = borrowRequests.filter(
    (r) => r.status === 'pending' || r.status === 'approved',
  ).length;
  const pendingReservations = reservations.filter(
    (r) => r.status === 'pending',
  ).length;

  return (
    <div>
      <Title level={3} style={{ marginTop: 0 }}>工作台概览</Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="设备总数"
              value={totalStock}
              prefix={<ToolOutlined style={{ color: '#1677ff' }} />}
            />
            <div style={{ marginTop: 8, fontSize: 13 }}>
              <Tag color="green">在库 {availableStock}</Tag>
              <Tag color="orange">消毒中 {cleaningStock}</Tag>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="待处理借用申请"
              value={pendingBorrows}
              valueStyle={{ color: pendingBorrows > 0 ? '#faad14' : '#52c41a' }}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="待发货"
              value={pendingBorrows}
              prefix={<ShoppingCartOutlined style={{ color: '#1677ff' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="待确认预约"
              value={pendingReservations}
              valueStyle={{ color: pendingReservations > 0 ? '#eb2f96' : '#52c41a' }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={14}>
          <Card title="设备库存情况" loading={loading}>
            <List
              dataSource={equipmentTypes}
              renderItem={(item) => (
                <List.Item
                  key={item.id}
                  style={{ paddingLeft: 0, paddingRight: 0 }}
                >
                  <List.Item.Meta
                    title={
                      <span>
                        {item.name}
                        <Tag style={{ marginLeft: 8 }}>
                          {CATEGORY_LABEL[item.category]}
                        </Tag>
                      </span>
                    }
                    description={item.description}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Tag icon={<CheckCircleOutlined />} color="green">
                      在库 {item.stock.available}
                    </Tag>
                    <Tag icon={<ClockCircleOutlined />} color="orange">
                      消毒中 {item.stock.cleaning}
                    </Tag>
                    <Tag color="blue">借出 {item.stock.borrowed}</Tag>
                    <Tag color="red">维修 {item.stock.maintenance}</Tag>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={10}>
          <Card title="最近动态" loading={loading} style={{ height: '100%' }}>
            <List
              dataSource={[
                ...borrowRequests.slice(0, 3).map((r) => ({
                  type: '借用' as const,
                  content: `${r.elderly_name} 申请 ${r.type.name}`,
                  status: BORROW_STATUS_LABEL[r.status],
                  time: r.created_at,
                  color: 'blue',
                })),
                ...reservations.slice(0, 3).map((r) => ({
                  type: '预约' as const,
                  content: `${r.elderly_name} 预约 ${r.type.name}`,
                  status: RESERVATION_STATUS_LABEL[r.status],
                  time: r.created_at,
                  color: 'purple',
                })),
              ]
                .sort(
                  (a, b) =>
                    new Date(b.time).getTime() - new Date(a.time).getTime(),
                )
                .slice(0, 5)}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <span>
                        <Tag color={item.color}>{item.type}</Tag>
                        {item.content}
                      </span>
                    }
                    description={new Date(item.time).toLocaleString('zh-CN')}
                  />
                  <Tag>{item.status}</Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
