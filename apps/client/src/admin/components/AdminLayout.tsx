import React from 'react';
import { Layout, Menu, theme } from 'antd';
import {
  DashboardOutlined,
  ToolOutlined,
  FileTextOutlined,
  InboxOutlined,
  ShoppingCartOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const menuItems = [
  {
    key: '/dashboard',
    icon: React.createElement(DashboardOutlined),
    label: '工作台概览',
  },
  {
    key: '/equipment',
    icon: React.createElement(ToolOutlined),
    label: '设备管理',
  },
  {
    key: '/borrow-requests',
    icon: React.createElement(FileTextOutlined),
    label: '借用申请',
  },
  {
    key: '/warehouse/ship',
    icon: React.createElement(ShoppingCartOutlined),
    label: '仓管-发货',
  },
  {
    key: '/warehouse/return',
    icon: React.createElement(InboxOutlined),
    label: '仓管-归还',
  },
  {
    key: '/reservations',
    icon: React.createElement(CalendarOutlined),
    label: '管家-服务预约',
  },
];

export function AdminLayout() {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const location = useLocation();
  const navigate = useNavigate();

  const selectedKey = menuItems.find((item) =>
    location.pathname.startsWith(item.key),
  )?.key || '/dashboard';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={230} theme="light">
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            fontWeight: 700,
            color: '#1677ff',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          🏥 康复器械平台
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0, paddingTop: 8 }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <span style={{ fontSize: 18, fontWeight: 600 }}>管理控制台</span>
          <span style={{ marginLeft: 'auto', color: '#888' }}>
            管理员 👤
          </span>
        </Header>
        <Content
          style={{
            margin: 24,
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            minHeight: 'calc(100vh - 112px)',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
